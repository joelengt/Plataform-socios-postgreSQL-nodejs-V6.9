// require model chat
var path = require('path')
var fs = require('fs')

var Users = require('../../models/usuarios')
var ChatsList = require('../../models/chat')
var ChatsRoom = require('../../models/chat/chat_content')

var config = require('../../config')

var UserConnected = []

// Procesando counter de chat
function GetCounterChats(ultime_msg, cback) {

	// Buscando amigo usuario implicado
	ChatsList.findOne({'chat_content_id': ultime_msg.chat_room_id}, function (err, ChatItem) {
		if(err) {
			return console.log('Error al encontrar chat Item: ' + err)
		}

		var user_friend_id = ''

		// Obteniendo el id del amigo
		for(var v = 0; v <= ChatItem.users.length - 1; v++) {
			var el_chat_user = ChatItem.users[v]
			
			if(el_chat_user.user_id === ultime_msg.user_id) {

				// obteniendo el counter del otro
				if(v === 0) {
					user_friend_id = ChatItem.users[v + 1].user_id

				} else {
					// v = 1
					user_friend_id = ChatItem.users[v - 1].user_id
				}
				
			}

		}

		// Buscando entre todos los elementos de chat Items
		ChatsList.find(function (err, chatItem) {
			if(err) {
				return  cback(err)
			}
			
			var counterMax = 0

			// Filtrando chat, donde el usuario esta incluido
			for(var u = 0; u <= chatItem.length - 1; u++) {
				var el_chatItem = chatItem[u]

				// Buscando entre los usuarios incluidos en el chat
				for(var j = 0; j <= el_chatItem.users.length - 1; j++) {
					var el_chat_user = el_chatItem.users[j]
					
					if(el_chat_user.user_id === user_friend_id) {

						// obteniendo el counter del otro
						if(j === 0) {
							counterMax += el_chatItem.users[j + 1].counter

						} else {
							// j = 1
							counterMax += el_chatItem.users[j - 1].counter
						}
						
					}

				}
			}

			cback(err, counterMax, user_friend_id)

		})

	})

}

function time (io, ss) {
	
	//io.adapter(redis({ host: 'localhost', port: 6379 }))

	//Connetion de todos los sockets
	var chatio = io.of('/chat-io')

	chatio.on('connection', function (socket) {
		console.log(`Connected to /chat-io ChatRoom to friend ${socket.id}`)

		// Connection por room
		socket.on('Chatroom', function(Chatroom) {
			console.log('Room session Is : ' + Chatroom)
		    // Si el usuario ya esta suscrito a otro Chatroom, sale de ese y se une al nuevo
			if(socket.Chatroom) {
				console.log('El usuario, dejo el chat room <<<<')
				socket.leave(socket.Chatroom)
			}

			// Uniendo al usuario al nuevo Chatroom
		 	socket.Chatroom = Chatroom
		    console.log('EL usuario CHAT, se suscribio al chat room : ' + socket.Chatroom)
		  	socket.join(Chatroom)
		})

		socket.on('Chatroom_user', function(Chatroom_user) {
			console.log('User session Is : ' + Chatroom_user)
		    // Si el usuario ya esta suscrito a otro Chatroom_user, sale de ese y se une al nuevo
			if(socket.Chatroom_user) {
				console.log('El usuario, dejo el chat room <<<<')
				socket.leave(socket.Chatroom_user)
			}

			// Uniendo al usuario al nuevo Chatroom_user
		 	socket.Chatroom_user = Chatroom_user
		    console.log('EL usuario CHAT, se suscribio al chat room : ' + socket.Chatroom_user)
		  	socket.join(Chatroom_user)
		})

		ss(socket).on('up_file_to_chat', function(stream, data) {
			console.log('FILE RECIBIDO from : ' + socket.id)
			console.log('data del stream: ----')
			console.log(stream)
			console.log('data del file -----')
			console.log(data)
			console.log('----')

			var filename = path.basename(data.name)
			console.log('filename')
			console.log(filename)
			var new_path = 'uploads/news/' + filename
		    stream.pipe(fs.createWriteStream(new_path))
		    
		})

		socket.on('chat', function (content) {
			console.log('Usuario envio un mensaje: ' + content)
			
			ChatsRoom.findById({'_id': socket.Chatroom}, function (err, chatSalaRoom) {
				if(err) {
					return console.log('Error al hol')
				}

				console.log('Datos de este Room')
				console.log(chatSalaRoom)

				// Obteniendo el nuevo mensaje 
				var new_message = {
					user_id:  content.user_id,
					message: content.message
				}

				if(content.message_multi_data.type === 'without_mutimedia') {
					console.log('El parametro del dato comabio')

					new_message.message_multi_data = {
						type: content.message_multi_data.type
					}

					content.message_multi_data = {
						type: content.message_multi_data.type
					}
				}

				if(content.message_multi_data !== null && 
				   content.message_multi_data.type !== 'without_mutimedia') {
					
					console.log('El parametro del dato comabio')

					new_message.message_multi_data = {
						name: content.message_multi_data.name,
						type: content.message_multi_data.type,
						size: content.message_multi_data.size,
						date: content.message_multi_data.date,
						path: 'news/' + content.message_multi_data.name

					}

					content.message_multi_data = {
						name: content.message_multi_data.name,
						type: content.message_multi_data.type,
						size: content.message_multi_data.size,
						date: content.message_multi_data.date,
						path: 'news/' + content.message_multi_data.name
					}
				}
				
				console.log('Nuevo mensaje agregado')
				console.log(new_message)

				// Guardando Resenñas
				chatSalaRoom.messages.push(new_message)

				// Acumulando contador de mensajes
				chatSalaRoom.count_msgs += 1
					
				chatSalaRoom.save(function (err) {
					if(err) {
						return console.log('Error al guardar el nuevo mensaje: ' + err)
					}

					ChatsList.findOne({'chat_content_id': chatSalaRoom._id}, function (err, chatListItem) {
						if(err) {
							return console.log('Error al encontrar elemento chat en la lsita')
						}
						
						console.log('ChatListItem encontrado')

						// Agregando datos el ultimo mensaje
						chatListItem.ultime_mesage.user_id = new_message.user_id
						chatListItem.ultime_mesage.message = new_message.message
						chatListItem.ultime_mesage.date_send = Date()
						
						// Validando contenido del ultimo mensaje, si no hay file multimedia y el texto es blanco
						if(content.message_multi_data.type !== 'without_mutimedia' && 
						   new_message.message === '') {

							chatListItem.ultime_mesage.message = 'Archivo multimedia enviado'

						}

						var ultime_msg = {
							chat_room_id: chatListItem.chat_content_id,
							user_id: new_message.user_id,
							message: new_message.message,
							date_send: 'hace 1s'
						}
						
						
						// Obteniendo counter d chats
						GetCounterChats(ultime_msg, function(err, counterChat, user_friend_id) {
							if(err) {
								return console.log('Error al encontrar counter para este chat: ' + err)
							}

							console.log('Counter Total en tiempo real: ' + counterChat)

							chatio.to(user_friend_id).emit('counterChat', counterChat)

						})

						console.log('ENVIANDO ULTIMO MENSAJE EN TIEMPO REAL!!!!')

						// Envio del ultimo mensaje en tiempo real
						chatio.emit('chatListUltimaMsg', ultime_msg) // suscrito al chat_content_id: el del room


						// Buscando usuario, para acumular counter y status
						for(var d = 0; d <= chatListItem.users.length - 1; d++) {
							
							var user_with_chat = chatListItem.users[d]

							// Validando usuario
							if(new_message.user_id === user_with_chat.user_id) {

								chatListItem.users[d].counter += 1  // mensaje nuevos
								chatListItem.users[d].status_read = false // No leido

								var ultime_counter_item = {
									chat_room_id: chatListItem.chat_content_id,
									user_id: new_message.user_id,
									counter: chatListItem.users[d].counter,
									status_read: false
								}

								chatio.emit('chatListCounter', ultime_counter_item)
								break;
							}
						}


						chatListItem.save(function (err) {
							if(err) {
								return console.log('Error al guardar chatListItem')
							}
							console.log('Elemento de list fue aguardado')
						})

					})
				})

				console.log('Id de chatRoom socket. ')
				console.log(socket.Chatroom)
				
				content.dateCreateRoom = Date()
				
				console.log('Mensaje enviado en tiempo real')
				console.log(content)

				var RTime = new Date(content.dateCreateRoom)
				var month = RTime.getMonth() + 1   // 0 - 11 *
				var day = RTime.getDate()          // 1- 31  *
				var year = RTime.getFullYear()     // año   *
				var hour = RTime.getHours()		   // 0 - 23  *
				var min  = RTime.getMinutes()      // 0 - 59
				var sec =  RTime.getSeconds()      // 0 - 59

				// Validando el mes 
				var month_string = ''
				if(month === 1) {
					month_string = 'enero'

				} else if (month === 2) {
					month_string = 'febrero'

				} else if (month === 3) {
					month_string = 'marzo'

				} else if (month === 4) {
					month_string = 'abril'

				} else if (month === 5) {
					month_string = 'mayo'

				} else if (month === 6) {
					month_string = 'junio'

				} else if (month === 7) {
					month_string = 'julio'

				} else if (month === 8) {
					month_string = 'agosto'

				} else if (month === 9) {
					month_string = 'septiembre'

				} else if (month === 10) {
					month_string = 'octubre'

				} else if (month === 11) {
					month_string = 'noviembre'

				} else if (month === 12) {
					month_string = 'diciembre'

				} else {
					month_string = String(month)
				}

				// Lectura de fecha por dia, y 24h
				var date_template = ''

				var today = new Date()

				var today_day = today.getDate()
				var today_month = today.getMonth() + 1
				var today_year = today.getFullYear() 
				var today_hour = today.getHours()
				var today_min = today.getMinutes()
				var today_sec = today.getSeconds()

				// Validando si es hoy y en menos de 24h
				if( Number(day) === Number(today_day) && 
				    Number(month) === Number(today_month)  &&
				    Number(year) === Number(today_year) ) {				   
					
					console.log(' es de hoy ')

					// Filtrando por hora
					if(hour < today_hour) {
						
						// mostrando horas
						hour = today_hour - hour
						date_template = ' hace ' + hour + 'h' 

					} else if ( hour === today_hour && min < today_min ) {
						
						// mostrar minutos
						min = today_min - min
						date_template = ' hace ' + min + 'min'


					} else if ( hour === today_hour && min === today_min ) {

						// mostrar segundos
						sec =  today_sec - sec
						date_template = ' hace ' + sec + 'sec'

					} else {
						// mostrando fechas por defecto
						date_template = ' hace ' + hour + 'h' + min + ':' + sec

					}

				} else {
					console.log('No es de hoy')
					date_template = day + ' de ' + month_string + ' a las ' + hour + ':' + min + ':' + sec

				} 

				console.log('DATOS DEL USUARIO ENVIA')

				console.log('id: ')
				console.log(content.user_id)

				console.log('full name: ')
				console.log(content.user_full_name)

				console.log('user avatar: ')
				console.log(content.user_avatar)

				console.log('msg: ')
				console.log(content.message)

				console.log('multi: ')
				console.log(content.message_multi_data)


				var new_message_item = { 
					user_id: content.user_id,
					user_full_name: content.user_full_name,
					user_avatar: content.user_avatar,
					message: content.message,
					message_multi_data: content.message_multi_data,
					dateCreateRoom: date_template
				}

				console.log(Object.keys(io.engine.clients))

				chatio.to(socket.Chatroom).emit('chat', new_message_item)
			})

		})

	})

}

module.exports = time
