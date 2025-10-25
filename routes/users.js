const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

router
    .route("/register")
    .get((req, res) => {
        res.render("users/register");
    })
    .post(async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome to Yelp Camp!");
                res.redirect("/campgrounds");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    });

router
    .route("/login")
    .get((req, res) => {
        res.render("users/login");
    })
    .post(
        storeReturnTo,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        (req, res) => {
            req.flash("success", "welcome to tent tales");
            const redirectUrl = res.locals.returnTo || "/campgrounds";
            res.redirect(redirectUrl);
        }
    );

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged you out successfully!");
        res.redirect("/campgrounds");
    });
});

module.exports = router;
