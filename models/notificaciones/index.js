var mongoose = require('mongoose')
var Schema = mongoose.Schema

var notificacionesSchema = new Schema({
	work_order_id:  	 { type: String },
	codigo_orden:  	 	 { type: String },
	users:  {
		user_emiter:     { type: String },
		user_receptor:   { type: String }
	},
	type_notification:   { type: String },
	type_service:   	 { type: String },
	type_answer: 		 { type: String },
	content: 	 {
		title:   	 { type: String },
		detalle: 	 { type: String },
		multimedia:  [{}]
	},
	message_copy: {
		detalle: { type: String }
	},
	status_lectura:  	 { type: Boolean },
	fecha_creacion:  	 { type: Date, default: Date.now }
})

var notificaciones = mongoose.model('notificaciones', notificacionesSchema)

module.exports = notificaciones
