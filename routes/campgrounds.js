const express = require("express");
const router = express.Router();

const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
    .route("/")
    .get(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        async (req, res) => {
            const campground = new Campground(req.body.campground);
            campground.images = req.files.map((file) => ({
                url: file.path,
                filename: file.filename,
            }));
            campground.author = req.user._id;
            await campground.save();
            req.flash("success", "Successfully made a new campground");
            res.redirect(`/campgrounds/${campground._id}`);
        }
    );

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router
    .route("/:id")
    .get(async (req, res, next) => {
        try {
            const campground = await Campground.findById(req.params.id)
                .populate({ path: "reviews", populate: { path: "author" } })
                .populate("author");

            if (!campground) {
                req.flash("error", "Cannot find that campground!");
                return res.redirect("/campgrounds");
            }

            res.render("campgrounds/show", { campground });
        } catch (e) {
            next(e);
        }
    })
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("image"),
        validateCampground,
        async (req, res) => {
            const { id } = req.params;
            const campground = await Campground.findByIdAndUpdate(id, {
                ...req.body.campground,
            });
            const imgs = req.files.map((f) => ({
                url: f.path,
                filename: f.filename,
            }));
            campground.images.push(...imgs);
            await campground.save();
            req.flash("success", "Successfully updated campground");
            res.redirect(`/campgrounds/${campground._id}`);
        }
    )
    .delete(isLoggedIn, isAuthor, async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    });

router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
});

module.exports = router;
