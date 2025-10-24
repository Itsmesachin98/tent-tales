const express = require("express");
const router = express.Router();

const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");
const mongoose = require("mongoose");

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id", async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id)
            .populate("reviews")
            .populate("author");
        res.render("campgrounds/show", { campground });
    } catch (e) {
        next(e);
    }
});

// GET route for editing a campground
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        const campground = await Campground.findById(id);

        // Check if the campground exists
        if (!campground) {
            req.flash("error", "Cannot find that campground!");
            return res.redirect("/campgrounds");
        }

        // Check if the logged-in user is the author of the campground
        if (!campground.author.equals(req.user._id)) {
            req.flash(
                "error",
                "You do not have permission to edit this campground."
            );
            return res.redirect(`/campgrounds/${id}`);
        }

        // Render the edit form
        res.render("campgrounds/edit", { campground });
    } catch (err) {
        console.error("Error fetching campground for edit:", err);
        req.flash(
            "error",
            "Something went wrong while trying to edit the campground."
        );
        res.redirect("/campgrounds");
    }
});

router.post("/", isLoggedIn, validateCampground, async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
});

router.put("/:id", isLoggedIn, validateCampground, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    const { title, location } = req.body.campground;
    await Campground.findByIdAndUpdate(id, { title, location });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
});

module.exports = router;
