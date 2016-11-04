var TrackSchema = require('../../models/usuarios/tracking_users/index.js')
var Users = require('../../models/usuarios/index.js')
var Contratistas = require('../../models/usuarios/contratistas/index.js')
var Empresas = require('../../models/usuarios/empresas_clientes/index.js')
var Work_Order = require('../../models/orden_trabajo/index.js')

var FindUserData = require('../../controllers/find_user_data/index.js')
var GetDatePretty = require('../../controllers/get_date_pretty/index.js')

function time (io) {
	//io.adapter(redis({ host: 'localhost', port: 6379 }))

	console.log('Lectura de llamado io')

	// Connection all sockets
	var trackio = io.of('/tracking-io')

	trackio.on('connection', function (socket) {
		console.log(`Usuario de Campo Connectado a /tracking-io con ${socket.id}`)

		// Connection por room
		socket.on('TrackRoom', function(TrackRoom) {
			console.log('Campo /tracking-io Room session Is : ' + TrackRoom)
		    // Si el usuario ya esta suscrito a otro TrackRoom, sale de ese y se une al nuevo
			if(socket.TrackRoom) {
				socket.leave(socket.TrackRoom)
			}

			// Uniendo al usuario al nuevo TrackRoom
		 	socket.TrackRoom = TrackRoom
		    console.log('EL valor del /tracking-io socket.TrackRoom: ' + socket.TrackRoom)
		  	socket.join(TrackRoom)

		})

		// Socket escucha: track_one_user
		socket.on('Track_one_user', function (content) {
			console.log(`/tracking-io Coordenada del usuario: ${content.user_id}. Fecha: ${content.date}  . Coordenadas: X: ${content.coordX} , Y: ${content.coordY}`)

			// Buscando track de usuario de coordenas en la base de datos
			TrackSchema.findOne({'user_id': content.user_id}, function (err, trackUser) {
				if(err) {
					return console.log('Error al encontrar historial de track de usuario: ' + err)
				}

				if(trackUser === null ||
				   trackUser === undefined || 
				   trackUser.track_info.length === 0) {

					console.log('El usuario no tiene historial de tracking en la base de datos')
					console.log('Creando nuevo historial')

					// Declarando nuevo historial de tracking
					var trackUserItem = new TrackSchema({
						user_id: content.user_id
					})

					// Data to intruduce
					var coord_info = {
						date:   content.date,
						coordX: content.coordX,
						coordY: content.coordY
					}

					// Añadiendo position data, to tracking
					trackUserItem.track_info.push(coord_info)

					// Guardando historial de tracking
					trackUserItem.save(function (err) {
						if(err) {
							return console.log('Error al guardar el track del usuario en la base de datos: ' + err)
						}

						console.log('El track del usuario fue guardado en la base de datos')
						

						// Obteniendo datos del usuario
						
						FindUserData(content.user_id, function (err, user_real_naming) {
							if(err) {
								return res.status(200).json({
									status: 'error',
									error: err
								})
							}

							GetDatePretty(content.date, function (new_date_track) {

								var trackin_real_time_item = {
									user:     user_real_naming,
									date:     new_date_track,
									coordX:   content.coordX,
									coordY:   content.coordY
								}

								console.log('TRACK BONITO')
								console.log(trackin_real_time_item)

								// Enviar resultados al room
								trackio.to(socket.TrackRoom).emit('Track_one_user', trackin_real_time_item)
								
								// Enviando informacion del usuario. Vista general Cartel

								// Enviar la ultima posicion de ete usuario conectado
								trackio.emit('Track_users', trackin_real_time_item) //contenta

							})

						})
						
					})

				} else {
					// Historial tracking, encontrado en la base de datos

					// Data to intruduce
					var coord_info = {
						date:   content.date,
						coordX: content.coordX,
						coordY: content.coordY
					}

					// Añadiendo position data, to tracking
					trackUser.track_info.push(coord_info)

					// Actualizando historial
					trackUser.save(function (err) {
						if(err) {
							return console.log('Error al guardar track user en la base de datos: ' + err)
						}
						
						console.log('El track de usuario fue capturado y guardado en la base de datos')	
						
						// Obteniendo datos del usuario

						FindUserData(content.user_id, function (err, user_real_naming) {
							if(err) {
								return res.status(200).json({
									status: 'error',
									error: err
								})
							}

							GetDatePretty(content.date, function (new_date_track) {

								var trackin_real_time_item = {
									user:     user_real_naming,
									date:     new_date_track,
									coordX:   content.coordX,
									coordY:   content.coordY
								}

								console.log('TRACK BONITO')
								console.log(trackin_real_time_item)

								// Enviar resultados al room
								trackio.to(socket.TrackRoom).emit('Track_one_user', trackin_real_time_item)
								
								// Enviando informacion del usuario. Vista general Cartel

								// Enviar la ultima posicion de ete usuario conectado
								trackio.emit('Track_users', trackin_real_time_item) //contenta

							})

						})

					})

				}

			})

		})
	
		socket.on('disconnect', function(content2){
			console.log('se ha desconectado del trabajo')
			console.log(content2)
		})

	})

}

module.exports = time
