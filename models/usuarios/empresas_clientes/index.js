var mongoose = require('mongoose')
var Schema = mongoose.Schema

var empresaSchema = new Schema({
	name:  { type: String },
	fecha_creada:  { type: Date, default: Date.now }
})

var empresas = mongoose.model('empresas', empresaSchema)

module.exports = empresas