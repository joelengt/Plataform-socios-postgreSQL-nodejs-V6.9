var mongoose = require('mongoose')
var Schema = mongoose.Schema

var kmlSchema = new Schema({
	file:      {},
	empresa:   { type: String },
	type_file: { type: String }
})

var kmls = mongoose.model('kmls', kmlSchema)

module.exports = kmls
