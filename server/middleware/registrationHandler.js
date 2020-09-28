const bcrypt = require("bcryptjs")
const User = require("../model/User")

module.exports = function createAccount() {
	return async (req, res, next) => {
		const { username, displayName, password, confirmPassword } = req.body

		let errors = []

		if (!username || !displayName || !password || !confirmPassword) {
			errors.push({
				message: "All fields required",
			})
		}

		if (password != confirmPassword) {
			errors.push({
				message: "Password not match",
			})
		}

		if (password.length < 6) {
			errors.push({
				message: "Password too short",
			})
		}

		if (errors.length > 0) {
			res.render("signup", {
				errors,
				username,
				displayName,
			})
		} else {
			const usernameAlreadyExist = await User.findOne({
				username,
			})

			if (usernameAlreadyExist) {
				errors.push({
					message: "Username already taken",
				})
			} else {
				const salt = await bcrypt.genSalt(10)
				const hashedPassword = await bcrypt.hash(password, salt)

				const saveNewUser = new User({
					username,
					displayName,
					password: hashedPassword,
				})

				await saveNewUser
					.save()
					.then((user) => {
						req.flash(
							"success_message",
							"You are now registered and can log in"
						)
						res.redirect("/")
					})
					.catch((error) => {
						next(error)
					})
			}
		}
	}
}
