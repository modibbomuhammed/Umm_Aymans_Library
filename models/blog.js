const mongoose 			= require('mongoose'),
	  mongoosePaginate 	= require('mongoose-paginate-v2');

var commentSchema = new mongoose.Schema({
	name: String,
	email: String,
	comment: String
})


var blogSchema = new mongoose.Schema({
	title: String,
	content: String,
	image: {
		url: String,
		public_id: String
	},
	comments: [ commentSchema ],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	date: { type: Date, default: Date.now() }
})


blogSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Blog', blogSchema);