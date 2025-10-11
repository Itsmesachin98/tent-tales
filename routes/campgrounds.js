const express = require("express");
const router = express.Router();

const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const { campgroundSchema } = require("../schemas");

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

router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id", async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );
        res.render("campgrounds/show", { campground });
    } catch (e) {
        next(e);
    }
});

router.get("/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
});

router.post("/", validateCampground, async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

router.put("/:id", validateCampground, async (req, res) => {
    const { id } = req.params;
    const { title, location } = req.body.campground;
    const campground = await Campground.findByIdAndUpdate(id, {
        title,
        location,
    });
    res.redirect(`/campgrounds/${campground._id}`);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
});

module.exports = router;
