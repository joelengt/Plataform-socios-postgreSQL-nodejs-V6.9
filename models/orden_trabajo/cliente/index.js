
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var clienteSchema = new Schema ({
	cliente_id:  			 { type: String },
	codigo_orden_trabajo:    { type: String },
	numero_cliente: 		 { type: String },
	codigo_via: 	   		 { type: String },  // nombre via
	distrito: 				 { type: String },  // distrito
	urbanizacion: 			 { type: String },  // urbanizacion
	numero_puerta: 			 { type: String },
	numero_interior: 		 { type: String },
	manzana: 				 { type: String },
	lote: 					 { type: String },
	nombre_de_cliente: 		 { type: String },
	type_residencial:  		 { type: Boolean },
	is_maximetro_bt: 		 { type: Boolean },
	suministro_derecha:  	 { 
								coordX: { type: String },
								coordY: { type: String },
								value:  { type: String }
							 },
	suministro_izquierda:    {  
								coordX: { type: String },
								coordY: { type: String },
								value:  { type: String }
							 },
	poste_cercano:  		 {	
								coordX: { type: String },
								coordY: { type: String },
								value:  { type: String }
							 },
	medidor_derecha:    	 { type: String },
	medidor_izquierda:  	 { type: String },
	type_conexion: 			 { type: String },
	type_acometida: 		 { type: String },
	type_cable_acometida:    { type: String },
	calibre_cable_acometida: { type: String },
	calibre_cable_matriz:    { type: String },
	observaciones: 			 { type: String },
	fecha_ejecucion: 		 { type: String },
	imagen_cliente: 		 [{}],
	croquis: 				 {},
	coordenada_X: 			 { type: String },
	coordenada_Y: 			 { type: String },
	fecha_creada: 		     { type: Date, default: Date.now }
})

var clientes = mongoose.model('clientes', clienteSchema)

module.exports = clientes
