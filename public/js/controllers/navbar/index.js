myApp.controller('navbarController', ['$scope', '$location', 'userModel', 'url', '$http', 'Loader', function($scope, $location, userModel, url, $http, Loader){
	angular.extend($scope, {
		doLogout: function(){
			userModel.doUserLogout()
			location.reload('/')
		},
		user: userModel.getUserObject(),
		navUrl: []
	})

	$scope.url_dashboard = url.dashboard
	$scope.url_users = url.usuarios
	$scope.url_kml = url.kml
	console.log(userModel.getUserObject())

	// $scope.notifications = []

	var it = 0
	$scope.viewOptionUser = function(){
		if (it === 0) {
			$('#viewSubNav').css('display', 'block')
			it = 1		
		} else {
			$('#viewSubNav').css('display', 'none')
			it = 0
		}
	}

	// $scope.viewNotification = false
	// $scope.NotNotification = false
	// $scope.itemsNotifications = []
	$scope.viewUsersFriends = false

	// count_Notificaiones()

	// function count_Notificaiones(){
	// 	//$scope.count = ''

	// 	// if (sessionStorage.getItem('count_Notificaiones')) {
	// 		// $scope.count = sessionStorage.getItem('count_Notificaiones')
	// 	// } else {
	// 		$http({
	// 			method: 'GET',
	// 			url: '/dashboard/notificaciones/get/no_read'
	// 		}).then(function(res){
	// 			console.log(res)
	// 			$('.CounterNotifications').html(res.data.notification_no_read_count)
	// 			//$scope.count = res.data.notification_no_read_count
	// 			// sessionStorage.setItem('count_Notificaiones', res.data.notification_no_read_count)
	// 		}, function(err){
	// 			console.log(err)
	// 		})
	// 	// }
	// }

	// $scope.notifications = function(){
	// 	if ($scope.viewNotification === true) {
	// 		$scope.viewNotification = false
	// 		$scope.itemsNotifications = []
	// 	} else {
	// 		$scope.viewNotification = true
	// 		Loader.create('.Notifications', 'listNotification')
	// 		// if (sessionStorage.getItem('Notifications')) {
	// 		// 	Loader.delete('.Notifications', 'listNotification')
	// 		// 	var NotificationsStorage = JSON.parse(sessionStorage.getItem('Notifications'))
	// 		// 	console.log(NotificationsStorage)
	// 		// 	for (var i = 0; i < NotificationsStorage.length; i++) {
	// 		// 		$scope.itemsNotifications.push(NotificationsStorage[i])
	// 		// 	}
	// 		// } else{
	// 			$http({
	// 				method: 'GET',
	// 				url: '/dashboard/notificaciones'
	// 			}).then(function(res){
	// 				console.log(res)
	// 				Loader.delete('.Notifications', 'listNotification')

	// 				var notifications = res.data.notificaciones
	// 				var newNotifications = []
	// 				for (var i = 0; i < notifications.length; i++) {
	// 					if (notifications[i].status_lectura === false) {
	// 						notifications[i].color = '#f5f5f5'
	// 					} else {
	// 						notifications[i].color = '#fff'
	// 					}
	// 				}

	// 				// $scope.itemsNotifications = res.data.notificaciones
	// 				for (var i = 0; i < res.data.notificaciones.length; i++) {
	// 					$scope.itemsNotifications.push(res.data.notificaciones[i])
	// 				}
	// 				// var itemsNotifications__string = JSON.stringify($scope.itemsNotifications)
	// 				// sessionStorage.setItem('Notifications', itemsNotifications__string)
	// 				if (res.data.notificaciones.length < 1) {
	// 					$scope.NotNotification = true
	// 				}
	// 			}, function(err){
	// 				console.log(err)
	// 			})

	// 		$scope.viewReport = function(content){
	// 			// console.log(content, status)
	// 			if (content.status_lectura === false) {
	// 				console.log(content)
	// 				console.log($('[data-id="'+content._id+'"]'))
	// 				$('[data-id="'+content._id+'"]').css('background-color', '#fff')


	// 				// var new_notifications = JSON.parse(sessionStorage.getItem('Notifications'))
	// 				var new_notifications = $('.CounterNotifications').html()
	// 				for (var i = 0; i < new_notifications.length; i++) {
	// 					if (new_notifications[i]._id === content._id) {
	// 						// console.log(new_notifications[i])
	// 						new_notifications[i].color = '#fff'
	// 						new_notifications[i].status_lectura = true
	// 					}
	// 				}

	// 				// sessionStorage.setItem('Notifications', JSON.stringify(new_notifications))

	// 				// var new_count = sessionStorage.getItem('count_Notificaiones')
	// 				var new_count = new_notifications
	// 				new_count--
	// 				// sessionStorage.setItem('count_Notificaiones', new_count)
	// 				$('.CounterNotifications').html(new_count)
	// 				//$scope.count = new_count
					
	// 				$http({
	// 					method: 'POST',
	// 					url: '/dashboard/notificaciones/'+content._id+'/change-to-read?_method=put'
	// 				}).then(function(res){
	// 					console.log(res)
	// 				}, function(err){
	// 					console.log(err)
	// 				})
	// 			}

	// 			var model = document.querySelector('.ModalReport')

	// 			if (!model) {
	// 				// console.log('No existe aun')
	// 				var contentModal = document.createElement('div')
	// 				contentModal.setAttribute('class', 'ModalReport')
	// 				var template = `<div class="Report">
	// 									<div class="Report__containner">
	// 										<div class="Report__containner--title">
	// 											<h3 class="TitleReport">${content.content.title}</h3>
	// 											<p class="SubtitleReport">${content.codigo_orden}</p>
	// 										</div>
	// 										<div class="Report__containner--description">
	// 											<div class="Description__detail">
	// 												<p>${content.content.detalle}</p>
	// 											</div>
	// 											<div class="Description__image">
	// 												<div class="Description__image--photo" style="background-image:url(${content.content.multimedia[0].path})">
	// 												</div>
	// 											</div>
	// 										</div>
	// 										<div class="Report__containner--btns">
	// 											<div class="cancel">
	// 												<button data-order="${content.work_order_id}" data-response="no" id="rechazarReporte">Rechazar</button>
	// 											</div>
	// 											<div class="acept">
	// 												<button data-order="${content.work_order_id}" data-response="si" id="aceptarReporte">Aceptar</button>
	// 											</div>
	// 										</div>
	// 									</div>
	// 								</div>`

	// 				// console.log(content)

	// 				contentModal.innerHTML = template

	// 				$('.container').append(contentModal)

	// 				$('#rechazarReporte').on('click', response)
	// 				$('#aceptarReporte').on('click', response)
	// 			}
	// 			$scope.viewNotification = false
	// 			$scope.itemsNotifications = []
	// 		}

	// 		function response(){
	// 			console.log('XD')
	// 			var response = this.getAttribute('data-response')
	// 			var codigo_order = this.getAttribute('data-order')

	// 			console.log(response, codigo_order)

	// 			data = {
	// 				report_accept: response
	// 			}

	// 			$http({
	// 				method: 'POST',
	// 				url: '/dashboard/ordenes_trabajo/'+codigo_order+'/change-status/reprogramado',
	// 				data: data
	// 			}).then(function(res){
	// 				console.log(res)
	// 				$('.ModalReport').remove()
	// 			}, function(err){
	// 				console.log(err)
	// 			})
	// 		}

	// 		$scope.viewOrder = function(){
	// 			console.log('XD1234567')
	// 		}

	// 		$scope.viewStatus = function(idOrder, idNotification, status){

	// 			if (status === false) {
	// 				console.log($('[data-id="'+idNotification+'"]'))
	// 				$('[data-id="'+idNotification+'"]').css('background-color', '#fff')

	// 				var new_notifications = $('.CounterNotifications').html()
	// 				// var new_notifications = JSON.parse(sessionStorage.getItem('Notifications'))
	// 				for (var i = 0; i < new_notifications.length; i++) {
	// 					if (new_notifications[i]._id === idNotification) {
	// 						// console.log(new_notifications[i])
	// 						new_notifications[i].color = '#fff'
	// 						new_notifications[i].status_lectura = true
	// 					}
	// 				}

	// 				// sessionStorage.setItem('Notifications', JSON.stringify(new_notifications))

	// 				// var new_count = sessionStorage.getItem('count_Notificaiones')
	// 				var new_count = new_notifications
	// 				new_count--
	// 				// sessionStorage.setItem('count_Notificaiones', new_count)
	// 				$('.CounterNotifications').html(new_count)
	// 				//$scope.count = new_count
					
	// 				$http({
	// 					method: 'POST',
	// 					url: '/dashboard/notificaciones/'+idNotification+'/change-to-read?_method=put'
	// 				}).then(function(res){
	// 					console.log(res)
	// 					$location.url('/dashboard/order/'+idOrder)
	// 				}, function(err){
	// 					console.log(err)
	// 				})
	// 			} else {
	// 				$location.url('/dashboard/order/'+idOrder)
	// 			}

	// 			// console.log(idOrder)
	// 		}

	// 		// var id_user = userModel.getUserObject().user._id
	// 		// console.log(id_user)

	// 		// var socket = io('/notificaciones-io')

	// 	}
	// }

	// var itListFriendsChat = 0
	// $('#messageChat').on('click', function(){
	// 	console.log('XD')
	// 	var box = $('#MessagesChatFriends')
	// 	if (box.css('right') === '-300px') {
	// 		console.log('hola')
	// 		box.animate({
	// 			right: '0'
	// 		})
	// 		ListRooms()
	// 	} else {
	// 		console.log('Adios')
	// 		box.animate({
	// 			right: '-300px'
	// 		})
	// 		setTimeout(function(){
	// 			$('.MessagesFriends__containner').remove()
	// 		}, 300)
	// 	}
	// })

	// var socketChat = io('/chat-io')
	// console.log(socketChat)

	// var socketChat;

	// // LISTA DE ROOM FRIENDS PARA CHAT
	// function ListRooms(){
	// 	$('.MessagesFriends').html('')
	// 	var containner = document.createElement('div')
	// 	containner.setAttribute('class', 'MessagesFriends__containner')
	// 	var template_box = `<div class="MessagesFriends__containner--search">
	// 												<button class="btnSearch" id="searchFriends">Ver Lista de usuarios</button>
	// 												<div class="CloseWindowFriend" id="CloseWindowFriend"><span class="icon-icon_chat_cerrar"></span></div>
	// 											</div>
	// 											<div class="MessagesFriends__containner--items" id="ElementsContainner">		
	// 											</div>`
	// 	containner.innerHTML = template_box
	// 	$('#MessagesChatFriends').append(containner)

	// 	// CERRADODE VENTANA DE AMIGOS/CHAT
	// 	$('#CloseWindowFriend').on('click', function(){
	// 		var box = $('#MessagesChatFriends')
	// 		box.animate({
	// 			right: '-300px'
	// 		})
	// 		setTimeout(function(){
	// 			$('.MessagesFriends__containner').remove()
	// 		}, 300)
	// 	})

	// 	$('#searchFriends').on('click', FindListFriend)

	// 	Loader.create('.MessagesFriends__containner--items', 'ItemsRooms')
	// 	$http({
	// 		method:'GET',
	// 		url:'/dashboard/chat/list'
	// 	}).then(function(res){
	// 		Loader.delete('.MessagesFriends__containner--items', 'ItemsRooms')
	// 		console.log(res)
	// 		var rooms = res.data.chats
	// 		for (var i = 0; i < rooms.length; i++) {
	// 			var user = rooms[i]
	// 			var item = document.createElement('div')
	// 			item.setAttribute('class', 'ItemRoom')
	// 			item.setAttribute('data-room', user.list.chat_content_id)
	// 			item.setAttribute('data-user-id', user.user_id)
	// 			var template = `<div class="ItemRoom__containner">
	// 												<div class="ItemRoom__containner--image" style="background-image:url(${user.photo.path})"><span data-count-friend="${user.user_id}" class="counter"></span></div>
	// 												<div class="ItemRoom__containner--text">
	// 													<p class="title">${user.name}</p>
	// 													<p class="subtitle">@${user.nick}</p>
	// 												</div>
	// 											</div>`
	// 			item.innerHTML = template
	// 			$('#ElementsContainner').append(item)
	// 		}

	// 		socketChat = io('/chat-io')

	// 		socketChat.on('connect', function() {

	// 			console.log('el socket se conecto para el counter ++++++');
	// 			// Connected, let's sign-up for to receive messages for this room
	// 			console.log('El usuario CLIENTE, se logro conectar!!!')
	// 			// console.log(res.data.chatContent._id)
	// 			var id = userModel.getUserObject().user._id
	// 			console.log(id)
	// 			socketChat.emit('Chatroom', id)
	// 		})

	// 		socketChat.on('counterChat', function(content){
	// 			console.log(content)
	// 		})
	// 		$('.ItemRoom').on('click', viewChat)
	// 	}, function(err){
	// 		console.log(err)
	// 	})
	// }

	// // BUSQUEDA DE LISTA DE AMIGOS
	// function FindListFriend(){
	// 	$('#ElementsContainner').html('')
	// 	Loader.create('.MessagesFriends__containner--items', 'ItemsRooms')
	// 	$http({
	// 		method: 'GET',
	// 		url: '/dashboard/chat/list-friends'
	// 	}).then(function(res){
	// 		Loader.delete('.MessagesFriends__containner--items', 'ItemsRooms')
	// 		console.log(res)
	// 		var Friend = res.data.friends
	// 		for (var i = 0; i < Friend.length; i++) {
	// 			var user = Friend[i]
	// 			var item = document.createElement('div')
	// 			item.setAttribute('class', 'ItemFriend')
	// 			// item.setAttribute('data-iduser', user.list.chat_content_id)
	// 			item.setAttribute('data-user-id', user._id)
	// 			var template = `<div class="ItemFriend__containner">
	// 												<div class="ItemFriend__containner--image" style="background-image:url(${user.photo.path})"><span data-count-friend="${user.user_id}" class="counter"></span></div>
	// 												<div class="ItemFriend__containner--text">
	// 													<p class="title">${user.full_name}</p>
	// 													<p class="subtitle">@${user.username}</p>
	// 												</div>
	// 											</div>`
	// 			item.innerHTML = template
	// 			$('#ElementsContainner').append(item)
	// 		}

	// 		$('.ItemFriend').on('click', newChat)
	// 	}, function(err){
	// 		console.log(err)
	// 	})
	// }

	// function newChat(){
	// 	console.log('XD')
	// 	$('.MessagesFriends__containner').html('')
	// 	Loader.create('.MessagesFriends__containner', 'newFirends')
	// 	var idFriend = this.getAttribute('data-user-id')
	// 	$http({
	// 		method: 'GET',
	// 		url:'/dashboard/chat/list'
	// 	}).then(function(res){
	// 		Loader.delete('.MessagesFriends__containner', 'newFirends')
	// 		console.log(res)
	// 		var room
	// 		if (res.data.chats.length === 0) {
	// 			newRoom(idFriend)
	// 		}
	// 		for (var i = 0; i < res.data.chats.length; i++) {
	// 			console.log(res.data.chats[i])
	// 			if (res.data.chats[i].user_id === idFriend) {
	// 				room = res.data.chats[i].list.chat_content_id
	// 				console.log(room, idFriend)
	// 				initChat(room, idFriend)
	// 				break
	// 			} else {
	// 				room = null
	// 				if (i === res.data.chats.length-1) {
	// 					console.log('No es resultado!')
	// 					if (room === null) {
	// 						console.log('No existe la sala')
	// 						newRoom(idFriend)
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}, function(err){
	// 		console.log(err)
	// 	})
	// }

	// function newRoom(idFriend){
	// 	console.log(idFriend)
	// 	$http({
	// 		method: 'POST',
	// 		url:'/dashboard/chat/new-chat/'+idFriend
	// 	}).then(function(res){
	// 		console.log(res)
	// 		var room = res.data.chat_room
	// 		var idFriend = res.data.friend_id
	// 		console.log(room, idFriend)
	// 		initChat(room, idFriend)
	// 	}, function(err){
	// 		console.log(err)
	// 	})
	// }

	// // VISTA ROOM DE CADA AMIGO
	// function viewChat(){
	// 	$('.MessagesFriends__containner').html('')
	// 	var idRoom = this.getAttribute('data-room')
	// 	var idFriend = this.getAttribute('data-user-id')
	// 	console.log(idRoom, idFriend)
	// 	initChat(idRoom, idFriend)
	// }
	
	
	// function initChat(idRoom, idFriend){
	// 	Loader.create('.MessagesFriends__containner', 'LoaderUserRoom')
	// 	$http({
	// 		method: 'POST',
	// 		url: '/dashboard/chat/room/'+idRoom+'/'+idFriend
	// 	}).then(function(res){
	// 		var infoFriend = res.data.friend
	// 		var chat = res.data.chatContent.messages
	// 		var myInfo = res.data.user
			
	// 		if(socketChat == null){
	// 			console.log('socket chat is null');
	// 			socketChat = io('/chat-io')
	// 		}
	// 		console.log(socketChat.connected);
	// 		if(!socketChat.connected){
	// 			console.log('socket chat is not connected')
	// 			socketChat.on('connect', function() {
	// 				console.log('se conecto al chat *****')
	// 				// Connected, let's sign-up for to receive messages for this room
	// 				//console.log('El usuario CLIENTE, se logro conectar!!!')
	// 				//console.log(res.data.chatContent._id)
	// 				socketChat.emit('Chatroom', res.data.chatContent._id)
	// 			})	
	// 		}
	// 		socketChat.emit('Chatroom', res.data.chatContent._id)
	// 		console.log(socketChat)
	// 		//socketChat.emit('Chatroom', res.data.chatContent._id)
				  

	// 		Loader.delete('.MessagesFriends__containner', 'LoaderUserRoom')
	// 		var containner = document.createElement('div')
	// 		containner.setAttribute('class','UserRoom')
	// 		var template_box = `<div class="UserRoom__head">
	// 													<div class="UserRoom__head--image" style="background-image:url(${infoFriend.photo.path})">
	// 													</div>
	// 													<div class="UserRoom__head--text">
	// 														<p class="title">${infoFriend.name}</p>
	// 													</div>
	// 													<div class="backUsers" id="backUsers"><span class="icon-icon_chat_inbox_cerrar"></span></div>
	// 												</div>
	// 												<div class="UserRoom__chat">
	// 												</div>
	// 												<div class="UserRoom__form">
	// 													<div class="UserRoom__form--containner">
	// 														<div class="inputMessage">
	// 															<div class="textLabel"><span>Escribe un mensaje</span></div>
	// 															<div class="TextMessage" id="TextMessage" contentEditable="true"></div>
	// 														</div>
	// 														<div class="PreviewFile">
	// 															<div class="PreviewFile__content" id="preview_box_to_chat"></div>
	// 														</div>
	// 														<div class="btns">
	// 															<div class="btns__inputFile">
	// 																<label for="FileMessage"><span class="icon-icon_imagen"></span></label>
	// 																<input class="btns__inputFile--input" type="file" id="FileMessage"/>
	// 															</div>
	// 															<div class="btns__btnSend">
	// 																<button class="btns__btnSend--btn">Enviar</button>
	// 															</div>
	// 														</div>
	// 													</div>
	// 												</div>`

	// 		containner.innerHTML = template_box
	// 		$('.MessagesFriends__containner').append(containner)
	// 		$('#backUsers').on('click', ListRooms)

	// 		$('#TextMessage').focus(function(){
	// 			var labelText = $('.textLabel')
	// 			// console.log(this)
	// 			labelText.css('display', 'none')
	// 		})

	// 		var file_data

	// 		$('#FileMessage').change(function(e) {
	// 			//console.log('Evento uploar file activado')
	// 			var file = e.target.files[0]
	// 			//console.log('datos del archivo')

	// 			//console.log(file)
			    
	// 			if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'video/mp4' || file.type === 'audio/mp3') {
	// 				var stream = ss.createStream()
						
	// 				ss(socketChat).emit('up_file_to_chat', stream, { name: file.name, size: file.size, type: file.type, date: file.lastModified })

	// 				var blobStream = ss.createBlobReadStream(file)
	// 				var size = 0
	// 				var progress_bar = document.createElement('div')
	// 				progress_bar.setAttribute('class', 'ProgressBar')
	// 				// progress_bar.setAttribute('style', 'width:100%; height:10px')
	// 				var template_loader = `<div class="ProgressBar__barra">
	// 																</div>`
	// 				progress_bar.innerHTML = template_loader
	// 				$('#preview_box_to_chat').append(progress_bar)
					
	// 				// progreso de carga en la subida el archivo
	// 				blobStream.on('data', function(chunk) {
	// 					//console.log(chunk)
	// 				  size += chunk.length

	// 				  var charge = Math.floor(size / file.size * 100)
					 
	// 				  //console.log(charge + '%')

	// 				  // progress_bar.innerHTML = charge + '%'
	// 				  $('.ProgressBar__barra').css('width', charge + '%')

	// 				  // -> e.g. '42%' 
	// 				  if(Math.floor(size / file.size * 100) === 100) {
	// 			  		//console.log('100% jajaja loader lol')
	// 			  		$('#preview_box_to_chat').html('')
	// 				  	//console.log('Carga COmpleta')
	// 				    // Habilitar el boton de publicar
	// 						//console.log('Ubicacion del archivo')
	// 						var new_path = '/../../../../../news/' + file.name

	// 				  	// Obteniendo datos del archivo subido
	// 				  	file_data = file

	// 				  	var contentBox = document.createElement('div')
	// 				  	contentBox.setAttribute('class', 'PreviewFile__content--item')
	// 				  	contentBox.setAttribute('id', 'ElementBox')

	// 				  	$('#preview_box_to_chat').append(contentBox)

	// 				  	if(file_data.type === 'image/png' || file_data.type === 'image/jpeg' || file_data.type === 'image/gif') {
	// 				  		// El archivo subido es image/png o image/jpg o image/gif

	// 					  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
	// 				  		var preview_file = document.createElement('img')
	// 				  		var tag_type_file = document.createElement('div')

	// 				  		preview_file.src = new_path
	// 				  		preview_file.className = 'PreviewImage'
	// 				  		preview_file.type = file_data.type
	// 				  		preview_file.value = file_data.name
	// 				  		preview_file.id = "published_publish_multimedia_chat_path"
	// 				  		// preview_file.width = 100

	// 				  	} else if (file_data.type === 'video/mp4') {
	// 				  		// El archivo subido es video/mp4

	// 					  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
	// 				  		var preview_file = document.createElement('video')
	// 				  		//var preview_file_source = document.createElement('source')

	// 				  		var tag_type_file = document.createElement('div')

	// 				  		preview_file.src = new_path
	// 				  		preview_file.type = file_data.type
	// 				  		preview_file.value = file_data.name
	// 				  		preview_file.className = 'PreviewVideo'
	// 				  		preview_file.id = "published_publish_multimedia_chat_path"
	// 				  		// preview_file.width = 300
	// 				  		preview_file.controls = true

	// 				  	} else if (file_data.type === 'audio/mp3') {
	// 				  		// El archivo subido es audio/mp3

	// 					  	// Pegando template de contendor de imagen - segun el file.type el tipo de contenerdor de multimedia
	// 				  		var preview_file = document.createElement('audio')
	// 				  		var tag_type_file = document.createElement('div')

	// 				  		preview_file.src = new_path
	// 				  		preview_file.type = file_data.type
	// 				  		preview_file.value = file_data.name
	// 				  		preview_file.id = "published_publish_multimedia_chat_path"
	// 				  		preview_file.controls = true
	// 				  	}

	// 				  	$('#ElementBox').append(preview_file)
					  
	// 				  }
	// 				})
					 
	// 				blobStream.pipe(stream)
	// 			} else {
	// 				$('#FileMessage').val('')
	// 				$('#preview_box_to_chat').html('Archivo No Soportado')
	// 			}
	// 		})

	// 		$('#TextMessage').blur(function(){
	// 			var labelText = $('.textLabel')
	// 			// console.log(this)
	// 			if(this.innerHTML === '') {
	// 				labelText.css('display', 'block')
	// 			}
	// 		})

	// 		for (var i = 0; i < chat.length; i++) {
	// 			var message = chat[i]
	// 			if (message.user_id === idFriend) {
	// 				messageFriend(chat[i])
	// 			} else {
	// 				myMessage(chat[i])
	// 			}
	// 		}

	// 		$('.UserRoom__chat')[0].scrollTop = $('.UserRoom__chat')[0].scrollHeight

	// 		socketChat.on('chat', function (content){
	// 			//console.log('RESPUESTA DEL SERVER -- MENSAJE -- START <<<<<<')
	// 			//console.log(content)
	// 			//console.log('RESPUESTA DEL SERVER -- MENSAJE -- END <<<<<<')

	// 			if (content.user_id === idFriend) {
	// 				messageFriend(content)
	// 			} else {
	// 				myMessage(content)
	// 			}

	// 			$('.UserRoom__chat')[0].scrollTop = $('.UserRoom__chat')[0].scrollHeight
	// 		})

	// 		$('#TextMessage').keypress(function(tecla){
	// 			if (tecla.keyCode === 13) {
	// 				tecla.preventDefault()
	// 				var message = $('#TextMessage')
	// 				var message_multi_data = $('#FileMessage')
	// 				// console.log(message_multi_data[0].files[0])
	// 				if (message.html() !== '' || message_multi_data.val() !== '') {
	// 					var data = {
	// 						user_id:  myInfo._id,
	// 						user_full_name: myInfo.full_name,
	// 						user_avatar: myInfo.photo.path,
	// 						message: message.html(),
	// 						message_multi_data: {
	// 							type: 'without_mutimedia'
	// 						}
	// 					}

	// 					if (message_multi_data.val() !== '') {
	// 						// var file_data = message_multi_data[0].files[0]
	// 						// console.log(file_data)
	// 						data.message_multi_data = {
	// 							name: file_data.name,
	// 							type: file_data.type,
	// 							size: file_data.size,
	// 							date: file_data.lastModified
	// 						}
	// 						// console.log(data)
	// 						document.querySelector('#preview_box_to_chat').innerHTML = ''
	// 						$('#FileMessage').val('')
	// 					}
	// 					// console.log(message_multi_data.val()[0.file[0]])
	// 					socketChat.emit('chat', data)
	// 					message.html('')
	// 				}
	// 			}
	// 		})

	// 		$('.btns__btnSend--btn').on('click', function(){
	// 			var message = $('#TextMessage')
	// 			var message_multi_data = $('#FileMessage')
	// 			// console.log(message_multi_data[0].files[0])
	// 			if (message.html() !== '' || message_multi_data.val() !== '') {
	// 				var data = {
	// 					user_id:  myInfo._id,
	// 					user_full_name: myInfo.full_name,
	// 					user_avatar: myInfo.photo.path,
	// 					message: message.html(),
	// 					message_multi_data: {
	// 						type: 'without_mutimedia'
	// 					}
	// 				}

	// 				if (message_multi_data.val() !== '') {
	// 					// var file_data = message_multi_data[0].files[0]
	// 					// console.log(file_data)
	// 					data.message_multi_data = {
	// 						name: file_data.name,
	// 						type: file_data.type,
	// 						size: file_data.size,
	// 						date: file_data.lastModified
	// 					}
	// 					// console.log(data)
	// 					document.querySelector('#preview_box_to_chat').innerHTML = ''
	// 					$('#FileMessage').val('')
	// 				}
	// 				// console.log(message_multi_data.val()[0.file[0]])
	// 				socketChat.emit('chat', data)
	// 				message.html('')
	// 				$('.textLabel').css('display', 'block')
	// 			}
	// 		})
	// 		//console.log(res)
	// 	}, function(err){
	// 		console.log(err)
	// 	})
	// }

	// function sendMessage(){
	// 	var message = $('#TextMessage')
	// 	var message_multi_data = $('#FileMessage')
	// 	// console.log(message_multi_data[0].files[0])
	// 	if (message.html() !== '' || message_multi_data.val() !== '') {
	// 		var data = {
	// 			user_id:  myInfo._id,
	// 			user_full_name: myInfo.full_name,
	// 			user_avatar: myInfo.photo.path,
	// 			message: message.html(),
	// 			message_multi_data: {
	// 				type: 'without_mutimedia'
	// 			}
	// 		}

	// 		if (message_multi_data.val() !== '') {
	// 			// var file_data = message_multi_data[0].files[0]
	// 			// console.log(file_data)
	// 			data.message_multi_data = {
	// 				name: file_data.name,
	// 				type: file_data.type,
	// 				size: file_data.size,
	// 				date: file_data.lastModified
	// 			}
	// 			// console.log(data)
	// 			document.querySelector('#preview_box_to_chat').innerHTML = ''
	// 			$('#FileMessage').val('')
	// 		}
	// 		// console.log(message_multi_data.val()[0.file[0]])
	// 		socketChat.emit('chat', data)
	// 		message.html('')
	// 	}
	// }

	// function messageFriend(chat){
	// 	var message = chat
	// 	var messageBox = document.createElement('div')
	// 	messageBox.setAttribute('class', 'UserRoom__chat--message')
	// 	var dateMessage = message.data_send || message.dateCreateRoom
	// 	var template = ''
	// 	if (message.message_multi_data.type === 'without_mutimedia') {	
	// 		template = `<div class="ItemLeft">
	// 									<div class="ItemLeft__content">
	// 										<div class="ItemLeft__content--message">
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else if(message.message_multi_data.type === 'image/png' || message.message_multi_data.type === 'image/jpg' || message.message_multi_data.type === 'image/jpeg' || message.message_multi_data.type === 'image/gif'){
	// 		template = `<div class="ItemLeft">
	// 									<div class="ItemLeft__content">
	// 										<div class="ItemLeft__content--message">
	// 											<div class="Image" style="background-image:url('${message.message_multi_data.path}')"></div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else if(message.message_multi_data.type === 'video/mp4'){
	// 		template = `<div class="ItemLeft">
	// 									<div class="ItemLeft__content">
	// 										<div class="ItemLeft__content--message">
	// 											<div class="Video">
	// 												<video class="Video__Item" controls="true" src="${message.message_multi_data.path}"></video>
	// 											</div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else {
	// 		template = `<div class="ItemLeft">
	// 									<div class="ItemLeft__content">
	// 										<div class="ItemLeft__content--message">
	// 											<div class="Audio">
	// 												<audio class="Audio__item" controls="true" src="${message.message_multi_data.path}"></audio>
	// 											</div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	}
	// 	messageBox.innerHTML = template
	// 	$('.UserRoom__chat').append(messageBox)
	// }

	// function myMessage(chat){
	// 	var message = chat
	// 	var messageBox = document.createElement('div')
	// 	messageBox.setAttribute('class', 'UserRoom__chat--message')
	// 	var dateMessage = message.data_send || message.dateCreateRoom
	// 	var template = ''
	// 	if (message.message_multi_data.type === 'without_mutimedia') {	
	// 		template = `<div class="ItemRight">
	// 									<div class="ItemRight__content">
	// 										<div class="ItemRight__content--message">
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else if(message.message_multi_data.type === 'image/png' || message.message_multi_data.type === 'image/jpg' || message.message_multi_data.type === 'image/jpeg' || message.message_multi_data.type === 'image/gif'){
	// 		template = `<div class="ItemRight">
	// 									<div class="ItemRight__content">
	// 										<div class="ItemRight__content--message">
	// 											<div class="Image" style="background-image:url('${message.message_multi_data.path}')"></div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else if(message.message_multi_data.type === 'video/mp4'){
	// 		template = `<div class="ItemRight">
	// 									<div class="ItemRight__content">
	// 										<div class="ItemRight__content--message">
	// 											<div class="Video">
	// 												<video class="Video__Item" controls="true" src="${message.message_multi_data.path}"></video>
	// 											</div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	} else {
	// 		template = `<div class="ItemRight">
	// 									<div class="ItemRight__content">
	// 										<div class="ItemRight__content--message">
	// 											<div class="Audio">
	// 												<audio class="Audio__item" controls="true" src="${message.message_multi_data.path}"></audio>
	// 											</div>
	// 											<p class="contentMessage">${message.message}</p>
	// 											<p class="dateMessage">${dateMessage}</p>
	// 										</div>
	// 									</div>
	// 								</div>`
	// 	}
	// 	messageBox.innerHTML = template
	// 	$('.UserRoom__chat').append(messageBox)
	// }

	// var socket = io('/notificaciones-io')

	// socket.on('notis_one_user', function (content) {
	// 	console.log(content)

	// 	if (content.status_lectura === false) {
	// 		content.color = '#f5f5f5'
	// 	} else {
	// 		content.color = '#fff'
	// 	}

	// 	//$scope.itemsNotifications.unshift(content)
	// 	console.log($scope.itemsNotifications)
	// 	console.log(content)
	// 	var NotificationsStorage = JSON.parse(sessionStorage.getItem('Notifications'))
	// 	NotificationsStorage.unshift(content)
	// 	console.log(NotificationsStorage)
	// 	// JSON.stringify
	// 	sessionStorage.setItem('Notifications', JSON.stringify(NotificationsStorage))

	// 	console.log('Mensaje Notificacion')
	// 	console.log(content)
	// 	// Notification.requestPermission(function(permission){
	// 	// 	var body = `Tienes una nueva notificación`
	// 	//   var notification = new Notification("Astrum",{
	// 	//     body: body,
	// 	//     icon:'../../../images/logoAscent.png',
	// 	//     dir:'auto'         
	// 	//   });

	// 	//   notification.onclick = function() {
	// 	//     window.open("https://wos.astrumla.com/");
	// 	//   };
	// 	//   setTimeout(function(){
	// 	//     notification.close();
	// 	//   },4000);
	// 	// })
	// })

	// socket.on('notis_counter', function(count) {
	// 	console.log('Cantidad de Notificaciones')
	// 	console.log(count)
	// 	//$scope.count = count
	// 	var count_Notificaiones = sessionStorage.getItem('count_Notificaiones')
	// 	$('.CounterNotifications').html(count)
	// 	count_Notificaiones++
	// 	sessionStorage.setItem('count_Notificaiones', count_Notificaiones)
	// })

	// var id_user = userModel.getUserObject().user._id
	// // console.log(id_user)
	// // Socket.connect()

	// // var NotificationsRoom = document.querySelector('#NotificationsRoom').value

	// socket.on('connect', function() {
	//   socket.emit('NotificationsRoom', id_user)
	// 	console.log('Me conete con el servidor')
	// })	
}])