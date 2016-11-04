var mongoose = require('mongoose')

var Schema = mongoose.Schema

var UrbSchema = new Schema({
	name: { type: String },
	Date: { type: Date, default: Date.now }
})

var urbs = mongoose.model('urbs', UrbSchema)

module.exports = urbs
