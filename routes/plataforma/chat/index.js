var express = require('express')
var app = express.Router()

var Users = require('../../../models/usuarios')
var ChatsList = require('../../../models/chat')
var ChatsRoom = require('../../../models/chat/chat_content')

var config = require('../../../config.js')
var users_type = config.users_access

// Authorized to endpoint
function ensureAuthorized(req, res, next) {
	var bearerToken
    var bearerHeader = req.headers['authorization']

    console.log('Token recibido del usuario')
    console.log(bearerHeader)

    if (typeof bearerHeader !== 'undefined') {
    	console.log('Pasando el token en el req')
        var bearer = bearerHeader.split(" ")
        bearerToken = bearer[0]
        req.token_auth = bearerToken
        next()

    } else {
        res.status(401).json({
        	status: 'No Autentificado',
            type: false,
        	error: 'El token de usuario no esta registrado'
        })
        //res.redirect('/login')
    }
}

// No eliminar ChatRooms : 1) el usuario al conectarse otra vez con el mismo usuario, puede ver su chat anteriores.
function ProcessFindEvent (friend_to_chat, callback) {
	Users.findById({'_id': friend_to_chat}, function (err, friend_fined) {
		if(err) {
			return callback(err)
		}
		//console.log('Datos del amigo solicitado')
		//console.log(friend_fined)

		if(friend_fined) {
			callback(err, friend_fined)
		
		}

	})
}
 
function SendRender (chatList, usuario_token, res, callback) {
	console.log('Datos desde esta FUNCTION')

	var user_id = JSON.stringify(usuario_token._id)
	user_id = JSON.parse(user_id)
	
	var MyChatList = []
	var MegaChatList = []

	for(var j = 0; j <= chatList.length - 1; j++) {
		var chatItem = chatList[j]
		//console.log('Elemento, en posicion: ' + j)
		//console.log(chatItem)
		//console.log('----------------------------------')

		// Recorriendo usuarios que pertenece al item de chat
		for(var k = 0; k <= chatItem.users.length - 1; k++) {
			var user_el = chatItem.users[k]

			//console.log('User: ' + k)
			//console.log(user_el)
			//console.log('-----------')

			// Filtrando al usuario por user_id
			if(user_el.user_id === user_id) {
				//console.log('El usuario fue encontrado')

				// Si el usuario fue encontrado, tomar los datos el otro para leerlo
				var other_friend_to_chat

				if(k === 0) {
					other_friend_to_chat = chatItem.users[k + 1]
				} else {
					other_friend_to_chat = chatItem.users[k - 1]
				}

				//console.log('Datos user_id del other_friend_to_chat, encontrado: ')
				//console.log(other_friend_to_chat)

				var continueChatItem = {
					status_read:  other_friend_to_chat.status_read, 
					counter: other_friend_to_chat.counter,
					other_friend_to_chat: other_friend_to_chat.user_id,
					list: chatList[j]
				}

				MegaChatList.push(continueChatItem)

				break
			}
		}
	}

	//console.log('Lista y data de usuario a buscar')
	//console.log(MegaChatList)

	// Buscando datos de usuarios para chatear a
	// Buscando datos del otro usuarios to chat
	for(var t = 0 ; t <= MegaChatList.length - 1 ; t++) {
		var itemChat = MegaChatList[t]
		//console.log('bucle final: ' + t)

		ProcessFindEvent(itemChat.other_friend_to_chat, function (err, friend_fined) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar usuario en la base de datos',
					error: err
				})
			}
			//console.log('PROCESO DE BLOQUE: ' + t)

			if(friend_fined) {
				// Obteniendo datos del friends to chat
				var user_friend = {
					user_id: friend_fined._id, 
					photo: friend_fined.photo,
					name:  friend_fined.full_name,
					nick:  friend_fined.username,
					status_connect: friend_fined.status_connect,
					//grado: friend_fined.grado,
					list: {}
				}

				user_friend.user_id = JSON.stringify(user_friend.user_id)
				var new_user_id_friend = JSON.parse(user_friend.user_id)
				
				user_friend.user_id = JSON.parse(user_friend.user_id)

				// Validando posicion de chatItem
				for(var g = 0; g <= MegaChatList.length - 1; g++){
					var item = MegaChatList[g]

					if(new_user_id_friend === item.other_friend_to_chat) {

						user_friend.list = MegaChatList[g].list

						// Almacenando  chat list para el usuario_token
						MyChatList.push(user_friend)
					}
				}

				if(MyChatList.length === MegaChatList.length) {
					//console.log('Entro el paso FINAL')
					//console.log('ARREGLO FINAL:')
					//console.log(MyChatList)
					callback(err, MyChatList)
					
				}
				
			}

		})
	} 

}

// Lista de chats con amigos
app.get('/list', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
			return res.status(500).json({
		   		status: 'error_server',
		   		message: 'Error al encontrar a usuario en la base de datos',
		   		error: err
			})

		} else {

			console.log('ENTRO!!! AUTH')
			console.log(usuario_token)

			if(usuario_token.permiso === users_type.onwers || 	
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {
			   	
				//var user_id = JSON.stringify(usuario_token._id)
				//user_id = JSON.parse(user_id)
				
				var MyChatList = []
				var MegaChatList = []
				//console.log('Entro al inicio')

				//Obteniendo lista de de todos los chats
				ChatsList.find(function (err, chatList){
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar lista de chats',
							error: err
						})
					}

					//console.log('Chat List')
					//console.log(chatList)

					// Validando existencia de contenido en chatList
					if(chatList.length === 0) {
						//console.log('NO hay ningun chat en lista.')
						//console.log(MyChatList)
						// Render de buscando amigos
						/*
						res.render('./admin/dashboard/chat/index.jade', {
						 	message: ' No exite un chat en la lista',
						 	user: usuario_token,
						 	chats: MyChatList
						})*/
						
						res.status(200).json({
						    message: 'No existe un chat en la lista',
							user: usuario_token,
							chats: MyChatList
						})

					} else {

						SendRender(chatList, usuario_token, res, function (err, MyChatList) {
							if(err) {
								return res.status(500).json({
									status: 'error_server',
									message: 'Error al procesar los chats en lista',
									error: err
								})
							}

							//console.log('MyList del callback')
							//console.log(MyChatList)

							if(MyChatList) {
								//console.log('LLEGO EL CONTENIDO Y SE VA APEGAR')
								//console.log(MyChatList)

								MyChatList.reverse()

								var Articles_dates = []
								var MyChatArtNew = []

								// Ordenando por fecha
								for(var q = 0; q <= MyChatList.length - 1; q++) {
									var element = {
										data: MyChatList[q],
										date_number: 0
									}

									//console.log('Elemento de Chat')
									//console.log(element.data.list.ultime_mesage.date_send)

									var new_data = new Date(element.data.list.ultime_mesage.date_send).getTime()

									element.date_number = Number(new_data)
									MyChatArtNew[q] = element

									// Llenando datos con fechas
									Articles_dates[q] = new_data
								}

								// Ordenando cronologicamente reciente a más antiguo
								Articles_dates.sort(deMayorAMenor)

								function deMayorAMenor (elem1, elem2) { 
									return elem2 - elem1 
								}
								
								// Array con fechas de publicado ordenadas
								var Article_collections = []

								// Buscando coincidencia en el array por fecha
								for(var c = 0; c <= Articles_dates.length - 1; c++) {							
									// Asignando elemento de lista dentro del array por filtro de fecha
									for(var s = 0; s <= MyChatArtNew.length - 1; s++) {
										var el_article = MyChatArtNew[s]

										if(Articles_dates[c] === el_article.date_number) {
											//console.log('Elemento date encontrado para este articulo')
											//MyChatArtNew[c] = el_article.data
											Article_collections[c] = MyChatArtNew[s].data
											
											break
										}
									
									}
								}
								
								var new_chatsItem_collection = []
								var counterChat = 0

								for(var d = 0; d <= Article_collections.length - 1; d++) {
									var element = Article_collections[d]
									//console.log('Position: ' + d)
									//console.log(element)

									var RTime = new Date(element.list.ultime_mesage.date_send)
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
										
										//console.log(' es de hoy ')

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
										//console.log('No es de hoy')
										date_template = day + ' de ' + month_string + ' a las ' + hour + ':' + min + ':' + sec

									}

									// Validandao usuario para el counter
									//console.log('ELEMENTTTTTT')
									var counter = 0
									var status_read = true

									for(r = 0; r <= element.list.users.length - 1; r++) {
										var el_users = element.list.users[r]
										
										// Buscando coincidencia 
										if(el_users.user_id === element.user_id) {

											counter = el_users.counter
											status_read = el_users.status_read
											break;
										}

									}


									//console.log('ELEMENTTTTTT')

									var new_chat_Item = {
										user_id: element.user_id, 
										photo: element.photo,
										name:  element.name,
										nick:  element.nick,
										status_connect: element.status_connect,
										counter: counter,
										status_read: status_read,
										list: {
											_id: element.list._id,
											users: element.list.users,
											ultime_mesage: { 
												user_id: element.list.ultime_mesage.user_id,
												message: element.list.ultime_mesage.message,
												date_send: date_template,
											},
											chat_content_id: element.list.chat_content_id
										}
									}

									counterChat += counter

									new_chatsItem_collection[d] = new_chat_Item

								}

								/*console.log('-------- CHAT LIST ELEMENTOS >> START-----')

								console.log(new_chatsItem_collection)

								console.log('LISTTTT')

								console.log(new_chatsItem_collection[0].list)

								console.log('-------- CHAT LIST ELEMENTOS >> END-----')

								*/
								
								console.log('Counter Chat')
								console.log(counterChat)
								
								// Render de buscando amigos
								/*res.render('./admin/dashboard/chat/index.jade', {
								 	user: usuario_token,
								 	chats: new_chatsItem_collection,
								 	counterChat: counterChat
								})*/
								
								res.status(200).json({
									user: usuario_token,
									chats: new_chatsItem_collection,
									counterChat: counterChat
								})
								
							}

						})

					}

				})

			} else {
				console.log('El usuario no esta autentificado. Requiere logearse')
			     res.status(403).json({
			        status: 'not_access',
			        message: 'El usuario no esta autentificado. Requiere logearse'
			     })
			}

		}
	})
})

// Lista de amigos para chatear
app.get('/list-friends', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
			return res.status(500).json({
		   		status: 'error_server',
		   		message: 'Error al encontrar a usuario en la base de datos',
		   		error: err
			})

		} else {

			if(usuario_token.permiso === users_type.onwers || 
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {

				// Buscando lista de amigos para este usuario
				Users.find(function (err, list_friends) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar la lista de amigos del usuario',
							error: err
						})
					}

					if(list_friends.length === 0) {

						list_friends = []
						/*
						res.render('./admin/dashboard/chat/list-friends', {
						 	status: 'not_found',
						 	user: usuario_token,
						 	friends: list_friends
						})*/

						
						res.status(200).json({
							status: 'ok',
							user: usuario_token,
							friends: list_friends
						})

					} else {
						// Filtrando lista de friends por empresa y contratista (pensado para usuario de oficina)

						// Filtrando por empresa
						var arr_user_empresa_filter = list_friends.filter(function (element) {
							return element.empresa_admin === usuario_token.empresa_admin
						})
						/*
						res.render('./admin/dashboard/chat/list-friends', {
						 	status: 'ok',
						 	user: usuario_token,
						 	friends: arr_user_empresa_filter
						})*/
						
						res.status(200).json({
							status: 'ok',
							user: usuario_token,
							friends: arr_user_empresa_filter
						})

					}	
				})

			} else {
				console.log('El usuario no esta autentificado. Requiere logearse')
			     res.status(403).json({
			        status: 'not_access',
			        message: 'El usuario no esta autentificado. Requiere logearse'
			     })
			}

		}
	})
})

// Crear nuevo canal de chat para la lista
app.post('/new-chat/:friend_user_id', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
			return res.status(500).json({
		   		status: 'error_server',
		   		message: 'Error al encontrar a usuario en la base de datos',
		   		error: err
			})

		} else {

			if(usuario_token.permiso === users_type.onwers || 
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {

				var user_id = usuario_token._id
				var friend_user_id = req.params.friend_user_id

				var encontrado = false
				var chatRoom

				console.log('PROCESO DE CREAR CHAT')

				ChatsList.find(function (err, chatList) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar lista de chat',
							error: err
						})
					}

					for(var h = 0; h <= chatList.length - 1; h++) {
						var chat = chatList[h]

						for(var a = 0; a <= chat.users.length - 1; a++) {
							var user = chat.users[a]

							var user_id_string = JSON.stringify(user_id)
							user_id_string = JSON.parse(user_id_string)

							if(user.user_id === friend_user_id) {
								
								if(a === 0) {
									if(chat.users[a + 1].user_id === user_id_string) {

										console.log('El chat ya existe')
										console.log(chat)

										encontrado = true
										chatRoom = chat.chat_content_id
										break

									} else {

										break
									}

								} else {
									// a = 1

									if(chat.users[a - 1].user_id === user_id_string) {
										console.log('El chat ya existe')
										console.log(chat)

										encontrado = true
										chatRoom = chat.chat_content_id
										break

									} else {
										
										break

									}

								}

								
							}
						}
					}

					if(h === chatList.length) {

						if(encontrado === true) {

							console.log('Ya iniciaste un chat Room con esta persona')
							console.log('chat room : ' + chatRoom)

							res.redirect('/dashboard/chat/list')

						} else {
							console.log('Chat rooom iniciado')
							//Creando nuevo item de chat
							var newchat = new ChatsList({
								users: [],
								ultime_mesage: { 
									message: '',
									date_send: new Date(), 
								},
								chat_content_id: ''
							})

							var user1 = {
								user_id: user_id
							}

							var user2 = {
								user_id: friend_user_id
							}

							// Agregando al primer usuario
							newchat.users.push(user1)

							// Agregando al segundo usuario
							newchat.users.push(user2)

							// Creando nuevo room chat
							var chatRoom = new ChatsRoom({
								messages: []
							})

							newchat.chat_content_id = chatRoom._id

							//Guardando lista item a chat with friend list
							newchat.save(function(err) {
								if(err) {
									return res.status(500).json({
										status: 'error_server',
										message: 'Error al guardar el item a la chat list with friends',
										error: err
									})
								}
								console.log('Se guardo item chat, ene list de chat con amigos: ' + newchat)
							})

							// Guardando room chat
							chatRoom.save(function(err) {
								if(err) {
									return res.status(500).json({
										status: 'error_server',
										message: 'Error al guardar el room chat',
										error: err
									})
								}
								console.log('Se guardo chat room: ' + chatRoom)

								console.log('Nuevo canal de chat iniciado con: ' + friend_user_id)
				
								res.status(200).json({
									status: 'ok',
									chat_room: chatRoom._id,
									user: usuario_token,
									friend_id: friend_user_id,
									message: 'Nuevo chat creado'
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

		}
	})
})

// Delete room the chat
app.delete('/:user_id', ensureAuthorized, function (req, res) {
	var user_id = req.params.user_id
	
	// No cargar en la lista principal, visualmente. de ese usuario
	// Si elimino el ChatItem, es el que contiene el id del chat para una segunda oportunidad
	console.log('No Habilitado Aun!!')
})

// Obteniendo contenido del chat room - chat con un amigo - Limit 0 to 20
app.post('/room/:room_id/:user_friend_id', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
			return res.status(500).json({
		   		status: 'error_server',
		   		message: 'Error al encontrar a usuario en la base de datos',
		   		error: err
			})

		} else {

			if(usuario_token.permiso === users_type.onwers || 
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {

				var user_id = JSON.stringify(usuario_token._id)
				user_id = JSON.parse(user_id)

				var room_id = req.params.room_id
				var user_friend_id = req.params.user_friend_id

				// Buscando chat Room en todos los elementos
				ChatsRoom.findById({'_id': room_id}, function (err, Chatroom) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar el chat room',
							error: err
						})
					}

					var Chatroom_ = Chatroom.messages.reverse()

					Chatroom.messages = []

					// Limitando notificaciones legibles
					for(var q = 0; q <= 20; q++) {

						if(Chatroom_[q] === undefined) {
						            
						    break
						     
						} else {
						      
							Chatroom.messages[q] = Chatroom_[q]

						}
					}
					
					// Buscando al usuario para info superior
					Users.findById({'_id': user_friend_id}, function (err, user_friend) {
						if(err) {
							return res.status(500).json({
								status: 'error_server',
								message: 'Error al encontrar datos de amigo',
								error: err
							})
						}

						var friend_data = {
							_id: user_friend._id,
							name: user_friend.full_name,
							photo: user_friend.photo
						}

						var NewChatRoom = {
							_id: room_id,
							messages: [],
							dateCreateRoom: Chatroom.dateCreateRoom
						}

						// Obteniendo foto y nombre
						for(var f = 0; f <= Chatroom.messages.length - 1; f++) {
							var user_data = Chatroom.messages[f]

							var message = {
								user_id:    user_data.user_id,
								message:    user_data.message,
								message_multi_data: user_data.message_multi_data,
								data_send:  user_data.data_send
							}

							if(message.user_id === user_id) {
								message.photo = usuario_token.photo
								message.name  = usuario_token.full_name

							} else if(message.user_id === user_friend_id) {
								message.photo = user_friend.photo
								message.name  = user_friend.full_name

							} else {
								console.log('El mensaje no tiene un usuario que coincida :/')

							}

							// Agregando fecha amigables


							// Insertando el nuevo usuario con los datos
							NewChatRoom.messages.push(message)

						}

						//console.log('TOdos los mensaes')
						//console.log(NewChatRoom)
						
						if(NewChatRoom.messages.length === Chatroom.messages.length) {
							
							// Ordenando cronologicamente
							var Articles_dates = []

							// Ordenando por fecha
							for(var q = 0; q <= NewChatRoom.messages.length - 1; q++) {
								var element = {
									data: NewChatRoom.messages[q],
									date_number: 0
								}

								//console.log('Elemento de Chat')
								//console.log(element.data.data_send)
								
								// convirtiendo dato a numbero comparable
								var new_data = new Date(element.data.data_send).getTime()

								element.date_number = Number(new_data)
								NewChatRoom.messages[q] = element

								// Llenando datos con fechas
								Articles_dates[q] = new_data
							}

							// Ordenando cronologicamente reciente a más antiguo
							Articles_dates.sort(deMayorAMenor)

							function deMayorAMenor (elem1, elem2) { 
								return elem2 - elem1 
							}

							// Array con fechas de publicado ordenadas
							var Article_collections = []

							// Buscando coincidencia en el array por fecha
							for(var c = 0; c <= Articles_dates.length - 1; c++) {
								
								// Asignando elemento de lista dentro del array por filtro de fecha
								for(var s = 0; s <= NewChatRoom.messages.length - 1; s++) {
									var el_article = NewChatRoom.messages[s]

									if(Articles_dates[c] === el_article.date_number) {
										//console.log('Elemento date encontrado para este articulo')
										//NewChatRoom.messages[c] = el_article.data
										Article_collections[c] = NewChatRoom.messages[s].data
										
										break
									}
								
								}
							}

							
							//console.log('CONTENIDO DE MENSAJES DEL ROOM')
							//console.log(Article_collections)

							var new_chatMessageItem_collection = []

							for(var d = 0; d <= Article_collections.length - 1; d++) {
								var element3 = Article_collections[d]
								//console.log('Position: ' + d)
								//console.log(element3)

								var RTime = new Date(element3.data_send)
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
									
									//console.log(' es de hoy ')

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
									//console.log('No es de hoy')
									date_template = day + ' de ' + month_string + ' a las ' + hour + ':' + min + ':' + sec

								} 

								var new_message_item = { 
									user_id: element3.user_id,
									message: element3.message,
									message_multi_data: element3.message_multi_data,
									data_send: date_template,
									photo: element3.photo,
									name: element3.name
								} 

								new_chatMessageItem_collection[d] = new_message_item

							}

							new_chatMessageItem_collection.reverse()
							
							var NewChatRoomWithDate = {
								_id: NewChatRoom._id,
								messages: new_chatMessageItem_collection,
								dateCreateRoom: NewChatRoom.dateCreateRoom
							}

							//console.log('LISTA FINA')
							//console.log(NewChatRoomWithDate.messages)
							
							//console.log(NewChatRoomWithDate)
							//console.log('>>>>>>>>>>>>>>>>>>>>><')
							
							// Reseteando ChatListItem
							ChatsList.findOne({'chat_content_id': room_id}, function (err, chatItem){
								if(err) {
									return res.status(500).json({
										status: 'error_server',
										error: err
									})
								}

								console.log('List Item encontrado')
								console.log(chatItem)

								// buscando entre usuarios
								for(var m = 0; m <= chatItem.users.length - 1; m++) {
									var el_users = chatItem.users[m]
									
									var friend_id_parse = JSON.stringify(friend_data._id)
									friend_id_parse = JSON.parse(friend_id_parse)

									if(el_users.user_id === friend_id_parse) {
										console.log('USUARIO ENCONTRADO!!')
										chatItem.users[m].counter = 0
										chatItem.users[m].status_read = true

										break;
									}
								}

								// Guardado cambios
								chatItem.save(function (err) {
									if(err) {
										return res.status(500).json({
											status: 'error_server',
											err: err
										})
									}
									
									console.log('TERMINADO>>>>>>>><<<<')

									// validando si pertenesco al chat room
									/*res.render('./admin/dashboard/chat/room_item/index.jade',{
									 	user: usuario_token,
									 	friend: friend_data,
									 	chatContent: NewChatRoomWithDate
									})*/

									
									res.status(200).json({
										user: usuario_token,
										friend: friend_data,
										chatContent: NewChatRoomWithDate,
										counterMsg: Chatroom_.length
									})

								})

							})

						}

					})

				})


			} else {
				console.log('El usuario no esta autentificado. Requiere logearse')
			     res.status(403).json({
			        status: 'not_access',
			        message: 'El usuario no esta autentificado. Requiere logearse'
			     })
			}

		}
	})
})

// Obteniendo contenido del chat room - chat con un amigo
app.post('/room/:room_id/:user_friend_id/more', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
			return res.status(500).json({
		   		status: 'error_server',
		   		message: 'Error al encontrar a usuario en la base de datos',
		   		error: err
			})

		} else {

			if(usuario_token.permiso === users_type.onwers || 
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {

				var user_id = JSON.stringify(usuario_token._id)
				user_id = JSON.parse(user_id)

				var room_id = req.params.room_id
				var user_friend_id = req.params.user_friend_id

				// Buscando chat Room en todos los elementos
				ChatsRoom.findById({'_id': room_id}, function (err, Chatroom) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al encontrar el chat room',
							error: err
						})
					}
					
					// Buscando al usuario para info superior
					Users.findById({'_id': user_friend_id}, function (err, user_friend) {
						if(err) {
							return res.status(500).json({
								status: 'error_server',
								message: 'Error al encontrar datos de amigo',
								error: err
							})
						}

						var friend_data = {
							_id: user_friend._id,
							name: user_friend.full_name,
							photo: user_friend.photo
						}

						var NewChatRoom = {
							_id: room_id,
							messages: [],
							dateCreateRoom: Chatroom.dateCreateRoom
						}

						// Obteniendo foto y nombre
						for(var f = 0; f <= Chatroom.messages.length - 1; f++) {
							var user_data = Chatroom.messages[f]

							var message = {
								user_id:    user_data.user_id,
								message:    user_data.message,
								message_multi_data: user_data.message_multi_data,
								data_send:  user_data.data_send
							}

							if(message.user_id === user_id) {
								message.photo = usuario_token.photo
								message.name  = usuario_token.full_name

							} else if(message.user_id === user_friend_id) {
								message.photo = user_friend.photo
								message.name  = user_friend.full_name

							} else {
								console.log('El mensaje no tiene un usuario que coincida :/')

							}

							// Agregando fecha amigables


							// Insertando el nuevo usuario con los datos
							NewChatRoom.messages.push(message)

						}

						//console.log('TOdos los mensaes')
						//console.log(NewChatRoom)
						
						if(NewChatRoom.messages.length === Chatroom.messages.length) {
							
							// Ordenando cronologicamente
							var Articles_dates = []

							// Ordenando por fecha
							for(var q = 0; q <= NewChatRoom.messages.length - 1; q++) {
								var element = {
									data: NewChatRoom.messages[q],
									date_number: 0
								}

								//console.log('Elemento de Chat')
								//console.log(element.data.data_send)
								
								// convirtiendo dato a numbero comparable
								var new_data = new Date(element.data.data_send).getTime()

								element.date_number = Number(new_data)
								NewChatRoom.messages[q] = element

								// Llenando datos con fechas
								Articles_dates[q] = new_data
							}

							// Ordenando cronologicamente reciente a más antiguo
							Articles_dates.sort(deMayorAMenor)

							function deMayorAMenor (elem1, elem2) { 
								return elem2 - elem1 
							}

							// Array con fechas de publicado ordenadas
							var Article_collections = []

							// Buscando coincidencia en el array por fecha
							for(var c = 0; c <= Articles_dates.length - 1; c++) {
								
								// Asignando elemento de lista dentro del array por filtro de fecha
								for(var s = 0; s <= NewChatRoom.messages.length - 1; s++) {
									var el_article = NewChatRoom.messages[s]

									if(Articles_dates[c] === el_article.date_number) {
										//console.log('Elemento date encontrado para este articulo')
										//NewChatRoom.messages[c] = el_article.data
										Article_collections[c] = NewChatRoom.messages[s].data
										
										break
									}
								
								}
							}

							
							//console.log('CONTENIDO DE MENSAJES DEL ROOM')
							//console.log(Article_collections)

							var new_chatMessageItem_collection = []

							for(var d = 0; d <= Article_collections.length - 1; d++) {
								var element3 = Article_collections[d]
								//console.log('Position: ' + d)
								//console.log(element3)

								var RTime = new Date(element3.data_send)
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
									
									//console.log(' es de hoy ')

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
									//console.log('No es de hoy')
									date_template = day + ' de ' + month_string + ' a las ' + hour + ':' + min + ':' + sec

								} 

								var new_message_item = { 
									user_id: element3.user_id,
									message: element3.message,
									message_multi_data: element3.message_multi_data,
									data_send: date_template,
									photo: element3.photo,
									name: element3.name
								} 

								new_chatMessageItem_collection[d] = new_message_item

							}

							new_chatMessageItem_collection.reverse()
							
							var NewChatRoomWithDate = {
								_id: NewChatRoom._id,
								messages: new_chatMessageItem_collection,
								dateCreateRoom: NewChatRoom.dateCreateRoom
							}

							//console.log('LISTA FINA')
							//console.log(NewChatRoomWithDate.messages)
							
							//console.log(NewChatRoomWithDate)
							//console.log('>>>>>>>>>>>>>>>>>>>>><')
							
							// Reseteando ChatListItem
							ChatsList.findOne({'chat_content_id': room_id}, function (err, chatItem){
								if(err) {
									return res.status(500).json({
										status: 'error_server',
										error: err
									})
								}

								console.log('List Item encontrado')
								console.log(chatItem)

								// buscando entre usuarios
								for(var m = 0; m <= chatItem.users.length - 1; m++) {
									var el_users = chatItem.users[m]
									
									var friend_id_parse = JSON.stringify(friend_data._id)
									friend_id_parse = JSON.parse(friend_id_parse)

									if(el_users.user_id === friend_id_parse) {
										console.log('USUARIO ENCONTRADO!!')
										chatItem.users[m].counter = 0
										chatItem.users[m].status_read = true

										break;
									}
								}

								// Guardado cambios
								chatItem.save(function (err) {
									if(err) {
										return res.status(500).json({
											status: 'error_server',
											err: err
										})
									}
									
									console.log('TERMINADO>>>>>>>><<<<')

									// validando si pertenesco al chat room
									/*res.render('./admin/dashboard/chat/room_item/index.jade',{
									 	user: usuario_token,
									 	friend: friend_data,
									 	chatContent: NewChatRoomWithDate
									})*/

									
									res.status(200).json({
										user: usuario_token,
										friend: friend_data,
										chatContent: NewChatRoomWithDate,
										counterMsg: Chatroom.messages.length
									})

								})

							})

						}

					})

				})


			} else {
				console.log('El usuario no esta autentificado. Requiere logearse')
			     res.status(403).json({
			        status: 'not_access',
			        message: 'El usuario no esta autentificado. Requiere logearse'
			     })
			}

		}
	})
})

/*
app.get('/try-up', function (req, res) {
	res.render('./try.jade')
})*/

// Subiendo archivos por http
app.post('/new-file/upload', ensureAuthorized, function (req, res) {
	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
	        return res.status(500).json({
	        	status: 'error_server',
	        	message: 'Usuario No encontrado en la base de datos',
	        	error: err
	        })

		} else {

			if(usuario_token.permiso === users_type.onwers || 
			   usuario_token.permiso === users_type.admins ||
			   usuario_token.permiso === users_type.officers ||
			   usuario_token.permiso === users_type.viewer ||
			   usuario_token.permiso === users_type.users_campo) {
				
				console.log('Tiene permiso-11')
				// Actualizando multimedia dentro del elemento
				if(req.files.hasOwnProperty('new_file_upload_to_chat')) {
					// Actualizando los datos del psote. Con Archivos multimedia
					console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
					
					// Validando path uploads ----
					var FilesCover = req.files.new_file_upload_to_chat

					console.log('---------------')

					console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
					console.log(FilesCover)

					console.log('---------------')

					var path_file = FilesCover.path
					console.log(path_file)
					
					// path uploads iniciales
					var uploads_1 = 'uploads/'
					var uploads_2 = 'uploads\\'

					
					// Validando reemplazo del inicio del path uploads
					if (path_file.indexOf(uploads_1) != -1) {
					    FilesCover.path = FilesCover.path.replace('uploads/','/')

					} else if (path_file.indexOf(uploads_2) != -1) {
					    FilesCover.path = FilesCover.path.replace('uploads\\','/')

					} else {
					    console.log('Ocurrió un error con el path')
					    console.log(path_file)
					
					}	

					console.log('ARCHIVO SUBIDO!!')
					console.log(FilesCover)

					// Validando elemnto de tipo de datos
					if(FilesCover.extension === 'png') {

						FilesCover.mimetype = 'image/png'

					} else if (FilesCover.extension === 'jpg') {

						FilesCover.mimetype = 'image/jpg'

					} else if (FilesCover.extension === 'jpeg') {

						FilesCover.mimetype = 'image/jpeg'

					} else if (FilesCover.extension === 'gif') {

						FilesCover.mimetype = 'image/gif'

					} else if (FilesCover.extension === 'mp4') {

						FilesCover.mimetype = 'video/mp4'

					} else if(FilesCover.extension === 'mp3') {

						FilesCover.mimetype = 'audio/mp3'

					} else {

						FilesCover.mimetype = 'not_read'

					}
					
					// Entretando datos de la subida
					res.status(200).json({
						status: 'ok',
						file: FilesCover
					})

				} else {

					res.status(200).json({
						status: 'not_file_charged',
						message: 'No se selecciono ningun archivo'
					})

				}

			} else {
				console.log('El usuario no esta autentificado. Requiere logearse')
				res.status(403).json({
				   status: 'not_access',
				   message: 'El usuario no esta autentificado. Requiere logearse'
				})
			}

		}
	})
})


module.exports = app
