myApp.controller('chatRoom', ['$scope', '$http', 'Loader', 'userModel', function($scope, $http, Loader, userModel){
	$('.CounterMessages').html('0')

	$('#messageChat').on('click', function(){
		console.log('XD')
		var box = $('#MessagesChatFriends')
		if (box.css('right') === '-300px') {
			console.log('hola')
			box.animate({
				right: '0'
			})
			ListRooms()
		} else {
			//socket.disconnect()
			setTimeout(function(){
				//socket.connect()
				console.log(socket)
			}, 10)
			//console.log(socket)
			console.log('Adios')
			box.animate({
				right: '-300px'
			})
			setTimeout(function(){
				$('.MessagesFriends__containner').remove()
			}, 300)
		}
	})

	// var socket;

	// LISTA DE ROOM FRIENDS PARA CHAT
	function ListRooms(){
		$('.MessagesFriends').html('')
		var containner = document.createElement('div')
		containner.setAttribute('class', 'MessagesFriends__containner')
		var template_box = `<div class="MessagesFriends__containner--search">
													<button class="btnSearch" id="searchFriends">Ver Lista de usuarios</button>
													<div class="CloseWindowFriend" id="CloseWindowFriend"><span class="icon-icon_chat_cerrar"></span></div>
												</div>
												<div class="MessagesFriends__containner--items" id="ElementsContainner">		
												</div>`
		containner.innerHTML = template_box
		$('#MessagesChatFriends').append(containner)

		// CERRADODE VENTANA DE AMIGOS/CHAT
		$('#CloseWindowFriend').on('click', function(){
			var box = $('#MessagesChatFriends')
			box.animate({
				right: '-300px'
			})
			setTimeout(function(){
				$('.MessagesFriends__containner').remove()
			}, 300)
		})

		$('#searchFriends').on('click', FindListFriend)

		Loader.create('.MessagesFriends__containner--items', 'ItemsRooms')
		$http({
			method:'GET',
			url:'/dashboard/chat/list'
		}).then(function(res){
			Loader.delete('.MessagesFriends__containner--items', 'ItemsRooms')
			console.log(res)
			$('.CounterMessages').html(res.data.counter_max)
			var rooms = res.data.chats
			for (var i = 0; i < rooms.length; i++) {
				var user = rooms[i]
				var color
				if (user.status_connect === true) {
					color = '#009688'
				} else {
					color = '#9ea9af'
				}
				var view
				if (user.counter > 0) {
					view = 'block'
				} else {
					view = 'none'
				}
				var item = document.createElement('div')
				item.setAttribute('class', 'ItemRoom')
				item.setAttribute('data-room', user.list.chat_content_id)
				item.setAttribute('data-user-id', user.user_id)
				var template = `<div class="ItemRoom__containner">
													<div class="ItemRoom__containner--image" style="background-image:url(${user.photo.path})"><span data-count-friend="${user.user_id}" class="counter" style="display:${view}">${user.counter}</span></div>
													<div class="ItemRoom__containner--text">
														<p class="title">${user.name}</p>
														<p class="subtitle">@${user.nick}</p>
													</div>
													<div class="Connect" data-connect-user-id="${user.user_id}" style="background-color: ${color}"></div>
												</div>`
				item.innerHTML = template
				$('#ElementsContainner').append(item)
			}

			$('.ItemRoom').on('click', viewChat)

		}, function(err){
			console.log(err)
		})
	}

	// BUSQUEDA DE LISTA DE AMIGOS
	function FindListFriend(){
		$('#ElementsContainner').html('')
		Loader.create('.MessagesFriends__containner--items', 'ItemsRooms')
		$http({
			method: 'GET',
			url: '/dashboard/chat/list-friends'
		}).then(function(res){
			Loader.delete('.MessagesFriends__containner--items', 'ItemsRooms')
			console.log(res)
			var Friend = res.data.friends
			for (var i = 0; i < Friend.length; i++) {
				var user = Friend[i]
				var item = document.createElement('div')
				item.setAttribute('class', 'ItemFriend')
				// item.setAttribute('data-iduser', user.list.chat_content_id)
				item.setAttribute('data-user-id', user._id)
				var template = `<div class="ItemFriend__containner">
													<div class="ItemFriend__containner--image" style="background-image:url(${user.photo.path})"></div>
													<div class="ItemFriend__containner--text">
														<p class="title">${user.full_name}</p>
														<p class="subtitle">@${user.username}</p>
													</div>
												</div>`
				item.innerHTML = template
				$('#ElementsContainner').append(item)
			}

			$('.ItemFriend').on('click', newChat)
		}, function(err){
			console.log(err)
		})
	}

	function newChat(){
		console.log('XD')
		$('.MessagesFriends__containner').html('')
		Loader.create('.MessagesFriends__containner', 'newFirends')
		var idFriend = this.getAttribute('data-user-id')
		$http({
			method: 'GET',
			url:'/dashboard/chat/list'
		}).then(function(res){
			Loader.delete('.MessagesFriends__containner', 'newFirends')
			console.log(res)
			var room
			if (res.data.chats.length === 0) {
				newRoom(idFriend)
			}
			for (var i = 0; i < res.data.chats.length; i++) {
				console.log(res.data.chats[i])
				if (res.data.chats[i].user_id === idFriend) {
					room = res.data.chats[i].list.chat_content_id
					console.log(room, idFriend)
					initChat(room, idFriend)
					break
				} else {
					room = null
					if (i === res.data.chats.length-1) {
						console.log('No es resultado!')
						if (room === null) {
							console.log('No existe la sala')
							newRoom(idFriend)
						}
					}
				}
			}
		}, function(err){
			console.log(err)
		})
	}

	function newRoom(idFriend){
		console.log(idFriend)
		$http({
			method: 'POST',
			url:'/dashboard/chat/new-chat/'+idFriend
		}).then(function(res){
			console.log(res)
			var room = res.data.chat_room
			var idFriend = res.data.friend_id
			console.log(room, idFriend)
			initChat(room, idFriend)
		}, function(err){
			console.log(err)
		})
	}

	// VISTA ROOM DE CADA AMIGO
	function viewChat(){
		$('.MessagesFriends__containner').html('')
		var idRoom = this.getAttribute('data-room')
		var idFriend = this.getAttribute('data-user-id')
		console.log(idRoom, idFriend)
		initChat(idRoom, idFriend)
	}	
	
	var number_val = 0
	var user_id_saved

	var counter_second = 0

	function initChat(idRoom, idFriend){
		Loader.create('.MessagesFriends__containner', 'LoaderUserRoom')
		$http({
			method: 'POST',
			url: '/dashboard/chat/room/'+idRoom+'/'+idFriend
		}).then(function(res){
			var infoFriend = res.data.friend
			var chat = res.data.chatContent.messages
			var myInfo = res.data.user

			// if(socket == null){
			// 	console.log('socket chat is null');
			// 	socket = io('/chat-io')
			// }
			// console.log(socket.connected);
			// if(!socket.connected){
			// 	console.log('socket chat is not connected')
			// 	socket.on('connect', function() {
			// 		console.log('se conecto al chat *****')
			// 		// Connected, let's sign-up for to receive messages for this room
			// 		//console.log('El usuario CLIENTE, se logro conectar!!!')
			// 		//console.log(res.data.chatContent._id)
			// 		socket.emit('Chatroom', res.data.chatContent._id)
			// 	})
			// }

			console.log('SOCKEET!!!!')
			console.log(socket)

			//console.log('NUMERO: ' + number_val)

			//console.log('Datos del arreglo')
			//console.log('dsadd --->')
			
			socket.json._callbacks.chat = []
			//socket.json._callbacks.chatListCounter = []
			//socket.json._callbacks.counterChat = []

			console.log(res.data.chatContent._id)

			console.log('Id del usuario en memoria <<<<KKK')
			console.log(user_id_saved)

			socket.emit('Chatroom', res.data.chatContent._id)

			if(user_id_saved === res.data.chatContent._id) {
				console.log('COINDICE>>>>')
				socket.emit('Chatroom', res.data.chatContent._id)

				localStorage.setItem('value_boolean2', "false")
			}

			user_id_saved = res.data.chatContent._id

			console.log('NUMBERO')
			console.log(socket.json._callbacks.counterChat.length)

			if(socket.json._callbacks.connect.length % 2 !== 0) {
				console.log('Connect es impar')

				socket.json._callbacks.chat = []

				socket.emit('Chatroom', res.data.chatContent._id)

			}

			// Validando conteo dos en dos

			if(socket.json._callbacks.counterChat.length === 1) {
				localStorage.setItem('value_boolean2', "false")
			}

			if(socket.json._callbacks.counterChat.length % 2 !== 0) {

				//console.log('EL NUMERO ES PARRRR')
				var value_boolean = localStorage.value_boolean2

				if(localStorage.value_boolean !== undefined) {

					if(localStorage.value_boolean2 === "true") {

						value_boolean = false

					} else {

						value_boolean = true	

					}

					//console.log('YA EXISTES')

					// Guardando valor en localstorage
					localStorage.setItem('value_boolean2', value_boolean)

				} else {

					//console.log('NO ESTA DEFINIDO')
					
					// Guardando valor en localstorage
					localStorage.setItem('value_boolean2', value_boolean)

				}
			
			}

			console.log('RESULTADO DE VERDAD -------XXXX')
			console.log(localStorage.value_boolean2)

			// Validando conexion en estados de false
			if(localStorage.value_boolean2 === "false") {
				socket.json._callbacks.chat = []

				socket.emit('Chatroom', res.data.chatContent._id)

			}

			Loader.delete('.MessagesFriends__containner', 'LoaderUserRoom')
			var containner = document.createElement('div')
			containner.setAttribute('class','UserRoom')
			var template_box = `<div class="UserRoom__head">
									<div class="UserRoom__head--image" style="background-image:url(${infoFriend.photo.path})">
									</div>
									<div class="UserRoom__head--text">
										<p class="title">${infoFriend.name}</p>
									</div>
									<div class="backUsers" id="backUsers"><span class="icon-icon_chat_inbox_cerrar"></span></div>
								</div>
								<div class="UserRoom__chat">
								</div>
								<div class="UserRoom__form">
									<div class="UserRoom__form--containner">
										<div class="inputMessage">
											<div class="textLabel"><span>Escribe un mensaje</span></div>
											<div class="TextMessage" id="TextMessage" contentEditable="true"></div>
										</div>
										<div class="PreviewFile">
											<div class="PreviewFile__content" id="preview_box_to_chat"></div>
										</div>
										<div class="btns">
											<div class="btns__inputFile">
												<label for="FileMessage"><span class="icon-icon_imagen"></span></label>
												<input class="btns__inputFile--input" type="file" id="FileMessage"/>
											</div>
											<div class="btns__btnSend">
												<button class="btns__btnSend--btn">Enviar</button>
											</div>
										</div>
									</div>
								</div>`

			containner.innerHTML = template_box
			$('.MessagesFriends__containner').append(containner)
			$('#backUsers').on('click', ListRooms)

			$('#TextMessage').focus(function(){
				var labelText = $('.textLabel')
				// console.log(this)
				labelText.css('display', 'none')
			})

			var file_data

			$('#FileMessage').change(function(e) {
				//console.log('Evento uploar file activado')
				var file = e.target.files[0]
				console.log('datos del archivo')
				console.log(file)

			    
				if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'video/mp4' || file.type === 'audio/mp3') {
					var stream = ss.createStream()						

					ss(socket).emit('up_file_to_chat', stream, { name: file.name, size: file.size, type: file.type, date: file.lastModified })

					var blobStream = ss.createBlobReadStream(file)
					var size = 0
					var progress_bar = document.createElement('div')
					progress_bar.setAttribute('class', 'ProgressBar')
					// progress_bar.setAttribute('style', 'width:100%; height:10px')
					var template_loader = `<div class="ProgressBar__barra">
																	</div>`
					progress_bar.innerHTML = template_loader
					$('#preview_box_to_chat').append(progress_bar)
					
					// progreso de carga en la subida el archivo
					blobStream.on('data', function(chunk) {
						//console.log(chunk)
					  size += chunk.length

					  var charge = Math.floor(size / file.size * 100)
					 
					  //console.log(charge + '%')

					  // progress_bar.innerHTML = charge + '%'
					  $('.ProgressBar__barra').css('width', charge + '%')

					  // -> e.g. '42%' 
					  if(Math.floor(size / file.size * 100) === 100) {
				  		//console.log('100% jajaja loader lol')
				  		$('#preview_box_to_chat').html('')
					  	//console.log('Carga COmpleta')
					    // Habilitar el boton de publicar
							//console.log('Ubicacion del archivo')
							var new_path = '/../../../../../news/' + file.name

					  	// Obteniendo datos del archivo subido
					  	file_data = file

					  	var contentBox = document.createElement('div')
					  	contentBox.setAttribute('class', 'PreviewFile__content--item')
					  	contentBox.setAttribute('id', 'ElementBox')

					  	$('#preview_box_to_chat').append(contentBox)

					  	if(file_data.type === 'image/png' || file_data.type === 'image/jpeg' || file_data.type === 'image/gif') {
					  		// El archivo subido es image/png o image/jpg o image/gif

						  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
					  		var preview_file = document.createElement('img')
					  		var tag_type_file = document.createElement('div')

					  		preview_file.src = new_path
					  		preview_file.className = 'PreviewImage'
					  		preview_file.type = file_data.type
					  		preview_file.value = file_data.name
					  		preview_file.id = "published_publish_multimedia_chat_path"
					  		// preview_file.width = 100

					  	} else if (file_data.type === 'video/mp4') {
					  		// El archivo subido es video/mp4

						  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
					  		var preview_file = document.createElement('video')
					  		//var preview_file_source = document.createElement('source')

					  		var tag_type_file = document.createElement('div')

					  		preview_file.src = new_path
					  		preview_file.type = file_data.type
					  		preview_file.value = file_data.name
					  		preview_file.className = 'PreviewVideo'
					  		preview_file.id = "published_publish_multimedia_chat_path"
					  		// preview_file.width = 300
					  		preview_file.controls = true

					  	} else if (file_data.type === 'audio/mp3') {
					  		// El archivo subido es audio/mp3

						  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
					  		var preview_file = document.createElement('audio')
					  		var tag_type_file = document.createElement('div')

					  		preview_file.src = new_path
					  		preview_file.type = file_data.type
					  		preview_file.value = file_data.name
					  		preview_file.id = "published_publish_multimedia_chat_path"
					  		preview_file.controls = true
					  	}

					  	$('#ElementBox').append(preview_file)
					  
					  }
					})
					 
					blobStream.pipe(stream)
				} else {
					$('#FileMessage').val('')
					$('#preview_box_to_chat').html('Archivo No Soportado')
				}
			})

			$('#TextMessage').blur(function(){
				var labelText = $('.textLabel')
				// console.log(this)
				if(this.innerHTML === '') {
					labelText.css('display', 'block')
				}
			})

			for (var i = 0; i < chat.length; i++) {
				var message = chat[i]
				if (message.user_id === idFriend) {
					messageFriend(chat[i])
				} else {
					myMessage(chat[i])
				}
			}

			$('.UserRoom__chat')[0].scrollTop = $('.UserRoom__chat')[0].scrollHeight

			console.log('dsadd2 --->')

			socket.on('chat', function (content){
				
				console.log('SOCKEET!!!!')
				console.log(socket)

				console.log('Datos del arreglo')

				/*var tra_Data_socket = socket._callbacks.chat[0]

				//console.log(socket._callbacks.chat.length)

				if(socket._callbacks.chat.length > 0) {
					console.log('ESTAR')
					socket._callbacks.chat = [] 
					socket._callbacks.chat[0] = tra_Data_socket
				}*/

				console.log('RESPUESTA DEL SERVER -- MENSAJE -- START <<<<<<')
				console.log(content)
				console.log('RESPUESTA DEL SERVER -- MENSAJE -- END <<<<<<')

				if (content.user_id === idFriend) {
					messageFriend(content)
				} else {
					myMessage(content)
				}
				if (document.querySelector('.UserRoom__chat')) {
					$('.UserRoom__chat')[0].scrollTop = $('.UserRoom__chat')[0].scrollHeight					
				}
			})

			console.log('dsadd3 --->')

			$('#TextMessage').keypress(function(tecla){
				if (tecla.keyCode === 13) {
					tecla.preventDefault()
					var message = $('#TextMessage')
					var message_multi_data = $('#FileMessage')

					number_val = 0

					// console.log(message_multi_data[0].files[0])
					if (message.html() !== '' || message_multi_data.val() !== '') {
						var data = {
							user_id:  myInfo._id,
							user_full_name: myInfo.full_name,
							user_avatar: myInfo.photo.path,
							message: message.html(),
							message_multi_data: {
								type: 'without_mutimedia'
							}
						}

						if (message_multi_data.val() !== '') {
							// var file_data = message_multi_data[0].files[0]
							// console.log(file_data)
							data.message_multi_data = {
								name: file_data.name,
								type: file_data.type,
								size: file_data.size,
								date: file_data.lastModified
							}
							// console.log(data)
							document.querySelector('#preview_box_to_chat').innerHTML = ''
							$('#FileMessage').val('')
						}
						// console.log(message_multi_data.val()[0.file[0]])
						socket.emit('chat', data)
						message.html('')
					}
				}
			})

			console.log('dsadd4 --->')

			$('.btns__btnSend--btn').on('click', function(){
				var message = $('#TextMessage')
				var message_multi_data = $('#FileMessage')

				number_val = 0

				// console.log(message_multi_data[0].files[0])
				if (message.html() !== '' || message_multi_data.val() !== '') {
					var data = {
						user_id:  myInfo._id,
						user_full_name: myInfo.full_name,
						user_avatar: myInfo.photo.path,
						message: message.html(),
						message_multi_data: {
							type: 'without_mutimedia'
						}
					}

					if (message_multi_data.val() !== '') {
						// var file_data = message_multi_data[0].files[0]
						// console.log(file_data)
						data.message_multi_data = {
							name: file_data.name,
							type: file_data.type,
							size: file_data.size,
							date: file_data.lastModified
						}
						// console.log(data)
						document.querySelector('#preview_box_to_chat').innerHTML = ''
						$('#FileMessage').val('')
					}
					// console.log(message_multi_data.val()[0.file[0]])
					socket.emit('chat', data)
					message.html('')
					$('.textLabel').css('display', 'block')
				}
			})

			//console.log(res)

			number_val += 1

		}, function(err){
			console.log(err)
		})
	}

	function messageFriend(chat){
		var message = chat
		var messageBox = document.createElement('div')
		messageBox.setAttribute('class', 'UserRoom__chat--message')
		var dateMessage = message.data_send || message.dateCreateRoom
		var template = ''
		if (message.message_multi_data.type === 'without_mutimedia') {	
			template = `<div class="ItemLeft">
										<div class="ItemLeft__content">
											<div class="ItemLeft__content--message">
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else if(message.message_multi_data.type === 'image/png' || message.message_multi_data.type === 'image/jpg' || message.message_multi_data.type === 'image/jpeg' || message.message_multi_data.type === 'image/gif'){
			template = `<div class="ItemLeft">
										<div class="ItemLeft__content">
											<div class="ItemLeft__content--message">
												<div class="Image" style="background-image:url('${message.message_multi_data.path}')"></div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else if(message.message_multi_data.type === 'video/mp4'){
			template = `<div class="ItemLeft">
										<div class="ItemLeft__content">
											<div class="ItemLeft__content--message">
												<div class="Video">
													<video class="Video__Item" controls="true" src="${message.message_multi_data.path}"></video>
												</div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else {
			template = `<div class="ItemLeft">
										<div class="ItemLeft__content">
											<div class="ItemLeft__content--message">
												<div class="Audio">
													<audio class="Audio__item" controls="true" src="${message.message_multi_data.path}"></audio>
												</div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		}
		messageBox.innerHTML = template
		$('.UserRoom__chat').append(messageBox)
	}

	function myMessage(chat){
		var message = chat
		var messageBox = document.createElement('div')
		messageBox.setAttribute('class', 'UserRoom__chat--message')
		var dateMessage = message.data_send || message.dateCreateRoom
		var template = ''
		if (message.message_multi_data.type === 'without_mutimedia') {	
			template = `<div class="ItemRight">
										<div class="ItemRight__content">
											<div class="ItemRight__content--message">
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else if(message.message_multi_data.type === 'image/png' || message.message_multi_data.type === 'image/jpg' || message.message_multi_data.type === 'image/jpeg' || message.message_multi_data.type === 'image/gif'){
			template = `<div class="ItemRight">
										<div class="ItemRight__content">
											<div class="ItemRight__content--message">
												<div class="Image" style="background-image:url('${message.message_multi_data.path}')"></div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else if(message.message_multi_data.type === 'video/mp4'){
			template = `<div class="ItemRight">
										<div class="ItemRight__content">
											<div class="ItemRight__content--message">
												<div class="Video">
													<video class="Video__Item" controls="true" src="${message.message_multi_data.path}"></video>
												</div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		} else {
			template = `<div class="ItemRight">
										<div class="ItemRight__content">
											<div class="ItemRight__content--message">
												<div class="Audio">
													<audio class="Audio__item" controls="true" src="${message.message_multi_data.path}"></audio>
												</div>
												<p class="contentMessage">${message.message}</p>
												<p class="dateMessage">${dateMessage}</p>
											</div>
										</div>
									</div>`
		}
		messageBox.innerHTML = template
		$('.UserRoom__chat').append(messageBox)
	}
	
	var id = userModel.getUserObject().user._id
	console.log(id)

	var socket = io('/chat-io')
	var socketStatus =  io('/connect-io')

	socket.on('chatListCounter', function (content) {
		console.log('ULTIMO COUNTER ITEM')
		console.log(content)

		var data = document.querySelector('[data-count-friend="'+content.user_id+'"]')
		var data_user_chat_room_id = document.querySelector('[data-room="'+content.chat_room_id+'"]')

		console.log('DATA here')
		console.log(data)


		if (data !== null && data_user_chat_room_id !== null) {
			console.log('IMPRESION DE LA DATA USER ID ')

			if (data.style.display === 'none') {
				data.style.display = 'block'
			}
			// console.log(content)
			data.innerHTML = content.counter
			// console.log(data)
		}
	})

	socket.on('counterChat', function(content){
		console.log('COUNTER GENERAL DE LECTURA')
		console.log(content)
		$('.CounterMessages').html(content)
	})

	socket.on('connect', function(){
		console.log('socket conectado')
		socket.emit('Chatroom_user', id)
		
	})

	// SOCKET STATUS ONLINE/OFFLINE
	socketStatus.on('connect', function(){
		socketStatus.emit('adduser', id)
	})

	socketStatus.on('user status on', function (content) {
		// console.log(content)
		var dataBox = document.querySelector('[data-connect-user-id="'+content.user+'"]')

		if (dataBox !== null) {
			console.log('#009688')
			dataBox.style.backgroundColor = '#009688'
		}
	})


	socketStatus.on('user status off', function (content) {
		// console.log(content)
		var dataBox = document.querySelector('[data-connect-user-id="'+content.user+'"]')

		if (dataBox !== null) {
			console.log('#9ea9af')
			dataBox.style.backgroundColor = '#9ea9af'
		}
	})

}])