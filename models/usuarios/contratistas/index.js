var mongoose = require('mongoose')
var Schema = mongoose.Schema 

var contratistaSchema = new Schema({
	name:     	   { type: String },
	empresa:  	   { type: String },
	fecha_creada:  { type: Date, default: Date.now }
})

var contratista_model = mongoose.model('contratistamodels', contratistaSchema)

module.exports = contratista_model
