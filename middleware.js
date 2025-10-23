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

module.exports = { isLoggedIn, storeReturnTo };
