myApp.controller('notificationController', ['$scope', 'userModel', '$http', 'Loader', '$location', function($scope, userModel, $http, Loader, $location){
	$scope.itemsNotifications = []
	console.log('XD')
// actionLink__notification--icon
	$('.ViewNotification').css('display', 'none')

	// var it = 0
	// $scope.viewOptionUser = function(){
	// 	if (it === 0) {
	// 		$('#viewSubNav').css('display', 'block')
	// 		it = 1		
	// 	} else {
	// 		$('#viewSubNav').css('display', 'none')
	// 		it = 0
	// 	}
	// }

	// $scope.viewNotification = false
	$scope.NotNotification = false
	$scope.CountTotalNotification = false
	$scope.itemsNotifications = []


	count_Notificaiones()

	function count_Notificaiones(){
		$http({
			method: 'GET',
			url: '/dashboard/notificaciones/get/no_read'
		}).then(function(res){
			console.log(res)
			$('.CounterNotifications').html(res.data.notification_no_read_count)
			//$scope.count = res.data.notification_no_read_count
			// sessionStorage.setItem('count_Notificaiones', res.data.notification_no_read_count)
		}, function(err){
			console.log(err)
		})
		// }
	}

	$('.actionLink__notification--icon').on('click', function(){
		if ($('.ViewNotification').css('display') === 'block') {
			$('.ViewNotification').css('display', 'none')
			$scope.itemsNotifications = []
		} else {
			$('.ViewNotification').css('display',' block')
			Loader.create('.Notifications', 'listNotification')
			// if (sessionStorage.getItem('Notifications')) {
			// 	Loader.delete('.Notifications', 'listNotification')
			// 	var NotificationsStorage = JSON.parse(sessionStorage.getItem('Notifications'))
			// 	console.log(NotificationsStorage)
			// 	for (var i = 0; i < NotificationsStorage.length; i++) {
			// 		$scope.itemsNotifications.push(NotificationsStorage[i])
			// 	}
			// } else{
				$http({
					method: 'GET',
					url: '/dashboard/notificaciones'
				}).then(function(res){
					console.log(res)
					Loader.delete('.Notifications', 'listNotification')

					var notifications = res.data.notificaciones
					var newNotifications = []
					for (var i = 0; i < notifications.length; i++) {
						if (notifications[i].status_lectura === false) {
							notifications[i].color = '#f5f5f5'
						} else {
							notifications[i].color = '#fff'
						}
					}

					// $scope.itemsNotifications = res.data.notificaciones
					for (var i = 0; i < res.data.notificaciones.length; i++) {
						$scope.itemsNotifications.push(res.data.notificaciones[i])
					}
					// var itemsNotifications__string = JSON.stringify($scope.itemsNotifications)
					// sessionStorage.setItem('Notifications', itemsNotifications__string)
					if (res.data.notificaciones.length < 1) {
						$scope.NotNotification = true
					}

					if (res.data.notificaciones_cant_news > 20) {
						$scope.CountTotalNotification = true
					}

				}, function(err){
					console.log(err)
				})

			$scope.moreNotification = function(){
				console.log('jsjsjs')
				$http({
					method: 'GET',
					url: '/dashboard/notificaciones/more'
				}).then(function(res){
					console.log(res)

					var notifications = res.data.notificaciones
					var newNotifications = []
					$scope.itemsNotifications = []
					for (var i = 0; i < notifications.length; i++) {
						if (notifications[i].status_lectura === false) {
							notifications[i].color = '#f5f5f5'
						} else {
							notifications[i].color = '#fff'
						}
					}
					// $scope.itemsNotifications = res.data.notificaciones
					for (var i = 0; i < res.data.notificaciones.length; i++) {
						$scope.itemsNotifications.push(res.data.notificaciones[i])
					}
					$scope.CountTotalNotification = false
				}, function(err){
					console.log(err)
				})
			}

			$scope.viewReport = function(content){
				// console.log(content, status)
				if (content.status_lectura === false) {
					console.log(content)
					console.log($('[data-id="'+content._id+'"]'))
					$('[data-id="'+content._id+'"]').css('background-color', '#fff')


					// var new_notifications = JSON.parse(sessionStorage.getItem('Notifications'))
					var new_notifications = $('.CounterNotifications').html()
					for (var i = 0; i < new_notifications.length; i++) {
						if (new_notifications[i]._id === content._id) {
							// console.log(new_notifications[i])
							new_notifications[i].color = '#fff'
							new_notifications[i].status_lectura = true
						}
					}

					// sessionStorage.setItem('Notifications', JSON.stringify(new_notifications))

					// var new_count = sessionStorage.getItem('count_Notificaiones')
					var new_count = new_notifications
					new_count--
					// sessionStorage.setItem('count_Notificaiones', new_count)
					$('.CounterNotifications').html(new_count)
					//$scope.count = new_count
					
					$http({
						method: 'POST',
						url: '/dashboard/notificaciones/'+content._id+'/change-to-read?_method=put'
					}).then(function(res){
						console.log(res)
					}, function(err){
						console.log(err)
					})
				}

				var model = document.querySelector('.ModalReport')

				if (!model) {
					// console.log('No existe aun')
					var contentModal = document.createElement('div')
					contentModal.setAttribute('class', 'ModalReport')
					var template = `<div class="Report">
										<div class="Report__containner">
											<div class="Report__containner--title">
												<h3 class="TitleReport">${content.content.title}</h3>
												<p class="SubtitleReport">${content.codigo_orden}</p>
											</div>
											<div class="Report__containner--description">
												<div class="Description__detail">
													<p>${content.content.detalle}</p>
												</div>
												<div class="Description__image">
													<div class="Description__image--photo" style="background-image:url(${content.content.multimedia[0].path})">
													</div>
												</div>
											</div>
											<div class="Report__containner--btns">
												<div class="cancel">
													<button data-order="${content.work_order_id}" data-response="no" id="rechazarReporte">Rechazar</button>
												</div>
												<div class="acept">
													<button data-order="${content.work_order_id}" data-response="si" id="aceptarReporte">Aceptar</button>
												</div>
											</div>
										</div>
									</div>`

					// console.log(content)

					contentModal.innerHTML = template

					$('.container').append(contentModal)

					$('#rechazarReporte').on('click', response)
					$('#aceptarReporte').on('click', response)
				}
				// $scope.viewNotification = false
				$('.ViewNotification').css('display', 'none')
				$scope.itemsNotifications = []
			}

			function response(){
				console.log('XD')
				var response = this.getAttribute('data-response')
				var codigo_order = this.getAttribute('data-order')

				console.log(response, codigo_order)

				data = {
					report_accept: response
				}

				$http({
					method: 'POST',
					url: '/dashboard/ordenes_trabajo/'+codigo_order+'/change-status/reprogramado',
					data: data
				}).then(function(res){
					console.log(res)
					$('.ModalReport').remove()
				}, function(err){
					console.log(err)
				})
			}

			$scope.viewOrder = function(){
				console.log('XD1234567')
			}

			$scope.viewStatus = function(idOrder, idNotification, status){

				if (status === false) {
					console.log($('[data-id="'+idNotification+'"]'))
					$('[data-id="'+idNotification+'"]').css('background-color', '#fff')

					var new_notifications = $('.CounterNotifications').html()
					// var new_notifications = JSON.parse(sessionStorage.getItem('Notifications'))
					for (var i = 0; i < new_notifications.length; i++) {
						if (new_notifications[i]._id === idNotification) {
							// console.log(new_notifications[i])
							new_notifications[i].color = '#fff'
							new_notifications[i].status_lectura = true
						}
					}

					// sessionStorage.setItem('Notifications', JSON.stringify(new_notifications))

					// var new_count = sessionStorage.getItem('count_Notificaiones')
					var new_count = new_notifications
					new_count--
					// sessionStorage.setItem('count_Notificaiones', new_count)
					$('.CounterNotifications').html(new_count)
					//$scope.count = new_count
					
					$http({
						method: 'POST',
						url: '/dashboard/notificaciones/'+idNotification+'/change-to-read?_method=put'
					}).then(function(res){
						console.log(res)
						$location.url('/dashboard/order/'+idOrder)
					}, function(err){
						console.log(err)
					})
				} else {
					$location.url('/dashboard/order/'+idOrder)
				}

				// console.log(idOrder)
			}
		}		
	})

	var socket = io('/notificaciones-io')

	socket.on('notis_one_user', function (content) {
		console.log(content)

		if (content.status_lectura === false) {
			content.color = '#f5f5f5'
		} else {
			content.color = '#fff'
		}

		//$scope.itemsNotifications.unshift(content)
		console.log($scope.itemsNotifications)
		console.log(content)
		var NotificationsStorage = JSON.parse(sessionStorage.getItem('Notifications'))
		NotificationsStorage.unshift(content)
		console.log(NotificationsStorage)
		// JSON.stringify
		sessionStorage.setItem('Notifications', JSON.stringify(NotificationsStorage))

		console.log('Mensaje Notificacion')
		console.log(content)
		// Notification.requestPermission(function(permission){
		// 	var body = `Tienes una nueva notificación`
		//   var notification = new Notification("Astrum",{
		//     body: body,
		//     icon:'../../../images/logoAscent.png',
		//     dir:'auto'         
		//   });

		//   notification.onclick = function() {
		//     window.open("https://wos.astrumla.com/");
		//   };
		//   setTimeout(function(){
		//     notification.close();
		//   },4000);
		// })
	})

	socket.on('notis_counter', function(count) {
		console.log('Cantidad de Notificaciones')
		console.log(count)
		//$scope.count = count
		var count_Notificaiones = sessionStorage.getItem('count_Notificaiones')
		$('.CounterNotifications').html(count)
		count_Notificaiones++
		sessionStorage.setItem('count_Notificaiones', count_Notificaiones)
	})

	var id_user = userModel.getUserObject().user._id

	socket.on('connect', function() {
	  socket.emit('NotificationsRoom', id_user)
		console.log('Me conete con el servidor')
	})
}])