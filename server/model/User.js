const mongoose = require("mongoose")
const Schema = require("mongoose").Schema

const UserSchema = new Schema({
	googleID: {
		type: String,
		trim: true,
	},
	facebookID: {
		type: String,
		trim: true,
	},
	displayName: {
		type: String,
		trim: true,
		required: true,
	},
	username: {
		type: String,
		trim: true,
	},
	image: {
		type: String,
		trim: true,
	},
	password: {
		type: String,
	},
	createAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model("User", UserSchema)
