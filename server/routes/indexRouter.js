const router = require("express").Router()
const passport = require("passport")

const createAccount = require("../middleware/registrationHandler")

const { accessRequired, routeGuard } = require("../middleware/config")

router.get("/", routeGuard(), (req, res) => res.render("login"))

router.get("/dashboard", accessRequired(), (req, res) =>
	res.render("dashboard")
)

router.get("/signup", routeGuard(), (req, res) => res.render("signup"))
router.post("/signup", createAccount())

router.post("/login", async (req, res, next) => {
	await passport.authenticate("local", {
		successRedirect: "/dashboard",
		failureRedirect: "/",
		failureFlash: true,
	})(req, res, next)
})

router.get(
	"/auth/google",
	passport.authenticate("google", {
		scope: ["profile"],
	})
)

router.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/",
	}),
	(req, res) => {
		res.redirect("/dashboard") // Successful authentication, redirect createuser.
	}
)

router.get("/auth/facebook", passport.authenticate("facebook"))

router.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", {
		failureRedirect: "/",
	}),
	(req, res) => {
		// Successful authentication, redirect createuser.
		res.redirect("/dashboard")
	}
)

router.get("/logout", (req, res, next) => {
	req.logout()
	req.flash("success_message", "You are logged out")
	res.redirect("/")
})

module.exports = router
