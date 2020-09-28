const express = require("express")
const expresLayouts = require("express-ejs-layouts")
const mongoose = require("mongoose")
const mongooseConnection = require("./middleware/mongooseConnection")
const session = require("express-session")
const passport = require("passport")
const MongoStore = require("connect-mongo")(session)
const passportLogins = require("./middleware/passportLogins")
const methodOverride = require("method-override")
const helmet = require("helmet")
const flash = require("connect-flash")
const path = require("path")
const app = express()

if (process.env.NODE_ENV === "development") {
	require("dotenv").config()
	app.use(require("morgan")("dev"))
}

app.use(helmet())
app.use(mongooseConnection(mongoose))
app.use(passportLogins(passport))

app.use(
	express.urlencoded({
		extended: true,
	})
)

app.use(
	methodOverride((req, res) => {
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			// look in urlencoded POST bodies and delete it
			let method = req.body._method
			delete req.body._method
			return method
		}
	})
)
app.use(express.json())
app.use(expresLayouts)
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "../public")))

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
		}),
	})
)

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use((req, res, next) => {
	res.locals.user = req.user || null
	res.locals.success_message = req.flash("success_message")
	res.locals.error_message = req.flash("error_message")
	res.locals.error = req.flash("error")
	next()
})

app.use("/", require("./routes/indexRouter"))

app.use((error, req, res, next) => {
	if (process.env.NODE_ENV === "production") {
		res.sendStatus(500)
	} else {
		if (error.status) {
			res.status(error.status)
		} else {
			res.status(500)
		}

		res.json({
			message: error.message,
			stack: error.stack,
		})
	}
})

app.use((req, res, next) => {
	res.send(`Page Not Found - ${req.path}`).status(400)
	next()
})

const PORT = process.env.PORT
app.listen(PORT, () => console.info(`http://localhost:${PORT}`))
