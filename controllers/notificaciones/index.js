var Notificacion = require('../../models/notificaciones/index.js')
var FindUserData = require('../../controllers/find_user_data/index.js')
var GetDatePretty = require('../../controllers/get_date_pretty/index.js')

var config = require('../../config')

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

function GetNotificationsCounter (room_id, cb) {

	// Contador de notificaciones nuevas
	Notificacion.find(function (err, notificaciones) {
		if(err) {
			return cb(err)
		}

		// Filtrando notificaciones por usuario 
		var my_notificaciones = notificaciones.filter(function (element) {
			return element.users.user_receptor === room_id
		})

		// Filtrando mis notificaciones, no leidas
		var notificaciones_read = my_notificaciones.filter(function (element) {
			return element.status_lectura === config.card_status.no_read
		})

		// Contrador de notificaciones. No leidas
		var count = notificaciones_read.length

		// Enviando notificaciones. No leidas
		console.log('Cantidiad de notificneas')
		console.log(count)

		var data = {
			count: count,
			room_id: room_id
		}

		cb(err, data)

	})

}

module.exports.time = function (io) {

	// console.log('Lectura del modulo en controllers22222')
	var notio = io.of('/notificaciones-io')

	// Connection all sockets
	this.connect = function () {

		notio.on('connection', function (socket) {
			console.log(`Usuario de Campo Connectado a /notificaciones-io NOTIFICACIONES ${socket.id}`)

			// Connection por room
			socket.on('NotificationsRoom', function(NotificationsRoom) {
				console.log('Campo /notificaciones-io NOTIFICACIONES ROOM session Is : ' + NotificationsRoom)

			    // Si el usuario ya esta suscrito a otro NotificationsRoom, sale de ese y se une al nuevo
				if(socket.NotificationsRoom) {
					socket.leave(socket.NotificationsRoom)
				}

				// Uniendo al usuario al nuevo NotificationsRoom
			 	socket.NotificationsRoom = NotificationsRoom
			    console.log('EL valor del socket.NotificationsRoom: ' + socket.NotificationsRoom)
			  	socket.join(NotificationsRoom)

			})

		})
	}

	this.notificar = function (room_id, message) {
		console.log('Funcion ejecutada, message enviado')

		console.log('Socket del usuario conectado')
		console.log('Socket enviado: ' + room_id)
		//console.log(this.socket.NotificationsRoom)

		GetNotificationsCounter(room_id, function (err, data_response){
			if(err) {
				return console.log('No se pudo obtener el numero total de notificaciones no leidad: ' + err)
			}

			notio.to(data_response.room_id).emit('notis_counter', data_response.count)

		})

		// Obteniendo datos del usuario, notificaciones con info de usuarios
		RenderNotification(message, function (err, new_noti_real) {
			if(err) {
				return res.status(200).json({
					status: 'error',
					error: err
				})
			}

			console.log('NUEVA Notificacion')
			console.log(new_noti_real)

			// io.emit('notis_one_user', new_noti)
		 	console.log('ALIVE')

			notio.to(room_id).emit('notis_one_user', new_noti_real)

		})

	}
}



