const LocalStrategy = require("passport-local").Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy
const FacebookStrategy = require("passport-facebook").Strategy
const User = require("../model/User")
const bcrypt = require("bcryptjs")

module.exports = function passportLogins(passport) {
	return (req, res, next) => {
		passport.use(
			new LocalStrategy(async (username, password, done) => {
				await User.findOne({
					username,
				}).then((user) => {
					if (!user) {
						return done(null, false, {
							message: "That username is not registered",
						})
					}

					bcrypt.compare(password, user.password, (err, isMatch) => {
						if (err) throw err

						if (isMatch) {
							return done(null, user)
						} else {
							return done(null, false, {
								message: "Password Incorrect",
							})
						}
					})
				})
			})
		)

		passport.use(
			new GoogleStrategy(
				{
					clientID: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					callbackURL: "/auth/google/callback",
				},
				async (accessToken, refreshToken, profile, done) => {
					const createGoogleUser = {
						googleID: profile.id,
						displayName: profile.displayName,
						image: profile.photos[0].value,
					}

					try {
						let user = await User.findOne({
							googleID: profile.id,
						})

						if (user) {
							done(null, user)
						} else {
							user = await User.create(createGoogleUser)
							done(null, user)
						}
					} catch (err) {
						console.error(err)
					}
				}
			)
		)

		passport.use(
			new FacebookStrategy(
				{
					clientID: process.env.FACEBOOK_APP_ID,
					clientSecret: process.env.FACEBOOK_APP_SECRET,
					callbackURL: "/auth/facebook/callback",
					profileFields: ["id", "displayName", "photos", "email"],
					enableProof: true,
				},
				async (accessToken, refreshToken, profile, done) => {
					const createNewFacebookUser = {
						facebookID: profile.id,
						displayName: profile.displayName,
						image: profile.photos[0].value,
					}

					try {
						let user = await User.findOne({
							accountID: profile.id,
						})

						if (user) {
							done(null, user)
						} else {
							user = await User.create(createNewFacebookUser)
							done(null, user)
						}
					} catch (err) {
						console.error(err)
					}
				}
			)
		)

		passport.serializeUser((user, done) => {
			done(null, user.id)
		})

		passport.deserializeUser((id, done) => {
			User.findById(id, (err, user) => done(err, user))
		})

		next()
	}
}
