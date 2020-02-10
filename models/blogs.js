const mongoose 	= require('mongoose');
	

let blogScheme = new mongoose.Schema({
	title: String,
	content: String,
	image: String,
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}],
	date: {type: Date, default: Date.now},
	author:{
		id:{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
		// default: "Aisha_Mai"
		},
		username: String
	}
})


module.exports = new mongoose.model("Blog", blogScheme);


