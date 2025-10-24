const { campgroundSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const ExpressError = require("./utils/ExpressError");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    res.redirect("/login");
}

function storeReturnTo(req, res, next) {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

async function isAuthor(req, res, next) {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports = {
    isLoggedIn,
    storeReturnTo,
    validateCampground,
    validateReview,
    isAuthor,
};
