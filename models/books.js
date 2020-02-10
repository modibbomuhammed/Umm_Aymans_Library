const mongoose = require('mongoose')

let bookSchema = new mongoose.Schema({
	name: String,
	genre: String,
	pages: Number,
	author: String,
	Date: Date
})

module.exports = mongoose.model('Books', bookSchema);