const mongoose = require('mongoose')

let commentSchema = new mongoose.Schema({
	comment: String,
	date: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		picture: String
	}
}) 

module.exports = new mongoose.model("Comment", commentSchema);