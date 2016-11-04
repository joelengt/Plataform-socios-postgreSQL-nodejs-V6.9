var mongoose = require('mongoose')
var Schema = mongoose.Schema

var work_orderSchema = new Schema({
	codigo_orden:      	         { type: String },
	codigo_supervisor:           { type: String },
	codigo_contratista:          { type: String },
	empresa_admin: 				 { type: String },
	contratista: 				 { type: String },
	tipo_servicio:               { type: String },
	detalle_servicio:            { type: String },
	tipo_urgencia:  	         { type: String },
	cover_image: 				 {},
	coordenada_X:  		         { type: String },
	coordenada_Y:  		         { type: String },
	direccion:                   { type: String },
	descripcion:                 { type: String },
	public:                      { type: Boolean },
	estado:                      { type: String },
	conclusiones:                { type: String },
	fecha_publicado:             { type: String },   // Si el campo public es false, esta data se sobresescribe por nueva fecha al cambiar por public true
	fecha_visita_esperada:       { type: String },
	fecha_trabajo_realizado:     { type: String },
	reprogramado_de:             { type: String },
	elementos:                   [{}],  // Arreglo contenidor de elementos
	fecha_creada: 				 { type: Date, default: Date.now },
	progress_to_complete: 		 { type: Number , default: 0}
})

var work_order = mongoose.model('workorders', work_orderSchema)

module.exports = work_order
 