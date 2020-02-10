const mongoose 				= require("mongoose"),
	  passportLocalMongoose	= require('passport-local-mongoose')

let userSchema = new mongoose.Schema({
	username: String,
	password: String,
	picture: String
})


userSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", userSchema)