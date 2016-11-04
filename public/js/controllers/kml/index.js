myApp.controller('kmlController', ['$scope', '$http', 'multipartForm', 'Loader', 'url', function($scope, $http, multipartForm, Loader, url){

	var map 
	var markers = []
	$scope.kmls = []

	$scope.url = url


	// CARGA DE MARKER DE ORDENES DE TRABAJO
	function AddMarkers(){
		$http({
			method: 'POST',
			url: '/dashboard/ordenes_trabajo/dynamic-filter/true/all/all'
		}).then(function(res){
			console.log(res)
			if (res.data.work_orders) {
				for (var i = 0; i < res.data.work_orders.pendiente.length; i++) {
					var item = res.data.work_orders.pendiente[i]
					console.log(item.status)
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var color = '#099692'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else {
							image = $scope.url.marker_order_service_cliente_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}

					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
				for (var i = 0; i < res.data.work_orders.en_curso.length; i++) {
					var item = res.data.work_orders.en_curso[i]
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var colo = '#29abe2'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else {
							image = $scope.url.marker_order_service_cliente_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}

					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
				for (var i = 0; i < res.data.work_orders.resuelto.length; i++) {
					var item = res.data.work_orders.resuelto[i]
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var  color = '#455a64'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else {
							image = $scope.url.marker_order_service_cliente_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}

					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
				for (var i = 0; i < res.data.work_orders.no_resuelto.length; i++) {
					var item = res.data.work_orders.no_resuelto[i]
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var color  = '#cb2948'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else {
							image = $scope.url.marker_order_service_cliente_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}

					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
				for (var i = 0; i < res.data.work_orders.cancelado.length; i++) {
					var item = res.data.work_orders.cancelado[i]
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var color  = '#939393'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else {
							image = $scope.url.marker_order_service_cliente_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}

					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
				for (var i = 0; i < res.data.work_orders.reportado.length; i++) {
					var item = res.data.work_orders.reportado[i]
					var template_tarjeta = ''
					var title = ''
					var image = ''
					var color  = '#f15a24'

					if(item.detalle_servicio === 'detalle_servicio_A') {

						item.detalle_servicio = 'Zona sin Alumbrado Publico'

					} else if (item.detalle_servicio === 'detalle_servicio_CH') {

						item.detalle_servicio = 'Poste Chocado'

					} else if (item.detalle_servicio === 'detalle_servicio_CC') {

						item.detalle_servicio = 'Poste Caido por Corrosion'
						
					} else if (item.detalle_servicio === 'detalle_servicio_M') {

						item.detalle_servicio = 'Mantenimiento de Poste'
						
					} else if (item.detalle_servicio === 'detalle_servicio_I') {

						item.detalle_servicio = 'Instalacion de Poste'
						
					} else {

						item.detalle_servicio = 'Registro de Poste'
					
					}

					var status
					var urgency

					var status	
					if (item.estado === 'pendiente') {
						status = 'Pendiente'
					} else if (item.estado === 'resuelto') {
						status = 'Resueltas'
					} else if (item.estado === 'no_resuelto') {
						status = 'No resuelta'
					} else if (item.estado === 'reportado') {
						status = 'Reportada'
					} else if (item.estado === 'en_curso') {
						status = 'En curso'
					} else if (item.estado === 'cancelado') {
						status = 'Cancelada'
					} else {
						status = 'Reprogramada'
					}

					if (item.tipo_urgencia === 'tipo_urgencia_M') {
						urgency = 'Media'
					} else if (item.tipo_urgencia === 'tipo_urgencia_A') {
						urgency = 'Alta'
					} else {
						urgency = 'Baja'
					}

					if (item.tipo_servicio === 'tipo_servicio_P') {
						title = 'Poste'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_poste_pendiente
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_poste_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_poste_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_poste_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_poste_reprogramado
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_poste_cancelado
						} else {
							image = $scope.url.marker_order_service_poste_reportado
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					} else {
						title = 'Cliente'
						if (item.estado === $scope.url.pendiente) {
							image = $scope.url.marker_order_service_cliente_pendiente
						} else if(item.estado === $scope.url.cancelado){
							image = $scope.url.marker_order_service_cliente_cancelada
						} else if(item.estado === $scope.url.en_curso){
							image = $scope.url.marker_order_service_cliente_en_curso
						} else if (item.estado === $scope.url.resuelto) {
							image = $scope.url.marker_order_service_cliente_resuelto
						} else if (item.estado === $scope.url.no_resuelto) {
							image = $scope.url.marker_order_service_cliente_no_resuelto
						} else if(item.estado === $scope.url.reprogramado){
							image = $scope.url.marker_order_service_cliente_reprogramada
						} else {
							image = $scope.url.marker_order_service_cliente_reportada
						}
						template_tarjeta = `<div class="infoWindow" style="width:300px">
																	<div class="infoWindow__image" style="width:300px;height:200px">
																		<div class="infoWindow__image--photo" style="background-image:url(http://maps.googleapis.com/maps/api/streetview?size=300x240&location=${item.coordenada_X},${item.coordenada_Y}&pitch=-10);width:300px;height:200px;background-position:center;background-repeat:no-repeat;background-size:cover"></div>
																	</div>
																	<div class="infoWindow__content" style="padding:.5em 1em">
																		<div class="infoWindow__content--head" style="padding:.5em 0;width:100%;border-bottom:1px solid rgba(158,169, 175,1);position:relative">
																			<div class="title">
																				<p style="color:rgba(86,95,98,1);font-size:1.3em;font-family:'Avenir Bold';"><strong>${title}</strong></p>
																			</div>
																			<div class="data" style="display:flex;position:absolute;top:0;right:0">
																				<div class="data__priority" style="margin:0 .5em;padding:.2em 1.3em; border-radius:3px; color:rgba(158,169, 175,1);font-family:'Avenir Lighter';background-color:#e2e2e2">${urgency}</div>
																				<div style="margin:0 .5em;background-color: ${color};margin.5em;font-family:'Avenir Lighter';font-size:14px;padding:.2em 1.3em;border-radius:3px;color:white" class="data__status">${status}</div>
																			</div>
																			<div class="inforOrder">
																				<p style="color:rgba(86,95,98,1);font-family:'Avenir Bold';">${item.direccion}</p>
																				<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${item.detalle_servicio}</p>
																			</div>
																		</div>
																		<div class="infoWindow__content--userInfo">
																			<div class="info" style="padding:.5em">
																				<p class="info__title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">Orden de Trabajo</p>
																				<p class="info__text" style="color:rgba(158,169, 175,1);font-size:'Avenir Lighter'">${item.codigo_orden}</p>
																			</div>
																			<div class="card" style="margin: .5em 1em; border-radius:5px;box-shadow:1px 1px 1px rgba(97, 97, 97, 0.36)">
																				<div class="card__user" style="position:relative;padding:.5em .5em .5em 40px;background-color:#f5f5f5;border-radius:5px 5px 0 0">
																					<div class="card__user--avatar" style="border-radius:50%;background-position:center;background-size:cover;background-repeat:no-repeat;background-image:url(${item.user_card_data.user.photo.path})">
																					</div>
																					<p class="card__user--name" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'">${item.user_card_data.user.name}</p>
																				</div>
																				<div style="display:flex;justify-content:space-around;flex-wrap:wrap" class="card__other">
																					<div class="card__other--left" style="width:50%;padding:5px;box-sizing:border-box">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Contratista</strong></p>
																						<p class="text" style="color:rgba(158,169, 175,1);font-family:'Avenir Lighter'">${item.user_card_data.contratista.name}</p>
																					</div>
																					<div class="card__other--right" style="width:50%;padding:5px;box-sizing:border-box;">
																						<p class="title" style="color:rgba(86,95,98,1);font-family:'Avenir Bold'"><strong>Empresa</strong></p>
																						<p class="text" style="color:rgba(158,169,175,1);font-family:'Avenir Lighter'">${item.user_card_data.empresa.name}</p>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="enlaceOrden" style="display:flex;justify-content:flex-end;padding:.5em 0">
																			<a style="color:#0074bd;text-decoration:underline;font-family:'Avenir Bold'" href="#/dashboard/order/${item._id}">Ir a orden de trabajo</a>
																		</div>
																	</div>
																</div>`
					}
					var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

				    var marker = new google.maps.Marker({
				      position: myLatLng,
				      map: map,
				      title: title,
				      icon: image
				    })

					addInfoWindow(marker, template_tarjeta)

					marker.setMap(map)
					markers.push(marker)
				}
			}

			function addInfoWindow(marker1, message) {
			  var infoWindow = new google.maps.InfoWindow({
			    content: message
			  });

			  google.maps.event.addListener(marker1, 'click', function () {
			    // marker1.infowindow.close()
			    infoWindow.open(map, marker1)
			  })
			}
		}, function(err){
			console.log(err)
		})
	}
	AddMarkers()

	// // HABILITAR MARCADORES
	$('#viewMarker').on('change', function(){
		if (this.checked) {
      // do something if checked
	      showMarkers()
	      // console.log('1234567')
	    } else {
	      // do something else otherwise
	      clearMarkers()
	      // console.log('asdfghj')
	    }
	})

	// DRAG AND DROP
	$(function(){
		$('#Drag').on('dragover', function(e){
			e.stopPropagation()
			e.preventDefault()
			$(this).css('background-color', '#fff')
			$(this).css('border', '2px dashed rgba(158,169, 175,1)')
			$(this).find('p').css('color', 'rgba(158,169, 175,1)')
			$(this).find('.FormMsgFirst__label--image').css('background-image','url(../images/upload.svg)')
			$(this).find('.FormMsgFirst__label--btn').css('border', '1px solid rgba(158,169, 175,1)')
			$(this).css('border-radius', '5px')
		})
		
		$('#Drag').on('drop', function(e){
			e.stopPropagation()
			e.preventDefault()
			$(this).css('border', '2px dashed #009688')
			$(this).css('background-color', '#009688')
			$(this).find('p').css('color', '#fff')
			$(this).find('.FormMsgFirst__label--image').css('background-image','url(../images/upload_white.svg)')
			$(this).find('.FormMsgFirst__label--btn').css('border', '1px solid #fff')
			$(this).css('border-radius', '5px')
			$(this).find('#txt').html('Cargando archivo...')

			var files = e.originalEvent.dataTransfer.files
			var file = files[0]
			// console.log(file)

			var path = file
			// console.log(path)
			var fd = new FormData();
			fd.append('file_kml', path)	
			// Inicia el Loader
			console.log('Subiendo....')
			Loader.create('.FormMsgFirst__label--text', 'LoadItem')
			
			$.ajax({
			  url : '/dashboard/viewer-kml/new-file-kml',
			  type : 'POST',
			  data : fd,
			  // async: true,
			  cache: false,
			  contentType: false,
			  enctype: 'multipart/form-data',
			  processData: false,
			  success : function(data) {
			    // Archivo subido
			    if(data) {
			      console.log('Archivo subido')

			      console.log('Repsueas del sevdor')
			      console.log('Archivo Cargado')
			      console.log(data)

			      console.log('Cargando Lectura ...')
			      
			      setTimeout(function(){
							Loader.delete('.FormMsgFirst__label--text', 'LoadItem')
			        console.log('Recargando todo')
			        $('.ArticlesContainer').html('')
			        StartKmlDrive()
			      }, 5000)
			    }	           
			 	}
			})
		})
	})

	// $('#file').on('change', )
	function StartKmlDrive() {
		Loader.create('.Kml__right--map', 'ViewKmlMap')
	  // Obteniendo archivos KML subidos en google drive
	  $http({
	  	method: 'GET',
	  	url: '/dashboard/viewer-kml/list'
	  }).then(function(res){
	  	// console.log(res)
			Loader.delete('.Kml__right--map', 'ViewKmlMap')


	  	console.log('Lista de KML en google drive')
	  	// console.log(result.kml_files)
	  	
	  	var arr = res.data.kml_files
	  	
	  	console.log('ARREGLO KML DE DRIVE JOEEELLLLL')
	  	console.log(arr)

	  	for(var i = 0; i <= arr.length - 2; i++) {
	  	  var el = arr[i]

	  	  $scope.kmls.push(el)
	  	  // Insertando archivo kml en lista
	  	  var template_kml_file_item = `<div class="ItemKml" data-content="${el.id}">
  	                                    <div class="ItemKml__content">
  	                                      <div class="ItemKml__content--title">
  	                                        <a href="${el.path}">
  	                                         <strong><span class="icon-icon_chat_archivo"></span> ${el.name}</strong>
  	                                        </a>
  	                                      </div>
  	                                      <div class="ItemKml__content--checked">
  	                                       	<div data-orderKml="${i}" class="kmlView">
	  	                                       	<input id="${i}" type="checkbox" value="${el.id}" class="kmlView__check" data-id="${i}" checked>
	  	                                       	<label class="kmlView__label" for="${i}"></label>
  	                                       	</div>
  	                                      </div>
  	                                    </div>
  	                                    <div class="ItemKml__options">
  	                                    	<div class="ItemKml__options--icon"><span class="icon-icon_submenu"></span></div>
  	                                    	<div class="ItemKml__options--content">
  	                                    	  <div class="optionDelete">
  	                                    	  	<button class="kml_delete" data-order="${i}" data-id="${el.id}">Eliminar</button>
  	                                    	  </div>
  	                                    	  <div class="optionUpdate"> 
  	                                    	  	<input id="a${i}" type="file" data-order="${i}" data-up="${el.id}" class="file_up" name="file_kml_patch">
  	                                    	  	<label for="a${i}"><span>Actualizar Kml</span></label>
  	                                    	  </div>
  	                                    	</div>
  	                                    </div>
	  	                                </div>`

	  	  $('.ArticlesContainer').append(template_kml_file_item)

	  	  // LLAMADO A FUNCIONES AL TERMINAR EL FOR
	  	  if (i === arr.length-2){
	  	  	$('.ItemKml__options--icon').on('click', viewOptionItemKml)
	  	  	work()
	  	  }

	  	  // Insertando archivo kml el el mapa  
	  	  loadKmlLayer(arr[i].path, map)
	  	}

	  }, function(err){
	  	console.log(err)
	  })
	}

	function viewOptionItemKml(){
		console.log(this)
		var view = $(this).parent().find('.ItemKml__options--content')
		console.log($(this).parent())

		if (view.css('display') === 'none') {
			view.css('display', 'block')
		} else {
			view.css('display', 'none')
		}
	}

	function initMap() {
	  map = new google.maps.Map(document.getElementById('map'), {
	      center: new google.maps.LatLng(-19.257753, 146.823688),
	      zoom: 2
	  })

	  StartKmlDrive()
	}

	// Sets the map on all markers in the array.
	function setMapOnAll(map) {
	  for (var r = 0; r < markers.length; r++) {
	    markers[r].setMap(map)
	  }
	}

	// Removes the markers from the map, but keeps them in the array.
	function clearMarkers() {
	  
	  setMapOnAll(null)
	}

	// Shows any markers currently in the array.
	function showMarkers() {
	  setMapOnAll(map)
	}

	var KmlCappas = []

	// CARGA DE KMLS
	function loadKmlLayer(src, map) {
	  var kmlLayer = new google.maps.KmlLayer(src, {
	    suppressInfoWindows: true,
	    preserveViewport: false,
	    map: map
	  });

	  if (document.getElementById('coords') === null) {
	  	var testimonial = document.createElement('div')
	  	testimonial.setAttribute('id', 'coords')
	  	testimonial.setAttribute('class', 'coords')
	    var template_box = `<div class="coords__content"></div>`
	    testimonial.innerHTML = template_box
		  $('.Kml__right--map').append(testimonial)
	  }

	  google.maps.event.addListener(kmlLayer, 'click', function(event) {
	    var content = event.featureData.infoWindowHtml;
	    var content_box = document.createElement('div')
	    content_box.setAttribute('class', 'coords')
	    $('.coords__content').html(content)
	    var close = document.createElement('div')
	    close.setAttribute('id', 'CloseInfoKml')
	    close.setAttribute('class', 'CloseInfoKml')
	    var template = `<span class="icon-icon_close"></span>`
	    close.innerHTML = template
	    $('.coords__content').append(close)
	    console.log($('#CloseInfoKml'))

	    $('#CloseInfoKml').on('click', function(){
	    	console.log('close ofowindow')
	    	$('.coords__content').html('')
	    })
	  });

	   // Añadiendo arreglo
	  kmlLayer.setMap(map)
	  KmlCappas.push(kmlLayer)
	}

	function deleteInfoWindowKml(){

	}

	$scope.changeInput = function(element){
		console.log(element)
		var path = $(element)[0].files[0]
		// console.log(path)
		var fd = new FormData($(element)[0]);
		fd.append('file_kml', path)	
		// Inicia el Loader
		console.log('Subiendo....')
		Loader.create('.Kml__left--items', 'upladFileKml')		
		$.ajax({
		  url : '/dashboard/viewer-kml/new-file-kml',
		  type : 'POST',
		  data : fd,
		  // async: true,
		  cache: false,
		  contentType: false,
		  enctype: 'multipart/form-data',
		  processData: false,
		  success : function(data) {

		    // Archivo subido
		    if(data) {
		      console.log('Archivo subido')

		      console.log('Repsueas del sevdor')
		      console.log('Archivo Cargado')
		      console.log(data)

		      console.log('Cargando Lectura ...')
		      
		      setTimeout(function(){
			    	Loader.delete('.Kml__left--items', 'upladFileKml')
		        console.log('Recargando todo')
		        $('.ArticlesContainer').html('')
		        StartKmlDrive()
		      }, 5000)
		    }	           
		 	}
		})
	}

	function work(){

		// ACTUALIZACION DE KMLS
		$('.file_up').on('change', function(){
			Loader.create('.Kml__left--items', 'UpdateKml')
			var id = this.getAttribute('data-up')
			var order = this.getAttribute('data-order')
			console.log(order, KmlCappas[order].setMap())

			KmlCappas[order].setMap()
			console.log($(this)[0].files[0], id)

			var file = this
			var file_to_upload = $(this)[0].files[0]


			var fd = new FormData($(this)[0])
			fd.append('file2', file_to_upload)

			$.ajax({
				url: `/dashboard/viewer-kml/updated-file-kml/${id}?_method=put`,
				type: 'POST',
				data : fd,
				async: false,
				cache: false,
				contentType: false,
				enctype: 'multipart/form-data',
				processData: false,
				success: function(data) {
					// Archivo subido
					if(data) {
						console.log('Archivo subido aaaHHHHHHHH')
						console.log('Repsueas del servidor')
						console.log('Archivo Cargado')
						console.log(data)
						setTimeout(function(){
							Loader.delete('.Kml__left--items', 'UpdateKml')
							console.log('Recargando todo')
							location.reload()
							// $('.ArticlesContainer').html('')
							// StartKmlDrive()
						}, 5000)
					}
				}
			})
		})

		// ELIMINAR KMLS
		$('button.kml_delete').on('click', function(){
			var id = this.getAttribute('data-id')
			var order = this.getAttribute('data-order')
			$('[data-content="'+id+'"]').css('display', 'none')
		  	console.log('Eliminando...')
		  	Loader.create('.Kml__left--items', 'DeleteKml')

			$.ajax({
				url : `/dashboard/viewer-kml/remove-file-kml/${id}?_method=delete`,
				type : 'POST',
				async: false,
				cache: false,
				contentType: false,
				enctype: 'multipart/form-data',
				processData: false,
				success : function(data) {
					// Archivo subido
					if(data) {
						console.log('Archivo Eliminado')
						Loader.delete('.Kml__left--items', 'DeleteKml')
						console.log('Repsueas del sevdor')
						console.log(data); 
						KmlCappas[order].setMap(null)
					}
				}
			})
		})

		// VISTA DE KMLS (SHOW/HIDE)
		$('input.kmlView__check').on('click', function(){
			var id = this.getAttribute('data-id')
			console.log('[data-order="'+id+'"] .kmlView')
			console.log(id)
			if (this.checked === true) {
					$('[data-orderKml="'+id+'"]').css('background-color', '#009688')
		      // do something if checked
		      // Buscando la capa 
		      KmlCappas[id].setMap(map)
		      // showMarkers()
		      console.log('CHECK')

			  } else {
			  		$('[data-orderKml="'+id+'"]').css('background-color', '#7d7d7d')
		      // do something else otherwise
		      //clearMarkers()
		      console.log('noo CHECK') 
		      KmlCappas[Number(id)].setMap(null)
			}
		})
	
	}

	var path = []
	var markers2 = []

	var socket = io('/tracking-io')

	socket.on('Track_users', function (content) {
  	console.log('Posicion de usuarios')
  	console.log(content)

  	// marker2.remove()


    title= content.user.full_name
    image = '../../../../images/tracking/icon_user2x.png';
    template_tarjeta = `<div style="width:350px">
													<div style="width:100%;padding:.5em .5em .5em 50px;position:relative;display:flex;justify-content:center;align-items:center;box-sizing:border-box;height:50px;background-color:#f5f5f5">
														<div style="background-image:url(${content.user.photo.path});background-position:center;background-repeat:no-repeat;background-size:cover;width: 40px;height:40px;position:absolute;border-radius:50%;top: 5px;left:5px"></div>
														<p style="font-family:'Avenir Bold';color:#555e61">${content.user.full_name}</p>
													</div>
													<div style="padding:5px;display:flex;justify-content:space-between">
														<div style="width:50%">
															<p style="color: #555e61;font-family:'Avenir Bold'">Contratista</p>
															<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${content.user.contratista}</p>
														</div>
														<div style="width:50%">
															<p style="color: #555e61;font-family:'Avenir Bold'">Empresa</p>
															<p style="font-family: 'Avenir Lighter';color:rgba(158,169, 175,1)">${content.user.empresa_admin}</p>
														</div>
													</div>
												</div>`

  	var myLatLng = {lat:  content.coordX, lng:  content.coordY};

  	var marker2 = new google.maps.Marker({
	    position: myLatLng,
	    map: map,
	    title: content.user_id,
	    icon: image,
	    identificador: content.user_id
		})

	  // marker.addListener('click', function() {
   //    infowindow.open(map, marker);
   //  });

	  marker2.setMap(map)      
	  markers2.push(marker2)
	})

	initMap()
}])