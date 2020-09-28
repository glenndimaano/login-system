function accessRequired() {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next()
        } else {
            req.flash('error_message', 'Please log in to view that resource');
            res.redirect("/")
        }
    }
}

function routeGuard() {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard")
        } else {
            return next()
        }
    }
}

module.exports = {
    accessRequired,
    routeGuard
}