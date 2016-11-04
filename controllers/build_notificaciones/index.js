
var FindUserData = require('../../controllers/find_user_data/index.js')
var GetDatePretty = require('../../controllers/get_date_pretty/index.js')

function RenderNotification (noti_element, cb) {

	var new_noti = {
		_id: 				 noti_element._id,
		work_order_id:  	 noti_element.work_order_id,
		codigo_orden:  	 	 noti_element.codigo_orden,
		users:  {
			user_emiter:  	 noti_element.users.user_emiter,
			user_receptor:   noti_element.users.user_receptor
		},
		type_notification:   noti_element.type_notification,
		type_service:   	 noti_element.type_service,
		type_answer: 		 noti_element.type_answer,
		content: 	 {
			title:   	 noti_element.content.title,
			detalle: 	 noti_element.content.detalle,
			multimedia:  noti_element.content.multimedia
		},
		message_copy: {
			detalle:    noti_element.message_copy.detalle
		},
		status_lectura:  noti_element.status_lectura,
		fecha_creacion:  noti_element.fecha_creacion
	}

	FindUserData(noti_element.users.user_emiter, function (err, user_found) {
		if(err) {
			return cb(err)
		}

		new_noti.users.user_emiter = {
			_id: 		user_found._id,
			username:   user_found.username,
			photo:      user_found.photo,
			full_name:  user_found.full_name
		}

		// Obteniendo fecha legible
		GetDatePretty(noti_element.fecha_creacion, function (date_template) {

			// Asignando fecha legible
			new_noti.fecha_creacion = date_template

			cb(err, new_noti)

		})

	})	

}


function BuildNotificaciones(my_notificaciones, cb) {

	// console.log(my_notificaciones)

	// console.log('HEREEE DENTRO ----------')
	var new_arr_notificaciones = []

	// Render lectura, notificaciones con info de usuarios
	
	for(var d = 0; d <= my_notificaciones.length - 1; d++) {
		var noti = my_notificaciones[d]

		RenderNotification(noti, function(err, noti_render) {
			if(err) {
				return res.status(200).json({
					status: 'Error',
					error: err
				})
			}

			new_arr_notificaciones.push(noti_render)

			// Validando Tamaño de posicion
			if(my_notificaciones.length === new_arr_notificaciones.length) {

				cb(err, new_arr_notificaciones)

			}

  		})
		
	}

}

module.exports = BuildNotificaciones
