myApp.controller('chatController', ['$scope', '$http', 'Loader', function($scope, $http, Loader){
	// LISTA DE ROOM FRIENDS PARA CHAT
	function ListRooms(){
		var containner = document.createElement('div')
		containner.setAttribute('class', 'MessagesFriends__containner')
		var template_box = `<div class="MessagesFriends__containner--search">
													<button id="searchFriends">Buscar Amigos</button>
												</div>
												<div class="MessagesFriends__containner--items" id="ElementsContainner">		
												</div>`
		containner.innerHTML = template_box
		$('#MessagesChatFriends').append(containner)

		Loader.create('.MessagesFriends__containner--items', 'ItemsRooms')
		$http({
			method:'GET',
			url:'/dashboard/chat/list'
		}).then(function(res){
			Loader.delete('.MessagesFriends__containner--items', 'ItemsRooms')
			console.log(res)
			var rooms = res.data.chats
			for (var i = 0; i < rooms.length; i++) {
				var user = rooms[i]
				var item = document.createElement('div')
				item.setAttribute('class', 'ItemRoom')
				item.setAttribute('data-room', user.list.chat_content_id)
				item.setAttribute('data-user-id', user.user_id)
				var template = `<div class="ItemRoom__containner">
													<div class="ItemRoom__containner--image" style="background-image:url(${user.photo.path})"><span data-count-friend="${user.user_id}" class="counter"></span></div>
													<div class="ItemRoom__containner--text">
														<p class="title">${user.name}</p>
														<p class="subtitle">@${user.nick}</p>
													</div>
												</div>`
				item.innerHTML = template
				$('#ElementsContainner').append(item)

			}

			$('.ItemRoom').on('click', viewChat)
		}, function(err){
			console.log(err)
		})
	}

	ListRooms()

	// VISTA ROOM DE CADA AMIGO
	function viewChat(){
		$('.MessagesFriends__containner').html('')
		var idRoom = this.getAttribute('data-room')
		var idFriend = this.getAttribute('data-user-id')
		console.log(idRoom, idFriend)
		Loader.create('.MessagesFriends__containner', 'LoaderUserRoom')
		$http({
			method: 'POST',
			url: '/dashboard/chat/room/'+idRoom+'/'+idFriend
		}).then(function(res){
			var infoFriend = res.data.friend
			var chat = res.data.chatContent.messages
			var myInfo = res.data.user
			var socketChat = io('/chat-io')

			//socketChat.emit('Chatroom', res.data.chatContent._id)
			socketChat.on('connect', function() {
				// Connected, let's sign-up for to receive messages for this room
				console.log('El usuario CLIENTE, se logro conectar!!!')
				console.log(res.data.chatContent._id)
				socketChat.emit('Chatroom', res.data.chatContent._id)
			})		  

			Loader.delete('.MessagesFriends__containner', 'LoaderUserRoom')
			var containner = document.createElement('div')
			containner.setAttribute('class','UserRoom')
			var template_box = `<div class="UserRoom__head">
														<div class="UserRoom__head--image" style="background-image:url(${infoFriend.photo.path})">
														</div>
														<div class="UserRoom__head--text">
															<p class="title">${infoFriend.name}</p>
														</div>
													</div>
													<div class="UserRoom__chat">
													</div>
													<div class="UserRoom__form">
														<div class="UserRoom__form--containner">
															<div class="inputMessage">
																<div class="textLabel"><span>Escribe un mensaje</span></div>
																<div class="TextMessage" id="TextMessage" contentEditable="true"></div>
															</div>
															<div class="btns">
																<div class="btns__inputFile">
																	<label for="FileMessage"><span class="icon-icon_imagen"></span></label>
																	<input class="btns__inputFile--input" type="file" id="FileMessage"/>
																</div>
																<div class="btns__btnSend">
																	<button class="btns__inputFile--btn">Enviar</button>
																</div>
															</div>
														</div>
													</div>`

			containner.innerHTML = template_box
			$('.MessagesFriends__containner').append(containner)
			$('.UserRoom__form').on('change', function(){
				console.log('change div')
			})

			$('#TextMessage').focus(function(){
				var labelText = $('.textLabel')
				// console.log(this)
				labelText.css('display', 'none')
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

			socketChat.on('chat', function (content){
				console.log('RESPUESTA DEL SERVER -- MENSAJE -- START <<<<<<')
				console.log(content)
				console.log('RESPUESTA DEL SERVER -- MENSAJE -- END <<<<<<')

				if (content.user_id === idFriend) {
					messageFriend(content)
				} else {
					myMessage(content)
				}
				
				$('.UserRoom__chat')[0].scrollTop = $('.UserRoom__chat')[0].scrollHeight
			})

			$('#TextMessage').keypress(function(tecla){
				if (tecla.keyCode === 13) {
					tecla.preventDefault()
					var message = $('#TextMessage')
					var data = {
						user_id:  myInfo._id,
						user_full_name: myInfo.full_name,
						user_avatar: myInfo.photo.path,
						message: message.html(),
						message_multi_data: {
							type: 'without_mutimedia'
						}
					}
					socketChat.emit('chat', data)
					message.html('')
				}
			})
			console.log(res)
		}, function(err){
			console.log(err)
		})
	}

	function messageFriend(chat){
		var message = chat
		var messageBox = document.createElement('div')
		messageBox.setAttribute('class', 'UserRoom__chat--message')
		var dateMessage = message.data_send || message.dateCreateRoom
		template = `<div class="ItemLeft">
									<div class="ItemLeft__content">
										<div class="ItemLeft__content--message">
											<p class="contentMessage">${message.message}</p>
											<p class="dateMessage">${dateMessage}</p>
										</div>
									</div>
								</div>`
		messageBox.innerHTML = template
		$('.UserRoom__chat').append(messageBox)
	}

	function myMessage(chat){
		var message = chat
		var messageBox = document.createElement('div')
		messageBox.setAttribute('class', 'UserRoom__chat--message')
		var dateMessage = message.data_send || message.dateCreateRoom
		template = `<div class="ItemRight">
									<div class="ItemRight__content">
										<div class="ItemRight__content--message">
											<p class="contentMessage">${message.message}</p>
											<p class="dateMessage">${dateMessage}</p>
										</div>
									</div>
								</div>`
		messageBox.innerHTML = template
		$('.UserRoom__chat').append(messageBox)
	}

}])