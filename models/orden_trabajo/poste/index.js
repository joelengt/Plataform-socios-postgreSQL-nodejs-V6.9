var mongoose = require('mongoose')
var Schema = mongoose.Schema

var posteSchema = new Schema ({
	codigo_poste: 		  { type: String },
	codigo_orden_trabajo: { type: String },
	type_poste: 		  { type: String },
	altura_poste: 		  { type: String },
	type_material: 		  { type: String },
	type_pastoral: 		  { type: String },
	type_luminaria: 	  { type: String },
	type_lampara: 	      { type: String },
	coordenada_X: 		  { type: String },
	coordenada_Y:    	  { type: String },
	imagen_poste: 		  [{}],
	observaciones: 		  { type: String },
	estado_poste: 	   	  { type: String },
	estado_pastoral:      { type: String },
	estado_luminaria: 	  { type: String },
	estado_lampara:  	  { type: String },
	fecha_creada: 		  { type: Date, default: Date.now }
})

var postes = mongoose.model('postes', posteSchema)

module.exports = postes
