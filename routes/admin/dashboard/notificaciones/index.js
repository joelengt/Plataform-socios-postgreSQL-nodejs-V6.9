var express = require('express')
var app = express.Router()

var Notificacion = require('../../../../models/notificaciones/index.js')

var BuildNotificaciones = require('../../../../controllers/build_notificaciones/index.js')
var FindUserData = require('../../../../controllers/find_user_data/index.js')
var GetDatePretty = require('../../../../controllers/get_date_pretty/index.js')

var Work_Order = require('../../../../models/orden_trabajo')

var config = require('../../../../config.js')
var users_type = config.users_access

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next()

	    console.log('El usuario no esta autentificado. Requiere logearse')
	    res.status(403).json({
	      status: 'not_access',
	      message: 'El usuario no esta autentificado. Requiere logearse'
	    })
}

// Lista de Notificaiones : Limite Ultimate 0 to 20
app.get('/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		//console.log('Notificiones esperando respuesta')
		// Leyendo a todas las notificaciones
		Notificacion.find(function(err, notificaciones) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar lista de notificaciones',
					error: err
				})
			}

			var new_arr_notificaciones = []

			if(notificaciones.length === 0) {
				
				console.log('NO hay notificaicones para nadie')

				res.status(200).json({
					status: 'notificaciones_cero',
					message: 'Notificaciones 0 Pendientes',
					notificaciones_cant_news: 0,
					notificaciones: new_arr_notificaciones
				})

			} else {

				// id de usuario
				var user_id = JSON.stringify(req.user._id)
				user_id = JSON.parse(user_id)

				// Filtrando notificaciones por usuario 
				var my_notificaciones_ = notificaciones.filter(function (element) {
					return element.users.user_receptor === user_id
				})

				// Filtrando mis notificaciones, no leidas
				var notificaciones_read_max = my_notificaciones_.filter(function (element) {
					return element.status_lectura === config.card_status.no_read
				})

				var my_notificaciones = []

				// Limitando notificaciones legibles
				for(var z = 0; z <= 20; z++) {
					if(my_notificaciones_[z] === undefined) {
					            
					    break
					     
					} else {
					      
						my_notificaciones.push(my_notificaciones_[z])

					}
					
				}

				if(my_notificaciones.length === 0) {
					
					my_notificaciones = []

					//console.log('No hay notificiones para tu usuario')

					res.status(200).json({
						status: 'notificaciones_cero',
						message: 'Notificaciones 0 Pendientes',
						user: req.user,
						notificaciones_cant_news: 0,
						notificaciones: my_notificaciones
					})

				} else {
					console.log('Esperando notis')
					process.nextTick(function () {

						console.log('Atancando notis')
				        // do something
					   	BuildNotificaciones(my_notificaciones, function (err, get_my_notificaciones) {
						   	if(err) {
						   		return res.status(500).json({
						   			status: 'error_server',
						   			message: 'Error al encontrar lista de notificaciones',
						   			error: err
						   		})
						   	}
						   	
						   	if(get_my_notificaciones.length === 0 || 
						   	   get_my_notificaciones === null ||
						   	   get_my_notificaciones === undefined) {
						   		
						   		console.log('Las notificaciones no hay nada')

						   		res.status(200).json({
						   			status: 'notificaciones_cero',
						   			error:  'Las notificiones no fueron filtradas en la base de datos'
						   		})
						   	} else {

						   		// Filtrando mis notificaciones, no leidas
						   		/*var notificaciones_read = get_my_notificaciones.filter(function (element) {
						   			return element.status_lectura === config.card_status.no_read	
						   		})*/

						   		get_my_notificaciones.reverse()

						   		/*
						   		console.log('-------------------------------------')
						   		console.log('NOTIFICIONES LISTAS!!!!!')

						   		console.log(get_my_notificaciones)
						   		console.log('FINAL DE NOTIFICIONES!!!')

						   		console.log('DATOS DE NOTIFICACIONES - Llegada!!!')
						   		console.log('-------------------------------------')
						   		*/

						   		res.status(200).json({
						   			status: 'ok',
						   			message: 'Notificaciones Pendientes',
						   			user: req.user,
						   			notificaciones_cant_news: notificaciones_read_max.length,
						   			notificaciones: get_my_notificaciones
						   		})	

						   	}
					   	
					   	})

					})

				}

			}

		})
		
	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
		res.status(403).json({
			status: 'not_access',
			message: 'El usuario no esta autentificado. Requiere logearse'
		})
	}
})

app.get('/more', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		//console.log('Notificiones esperando respuesta')
		// Leyendo a todas las notificaciones
		Notificacion.find(function(err, notificaciones) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar lista de notificaciones',
					error: err
				})
			}

			var new_arr_notificaciones = []

			if(notificaciones.length === 0) {
				
				console.log('NO hay notificaicones para nadie')

				res.status(200).json({
					status: 'notificaciones_cero',
					message: 'Notificaciones 0 Pendientes',
					notificaciones_cant_news: 0,
					notificaciones: new_arr_notificaciones
				})

			} else {

				// id de usuario
				var user_id = JSON.stringify(req.user._id)
				user_id = JSON.parse(user_id)

				// Filtrando notificaciones por usuario 
				var my_notificaciones = notificaciones.filter(function (element) {
					return element.users.user_receptor === user_id
				})

				if(my_notificaciones.length === 0) {
					
					my_notificaciones = []

					//console.log('No hay notificiones para tu usuario')

					res.status(200).json({
						status: 'notificaciones_cero',
						message: 'Notificaciones 0 Pendientes',
						user: req.user,
						notificaciones_cant_news: 0,
						notificaciones: my_notificaciones
					})

				} else {
					console.log('Esperando notis')
					process.nextTick(function () {

						console.log('Atancando notis')
				        // do something
					   	BuildNotificaciones(my_notificaciones, function (err, get_my_notificaciones) {
						   	if(err) {
						   		return res.status(500).json({
						   			status: 'error_server',
						   			message: 'Error al encontrar lista de notificaciones',
						   			error: err
						   		})
						   	}
						   	
						   	if(get_my_notificaciones.length === 0 || 
						   	   get_my_notificaciones === null ||
						   	   get_my_notificaciones === undefined) {
						   		
						   		console.log('Las notificaciones no hay nada')

						   		res.status(200).json({
						   			status: 'notificaciones_cero',
						   			error:  'Las notificiones no fueron filtradas en la base de datos'
						   		})
						   	} else {

						   		// Filtrando mis notificaciones, no leidas
						   		var notificaciones_read = get_my_notificaciones.filter(function (element) {
						   			return element.status_lectura === config.card_status.no_read	
						   		})

						   		get_my_notificaciones.reverse()

						   		/*
						   		console.log('-------------------------------------')
						   		console.log('NOTIFICIONES LISTAS!!!!!')

						   		console.log(get_my_notificaciones)
						   		console.log('FINAL DE NOTIFICIONES!!!')

						   		console.log('DATOS DE NOTIFICACIONES - Llegada!!!')
						   		console.log('-------------------------------------')
						   		*/

						   		res.status(200).json({
						   			status: 'ok',
						   			message: 'Notificaciones Pendientes',
						   			user: req.user,
						   			notificaciones_cant_news: notificaciones_read.length,
						   			notificaciones: get_my_notificaciones
						   		})	

						   	}
					   	
					   	})

					})

				}

			}

		})
		
	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
		res.status(403).json({
			status: 'not_access',
			message: 'El usuario no esta autentificado. Requiere logearse'
		})
	}
})

app.get('/get/no_read', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		Notificacion.find(function (err, notificaciones) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar lista de notificaciones',
					error: err
				})
			}

			if(notificaciones.length === 0) {

				console.log('No hay notificaciones en la DB')
				
				res.status(200).json({
					status: 'not_found',
					notification_no_read_count: 0
				})

			} else {

				// id de usuario
				var user_id = JSON.stringify(req.user._id)
				user_id = JSON.parse(user_id)

				// Filtrando notificaciones por usuario
				var my_notificaciones = notificaciones.filter(function (element) {
					return element.users.user_receptor === user_id
				})

				// Filtrando mis notificaciones, no leidas
				var notificaciones_read = my_notificaciones.filter(function (element) {
					return element.status_lectura === config.card_status.no_read
				})

				if(notificaciones_read.length === 0 ) {
					res.status(200).json({
						status: 'not_found',
						notification_no_read_count: 0
					})

				} else {

					console.log('Notificaciones no leidas')
					console.log(notificaciones_read.length)

					res.status(200).json({
						status: 'ok',
						notification_no_read_count: notificaciones_read.length
					})

				}

			}

		})
		
	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
		res.status(403).json({
			status: 'not_access',
			message: 'El usuario no esta autentificado. Requiere logearse'
		})
	}
})

// Cambiando estado de lectura de una notificacion
app.put('/:notificacion_id/change-to-read', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		var notificacion_id = req.params.notificacion_id

		var noti = {
			status_lectura: config.card_status.read
		}

		// Editando el estado de la notificaion
		Notificacion.update({'_id': notificacion_id}, noti, function(err) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al actualizar el estado de la notificacion',
					error: err
				})

			}

			console.log('Notificacion - estado leido')

			// Leyendo la notificacion
			Notificacion.findById({'_id': notificacion_id}, function(err, notificacion) {
				if(err) {
					return res.status(500).json({
						status: 'error_server',
						message: 'Error al encontrar las notificaciones en la base de datos',
						error: err
					})
				}

				FindUserData(notificacion.users.user_emiter, function (err, user_found) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar al usuario en la base de datos',
							error: err
						})
					}

					var new_noti = {
						_id: 			     notificacion._id,
						work_order_id:  	 notificacion.work_order_id,
						codigo_orden:  	 	 notificacion.codigo_orden,
						users:  {
							user_emiter: {
								_id: 	   user_found._id,
								username:  user_found.username,
								photo:     user_found.photo,
								full_name: user_found.full_name
							},
							user_receptor:   notificacion.users.user_receptor
						},
						type_notification:   notificacion.type_notification,
						type_service:   	 notificacion.type_service,
						type_answer: 		 notificacion.type_answer,
						content: 	 {
							title:   	 notificacion.content.title,
							detalle: 	 notificacion.content.detalle,
							multimedia:  notificacion.content.multimedia
						},
						message_copy: {
							detalle:    notificacion.message_copy.detalle
						},
						status_lectura:  notificacion.status_lectura,
						fecha_creacion:  notificacion.fecha_creacion
					}

					// Obteniendo fecha legible
					GetDatePretty(notificacion.fecha_creacion, function (date_template) {

						// Asignando fecha legible
						new_noti.fecha_creacion = date_template

						res.status(200).json({
							status: 'ok',
							message: 'Notificacion, cambiada a read',
							user: req.user,
							notificacion: new_noti
						})

						
					})

				})
				
			})

		})
		
	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
		res.status(403).json({
			status: 'not_access',
			message: 'El usuario no esta autentificado. Requiere logearse'
		})
	}
})

// Buscando notificaciones tipo reporte
app.get('/find-by-work/:work_order_id', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
	   
	   var work_order_id = req.params.work_order_id

	    Notificacion.find(function (err, notis) {
	    	if(err){
	     		return res.status(200).json({
	     			status: 'error_server',
	     			error: err
	     		})
	    	}

	    	// Filtrando notificaciones que pertenecen a la orden
	    	var notis_this_order = notis.filter(function (element) {
	    		return element.work_order_id === work_order_id
	    	})

	    	if(notis_this_order.length === 0) {

	    		res.status(200).json({
	    			status: 'not_found',
	    			message: 'Hay 0 notificaciones para esta orden de trabajo'
	    		})

	    	} else {

		    	// Filtrando notificiones de la orden que son tipo reporte
				var notis_this_order_reporte = notis_this_order.filter(function (element) {
					return element.type_notification === 'reporte'
				})	   	

				if(notis_this_order_reporte.length === 0) {

					res.status(200).json({
						status: 'not_found',
						message: 'Esta orden de trabajo tiene 0 notificaciones tipo "reporte" '
					})

				} else {

			    	// Asignanado valor de la ultima notificacion
			   		var notificacion = notis_this_order_reporte[notis_this_order_reporte.length - 1]

			   		console.log('NOTIFICAION ENCONTRADA')

			   		console.log(notificacion)

				    FindUserData(notificacion.users.user_emiter, function (err, user_found) {
				     	if(err) {
				     		return res.status(500).json({
				     			status: 'error_server',
				     			message: 'Error al encontrar al usuario en la base de datos',
				     			error: err
				     		})
				     	}

				     	var new_noti = {
				     		_id: 			     notificacion._id,
				     		work_order_id:  	 notificacion.work_order_id,
				     		codigo_orden:  	 	 notificacion.codigo_orden,
				     		users:  {
				     			user_emiter: {
				     				_id: 	   user_found._id,
				     				username:  user_found.username,
				     				photo:     user_found.photo,
				     				full_name: user_found.full_name
				     			},
				     			user_receptor:   notificacion.users.user_receptor
				     		},
				     		type_notification:   notificacion.type_notification,
				     		type_service:   	 notificacion.type_service,
				     		type_answer: 		 notificacion.type_answer,
				     		content: 	 {
				     			title:   	 notificacion.content.title,
				     			detalle: 	 notificacion.content.detalle,
				     			multimedia:  notificacion.content.multimedia
				     		},
				     		message_copy: {
				     			detalle:    notificacion.message_copy.detalle
				     		},
				     		status_lectura:  notificacion.status_lectura,
				     		fecha_creacion:  notificacion.fecha_creacion
				     	}

				     	// Obteniendo fecha legible
				     	GetDatePretty(notificacion.fecha_creacion, function (date_template) {

				     		// Asignando fecha legible
				     		new_noti.fecha_creacion = date_template

				     		res.status(200).json({
				     			status: 'ok',
				     			message: 'Notificacion, cambiada a read',
				     			user: req.user,
				     			notificacion: new_noti
				     		})

				     		
				     	})

				    })

				}
			
	    	}



	   })

	} else {

		console.log('El usuario no esta autentificado. Requiere logearse')
		res.status(403).json({
			status: 'not_access',
			message: 'El usuario no esta autentificado. Requiere logearse'
		})

	}
})

module.exports = app
