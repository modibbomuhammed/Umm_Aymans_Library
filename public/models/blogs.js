const mongoose 	= require('mongoose');
	

let blogSchema = new mongoose.Schema({
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
			},
			username: String,
	}
})


module.exports = mongoose.model("Blog", blogSchema);


