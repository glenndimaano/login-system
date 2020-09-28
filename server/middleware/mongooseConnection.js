module.exports = function mongooseConnection(mongoose) {
    return async (req, res, next) => {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useFindAndModify: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            next()
        } catch (error) {
            next(error)
        }
    }
}