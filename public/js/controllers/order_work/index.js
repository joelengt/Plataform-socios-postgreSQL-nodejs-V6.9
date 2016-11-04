myApp.controller('orderWorkController', ['$scope', '$http', '$routeParams', '$location', 'url', 'Loader', function($scope, $http, $routeParams, $location, url, Loader){
	Loader.create('.OrderWork__left', 'listItemsDash')
	Loader.create('.OrderWork__right--mapCanvas', 'firstMarkerMap')
	$http({
		method: 'GET',
		url:'/dashboard/ordenes_trabajo/'+$routeParams.id
	}).then(function(res){
		Loader.delete('.OrderWork__left', 'listItemsDash')
		Loader.delete('.OrderWork__right--mapCanvas', 'firstMarkerMap')
		console.log(res)
		$scope.url = url
		// $scope.workOrder = res.data.work_order
		// $scope.service = res.data.type_service_name
		// $scope.elements = $scope.workOrder.elementos
		// $scope.elementsInitial = []
		function init(){
			var item = res.data.work_order
			console.log(item)
			var map
			map = new GMaps({
				div: '#map',
				zoom: 14,
				lat: item.coordenada_X,
				lng: item.coordenada_Y,
			})

			// var order = $route
			console.log('XD')
			$('.OrderWork__left').css('overflow', 'hidden')
			// map.removeMarkers()
			// console.log(order)

			var contentWindow = $('.OrderWork__left')
			var DetailContent = document.createElement('div')
			DetailContent.setAttribute('class','InfoContainner')
			contentWindow.append(DetailContent)

			var type_service = res.data.type_service_name
			var item = res.data.work_order

			if (type_service === 'postes') {
				infoPoste(item, type_service)
			} else {
				infoCliente(item, type_service)
			}

			// INFORMACION DE ORDEN DE TRABAJO DE TIPO POSTE
			function infoPoste(item, type_service){
				map.zoomIn(4)
				map.setCenter(item.coordenada_X,item.coordenada_Y)

				var marker_order_poste
				if (item.estado === $scope.url.pendiente) {
					marker_order_poste = $scope.url.markers_focus_poste_pendiente_short
				} else if(item.estado === $scope.url.en_curso){
					marker_order_poste = $scope.url.markers_focus_poste_en_curso_short
				} else if (item.estado === $scope.url.resuelto) {
					marker_order_poste = $scope.url.markers_focus_poste_resuelto_short
				} else if (item.estado === $scope.url.no_resuelto) {
					marker_order_poste = $scope.url.markers_focus_poste_no_resuelto_short
				} else if(item.estado === $scope.url.reprogramado){
					marker_order_poste = $scope.url.markers_focus_poste_reprogramado_short
				} else if(item.estado === $scope.url.cancelado){
					marker_order_poste = $scope.url.markers_focus_poste_cancelado_short
				} else {
					marker_order_poste = $scope.url.markers_focus_poste_reportado_short
				}

				console.log(marker_order_poste)

				map.addMarker({
				  lat: item.coordenada_X,
				  lng: item.coordenada_Y,
				  icon: marker_order_poste
				});

				// Validando Datos de la orden de trabajo

				// Destalles de Servicio: POSTE
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

				// var contentWindow = $('.OrderWork__left')
				// var DetailContent = document.createElement('div')
				// DetailContent.setAttribute('class','InfoContainner')
				template = `<div class="InfoOrder">
											<div class="InfoOrder__imagePortrate">
												<div id="streetViewPoste" style="width:100%;height:300px"></div>
											</div>
											<div class="InfoOrder__status">
												<p><span id="urgency"></span> <span id="status"></span></p>
												<div class="InfoOrder__desplegable" id="option_desplegable">
													<span class="icon-icon_submenu"></span>
													<div class="InfoOrder__desplegable--container">
														<div class="Items" id="optionOrders"></div>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Poste</strong></p>
														<p class="content">${item.direccion}</p>
													</div>
													<div class="InfoOrder__data--privacity">
														<span id="privacity"></span>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Código de la Orden de trabajo</strong></p>
														<p class="content">${item.codigo_orden}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Detalle del Servicio</strong></p>
														<p class="content">${item.detalle_servicio}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<div class="userInfo__title">
															<h3>A cargo de</h3>
														</div>
														<div class="userInfo__data">
															<div class="userInfo__data--title">
																<h3>${item.user_card_data.user.name}</h3>	
															</div>
															<div class="userInfo__data--content">
																<div class="left">
																	<h4>Contratista</h4>
																	<p>${item.user_card_data.contratista.name}</p>
																</div>
																<div class="right">
																	<h4>Supervisor</h4>
																	<p>${item.user_card_data.supervisor.name}</p>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data mapastatic">
												<div id="mapStatic" class="InfoOrder__data--map">
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Descripción</strong></p>
														<p class="content">${item.descripcion}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Observaciones</strong></p>
														<p class="content">${item.conclusiones}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Fecha de Publicado</strong></p>
														<p class="content">${item.fecha_publicado}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Fecha de Visita esperada</strong></p>
														<p class="content">${item.fecha_visita_esperada}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Fecha de Trabajo realizado</strong></p>
														<p class="content">${item.fecha_trabajo_realizado}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Reprogramado de</strong></p>
														<p class="content">${item.reprogramado_de}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data--slider">
												<div class="Slider">
													<div class="Slider__items" id="slides">
													</div>
													<div class="Slider__btnPrev"><span id="btnPrev" class="icon-icon_prev"></span></div>
													<div class="Slider__btnNext"><span class="icon-icon_next" id="btnNext"></span></div>
												</div>
											</div>
										</div>
										<div class="back">
											<span id="back" class="icon-icon_cerrar"></span>
										</div>`



				$('.InfoContainner').html(template)
				// contentWindow.append(DetailContent)
				console.log($('.InfoContainner'))

				Loader.create('.Slider__items', 'slideItemsOrder')

				// EFECTO HOVER SOBRE ICONO PARA VER OPCIONES OCULTAS DE ORDER
				$('#option_desplegable').on('mouseover', function(){
					console.log(this)
					$(this).find('.InfoOrder__desplegable--container').css('display', 'block')
				})

				$('#option_desplegable').on('mouseleave', function(){
					console.log(this)
					$(this).find('.InfoOrder__desplegable--container').css('display', 'none')
				})

				// VALIDACION DE COLORES POR ESTADO
				if (item.estado === 'pendiente') {
					console.log('XD')
					$('#status').html('Pendiente')
					$('#status').css('background-color', '#099692')
					$('.InfoOrder__imagePortrate').css('border-bottom', '5px solid #099692')
				} else if (item.estado === 'resuelto') {
					console.log('XD')
					$('#status').html('Resueltas')
					$('#status').css('background-color', '#455a64')
					$('.InfoOrder__status').css('border-top', '5px solid #455a64')
				} else if (item.estado === 'no_resuelto') {
					console.log('XD')
					$('#status').html('No resuelta')
					$('#status').css('background-color', '#cb2948')
					$('.InfoOrder__status').css('border-top', '5px solid #cb2948')
				} else if (item.estado === 'reportado') {
					console.log('XD')
					$('#status').html('Reportada')
					$('#status').css('background-color', '#f15a24')
					$('.InfoOrder__status').css('border-top', '5px solid #f15a24')
				} else if (item.estado === 'en_curso') {
					console.log('XD')
					$('#status').html('En curso')
					$('#status').css('background-color', '#29abe2')
					$('.InfoOrder__status').css('border-top', '5px solid #29abe2')
				} else if (item.estado === 'cancelado') {
					console.log('XD')
					$('#status').html('Cancelada')
					$('#status').css('background-color', '#939393')
					$('.InfoOrder__status').css('border-top', '5px solid #939393')
				} else {
					console.log('XD')
					$('#status').html('Reprogramada')
					$('#status').css('background-color', '#e3d534')
					$('.InfoOrder__status').css('border-top', '5px solid #e3d534')
				}

				var contentSlides = $('#slides')
				var dataPoste

				var panorama = GMaps.createPanorama({
				  el: '#streetViewPoste',
				  lat : item.coordenada_X,
				  lng : item.coordenada_Y
				})
				// var EditOrder = $('#btnEditOrderPoste')
				// EditOrder.on('click', editOrder)

				var contentOptionOrder = $('#optionOrders')

				if (item.estado === 'pendiente' && item.public === true) {
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					contentOptionOrder.html(txt)
					var CancelOrder = $('#btnCancelOrderPoste')
					CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'pendiente' && item.public === false){
					var txt = `<div id="btnEditOrderPoste" data-element="${item._id}"><span>Editar</span></div>
										<div id="deleteOrder"><span>Eliminar</span></div>`
					contentOptionOrder.html(txt)
					var EditOrder = $('#btnEditOrderPoste')
					EditOrder.on('click', editOrder)
				} else if(item.estado === 'resuelto' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Exportar</span></div>`
					$('#option_desplegable').remove()
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'no_resuelto' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Exportar</span></div>`
					$('#option_desplegable').remove()
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'reportado' && item.public === true){
					var txt = `<div data-reported="${item._id}" id="btnReporteOrderPoste"><span>Ver Reporte</span></div>`
					contentOptionOrder.html(txt)
					var viewReporte = $('#btnReporteOrderPoste')
					viewReporte.on('click', actionOrder)
				} else if(item.estado === 'en_curso' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					contentOptionOrder.html(txt)
					var CancelOrder = $('#btnCancelOrderPoste')
					CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'cancelado' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'reprogramado' && item.public === false) {
					var txt = `<div id="btnEditOrderPoste"  data-element="${item._id}"><span>Editar</span></div>
										<div id="deleteOrder"><span>Eliminar</span></div>`
					contentOptionOrder.html(txt)
					var EditOrder = $('#btnEditOrderPoste')
					EditOrder.on('click', editOrder)
				} else {
					console.log('XD')
				}

				function cancelOrder(){
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/change-status/cancelado'
					}).then(function(res){
						console.log(res)
						location.reload()
					}, function(err){
						console.log(err)
					})
				}

				panorama.setOptions({disableDefaultUI: true, clickToGo:false, zoomControl:false, scrollwheel:false, streetViewControl:false})

				// ELIMINAR ORDEN
				$('#deleteOrder').on('click', function(){
					console.log('XD')
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/delete/'+item._id+'?_method=delete'
					}).then(function(res){
						console.log(res)
						location.reload()
					}, function(err){
						console.log(err)
					})
				})

				// INFO NECESARIA PARA CREAR MARKERS Y SLIDES DE CADA ELEMENTO DE CADA USUARIO
				for (var i = 0; i < item.elementos.length; i++) {
					var element = item.elementos[i]
					$http({
						method:'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/read/'+element.type+'/'+element._id
					}).then(function(res){
						console.log(res)
						console.log(item.estado)
						if ($('.Slider__items--item').length < 1) {
							Loader.delete('.Slider__items', 'slideItemsOrder')
						}

						var marker_poste

						if (item.estado === $scope.url.pendiente) {
							marker_poste = $scope.url.marker_poste_pendiente_short
						} else if(item.estado === $scope.url.en_curso){
							marker_poste = $scope.url.marker_poste_en_curso_short
						} else if(item.estado === $scope.url.cancelado){
							marker_poste = $scope.url.marker_poste_cancelada_short
						} else if(item.estado === $scope.url.resuelto){
							marker_poste = $scope.url.marker_poste_resuelta_short
						} else if(item.estado === $scope.url.no_resuelto){
							marker_poste = $scope.url.marker_poste_no_resuelta_short
						} else if(item.estado === $scope.url.reprogramado){
							marker_poste = $scope.url.marker_poste_reprogramada_short
						} else if(item.estado === $scope.url.reportado){
							marker_poste = $scope.url.marker_poste_reportada_short
						} else if(item.estado === $scope.url.progreso){
							marker_poste = $scope.url.marker_poste_progreso_short
						} else {
							marker_poste = $scope.url.marker_poste_no_asignada_short
						}

						console.log(item.estado, marker_poste)

						map.addMarker({
							lat: Number(res.data.service.coordenada_X),
							lng: Number(res.data.service.coordenada_Y),
							click: function(e){
								console.log(e)
							},
							icon: marker_poste
						})

						var contentElement = document.createElement('div')
						contentElement.setAttribute('class', 'Slider__items--item')
						contentElement.setAttribute('data-id', res.data.service._id)
						// console.log(contentElement)
						var template = `<div class="ItemContainner">
															<div class="ItemContainner__box">
																<div class="ItemContainner__box--image">
																	<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_poste[0].path})"></div>
																	<div class="titleHead">
																		<p>${res.data.service.codigo_poste}</p>
																	</div>
																</div>
																<div class="ItemContainner__box--text">
																	<p class="titleContent"><strong>${res.data.service.type_poste}</strong></p>
																	<p class="typeResidencial">${res.data.service.type_material}</p>
																</div>
															</div>
														</div>`

						contentElement.innerHTML = template
						contentSlides.append(contentElement)

						// console.log($('.Slider__items--item'))
						if (i === $('.Slider__items--item').length) {
							initSlides()
							// datePoste()
							$('.Slider__items--item').on('click', datePoste)
						}

					}, function(err){
						console.log(err)
					})
					// console.log(item.elementos.length-1)
				}

				var estadoPoste = item.estado

				// VISTA DE ELEMENTOS POR INDIVIDUAL
				function datePoste(){
					map.removeMarkers()
					var idElement = this.getAttribute('data-id')
					console.log(idElement)
					var containner = $('.OrderWork__left')
					var content = document.createElement('div')
					content.setAttribute('class', 'DateInfoElement')
					containner.append(content)
					Loader.create('.DateInfoElement','ItemOrderTrabajo')
					Loader.create('.OrderWork__right--mapCanvas','ItemOrderTrabajoMap')
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/read/poste/'+idElement
					}).then(function(res){
						console.log(res)
						Loader.delete('.DateInfoElement','ItenOrderTrabajo')
						Loader.delete('.OrderWork__right--mapCanvas','ItemOrderTrabajoMap')
						var item = res.data.service
						// var containner = $('.OrderWork__left')
						// var content = document.createElement('div')
						// content.setAttribute('class', 'DateInfoElement')
						var templateElement = `<div class="DateInfoElement__containner">
																		<div class="DateInfoElement__containner--slider">
																			<div class="ContentSliderItem" id="ContentSliderItem"></div>
																			<div class="ContentSliderPrev" id="btnPrevB"><span class="icon-icon_prev"></span></div>
																			<div class="ContentSliderNext" id="btnNextB"><span class="icon-icon_next"></span></div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Código Poste</strong></p>
																					<p class="content">${item.codigo_poste}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Código de Orden de Trabajo</strong></p>
																					<p class="content">${item.codigo_orden_trabajo}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Tipo de Poste</strong></p>
																					<p class="content">${item.type_poste}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Altura de Poste</strong></p>
																					<p class="content">${item.altura_poste}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Tipo de Material</strong></p>
																					<p class="content">${item.type_material}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Tipo de Pastoral</strong></p>
																					<p class="content">${item.type_pastoral}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Tipo de  Luminaria</strong></p>
																					<p class="content">${item.type_luminaria}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Tipo de Lámpara</strong></p>
																					<p class="content">${item.type_lampara}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data mapastatic">
																			<div id="mapaElement" class="mapaElement"></div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Coordenada X</strong></p>
																					<p class="content">${item.coordenada_X}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Coordenada Y</strong></p>
																					<p class="content">${item.coordenada_Y}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Estado de Poste</strong></p>
																					<p class="content">${item.estado_poste}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Estado de Pastoral</strong></p>
																					<p class="content">${item.estado_pastoral}</p>
																				</div>
																			</div>
																		</div>
																		<div class="DateInfoElement__containner--data">
																			<div class="DateItem">
																				<div class="DateLeft">
																					<p class="title"><strong>Estado de Luminaria</strong></p>
																					<p class="content">${item.estado_luminaria}</p>
																				</div>
																				<div class="DateRight">
																					<p class="title"><strong>Estado de Lámpara</strong></p>
																					<p class="content">${item.estado_lampara}</p>
																				</div>
																			</div>
																		</div>
																	</div>
																	<div class="DateInfoElement__back">
																		<span id="backItemOrder" class="icon-icon_close"></span>
																	</div>`

						$('.DateInfoElement').html(templateElement)
						// containner.append(content)
						// console.log(content)

						Loader.create('.ContentSliderItem', 'SliderItemsOrder')

						var items = item.imagen_poste

						$('#ContentSliderItem').css('width', items.length*100+'px')
						for (var o = 0; o < items.length; o++) {
							if ($('.sliderItem__containner').length < 1) {
								Loader.delete('.ContentSliderItem', 'SliderItemsOrder')
							}
							var sliderItem = document.createElement('div')
							sliderItem.setAttribute('class', 'sliderItem')

							var template
							console.log(items[o])

							if (items[o].extension === 'jpeg' || items[o].extension==='png' || items[o].extension==='gif' || items[o].extension==='jpg') {
								if (items[o].extension === 'jpg' && items[o].size > 3000000) {
									console.log(items[o])
									template = `<div class="sliderItem__containner">
																<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																	<div class="BoxIcon" data-size="${items[o].size}" data-extension="${items[o].extension}" data-path="${items[o].path}">
																		<span class="panoramaView icon-icon_360"></span>
																	</div>
																</div>
															</div>`

									sliderItem.innerHTML = template

									$('#ContentSliderItem').append(sliderItem)
								} else {
									console.log('es imagen 360° XD')
									console.log(items[o])
									template = `<div class="sliderItem__containner">
																<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																	<div class="BoxIcon" data-size="${items[o].size}" data-extension="${items[o].extension}" data-path="${items[o].path}">
																		<span class="icon-icon_imagen"></span>
																	</div>
																</div>
															</div>`

									sliderItem.innerHTML = template

									$('#ContentSliderItem').append(sliderItem)											
								}
							} else if(items[o].extension === 'mp4') {
								console.log(items[o])
								// if (items[o].path === 'http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4'){
								// 	items[o].path = 'https://1fhjlow.oloadcdn.net/dl/l/xm11v2PR7QNTX2nR/wGFgoVy7ur0/rezerooo-24.mp4?mime=true'
								// }
								console.log('este es un video')
								template = `<div class="sliderItem__containner">
															<div class="sliderItem__containner--video">
																<div class="BoxIcon" data-extension="${items[o].extension}" data-path="${items[o].path}">
																	<span class="icon-icon_video"></span>
																</div>
																<video class="videoPlayer" data-extension="${items[o].extension}" data-path="${items[o].path}" src="${items[o].path}"></video>
															</div>
														</div>`

								sliderItem.innerHTML = template

								$('#ContentSliderItem').append(sliderItem)
								// $('.videoPlayer').on('click', videoPlayer)
							} else if(items[o].mimetype === 'default'){
								console.log('es imagen XD')
								console.log(items[o])
								template = `<div class="sliderItem__containner">
															<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																<div class="BoxIcon" data-extension="${items[o].extension}" data-path="${items[o].path}">
																	<!--<span class="icon-icon_imagen"></span>-->
																</div>
															</div>
														</div>`

								sliderItem.innerHTML = template

								$('#ContentSliderItem').append(sliderItem)
							} else {
								console.log('ninguna no coincide')
							}

							// console.log(o, $('.sliderItem').length-1, items.length)

							if (o === items.length-1) {
								initSlidesImages()
								console.log('XD')
							} else {
								console.log('XDFG')
							}									
						}

						$('.BoxIcon').on('click', modalLighBox)
						$('.videoPlayer').on('click', modalLighBox)

						function modalLighBox(){
							var path = this.getAttribute('data-path')
							console.log(path)
							var  LightBox = document.createElement('div')
							LightBox.setAttribute('class', 'LightBox')
							var extension = this.getAttribute('data-extension')
							var size = this.getAttribute('data-size')

							var  template = ''

							if (extension !== 'mp4') {
								if (extension === 'jpg' && size > 3000000) {
									template = `<div class="LightBox__containner">
																<div class="Panorama" id="PanoramaPhoto"></div>
																<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
															</div>`
								} else {
									template = `<div class="LightBox__containner">
																<figure class="LightBox__containner--photo">
																	<img src="${path}"/>
																</figure>
																<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
															</div>`
								}
							} else {
								template = `<div class="LightBox__containner">
															<div class="LightBox__containner--video">
																<video src="${path}" controls="true" autoplay></video>
															</div>
															<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
														</div>`
							}

							LightBox.innerHTML = template
							$('.container').append(LightBox)
							if (document.getElementById('PanoramaPhoto') !== null) {
								pannellum.viewer('PanoramaPhoto', {
									"type": "equirectangular",
									"panorama": path,
									// "preview": "./361.jpg",
									"autoLoad": true,
									// "compass": true,
								})
							}
							$('#closeLighBox').on('click', function(){
								console.log('XD')
								$('.LightBox').remove()
							})
						}

						$('#backItemOrder').on('click', function(){
							$('.DateInfoElement').remove()
						})

						// MAPA STATIC
						var url = GMaps.staticMapURL({
						  size: [800, 400],
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y,
						  markers: [
						    {lat: item.coordenada_X, lng: item.coordenada_Y}
						  ]
						});

						$('#mapaElement').css('background-image', 'url('+url+')')

						console.log(estadoPoste)

						map.setCenter(item.coordenada_X,item.coordenada_Y)

						var marker_info_poste
						if (estadoPoste === $scope.url.pendiente) {
							marker_info_poste = $scope.url.marker_poste_pendiente_short
						} else if(estadoPoste === $scope.url.en_curso){
							marker_info_poste = $scope.url.marker_poste_en_curso_short
						} else if (estadoPoste === $scope.url.resuelto) {
							marker_info_poste = $scope.url.marker_poste_resuelta_short
						} else if (estadoPoste === $scope.url.no_resuelto) {
							marker_info_poste = $scope.url.marker_poste_no_resuelta_short
						} else if(estadoPoste === $scope.url.reprogramado){
							marker_info_poste = $scope.url.marker_poste_reprogramada_short
						} else if(estadoPoste === $scope.url.cancelado){
							marker_info_poste = $scope.url.marker_poste_cancelada_short
						} else {
							marker_info_poste = $scope.url.marker_poste_reportada_short
						}

						// // mapEdit.markers
						map.addMarker({
							lat: Number(item.coordenada_X),
							lng: Number(item.coordenada_Y),
							click: function(e){
								console.log(e)
							},
							icon: marker_info_poste
						})

						// INICIO DE SLIDES de imagenes y videos
						function initSlidesImages(){

							// $('#ContentSliderItem').css('width', (items.length*width)+'px')
							$('#ContentSliderItem').css('width', (items.length)*450+'px')

							var btnNext = $('#btnNextB')
							var btnPrev = $('#btnPrevB')

							btnNext.on('click', nextSlideB)
							btnPrev.on('click', prevSlideB)
						}

						// NEXT SLIDES
						function nextSlideB(){
							console.log('XD')
							var margin = $('#ContentSliderItem').css('margin-left')
							var px = 'px'
							if (margin.indexOf(px) != -1) {
								margin = margin.replace('px','')
								margin = parseInt(margin)
							}

							var maxMargin = ($('.sliderItem').length-1)*-450
							console.log(margin,maxMargin)

							if (margin > maxMargin) {
								// console.log(margin)
								var newMargin = margin - 450
								$('#ContentSliderItem').animate({
									marginLeft: newMargin+'px'
								}, 80)
							}
						}

						// PREV SLIDES
						function prevSlideB(){
							var margin = $('#ContentSliderItem').css('margin-left')
							var px = 'px'
							if (margin.indexOf(px) != -1) {
								margin = margin.replace('px','')
								margin = parseInt(margin)
							}
							if (margin < 0) {
								var minMargin = margin + 450
								console.log(margin, minMargin)
								$('#ContentSliderItem').animate({
									marginLeft: minMargin
								}, 80)
							}
						}

					}, function(err){
						console.log(err)
						Loader.create('.DateInfoElement','ItenOrderTrabajo')
					})
				}

				var itVid = 0
				function videoPlayer(){
					// console.log(this)
					if (itVid === 0) {
						this.play()
						itVid = 1								
					} else {
						this.pause()
						itVid = 0
					}
				}

				// EDICION DE ORDENES
				// var EditOrder = $('#btnEditOrderPoste')
				// EditOrder.on('click', editOrder)
				function editOrder(){
					console.log('Este es un gran elemento', this.getAttribute('data-element'))
					var order = this.getAttribute('data-element')
					var templateEditPoste = document.createElement('div')
					templateEditPoste.setAttribute('class', 'EditPoste')
					contentTemplateEdit = $('.OrderWork')
					contentTemplateEdit.append(templateEditPoste)
					Loader.create('.EditPoste', 'LoadInfoOrder')
					$http({
						method: 'GET',
						url: '/dashboard/ordenes_trabajo/'+order
					}).then(function(res){
						Loader.delete('.EditPoste', 'LoadInfoOrder')
						var item = res.data.work_order
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
						console.log(res)

						var template = `<form action="" class="EditPoste__containner">
															<div class="EditPoste__containner--head">
																<h3>EDITAR ORDEN DE TRABAJO</h3>
															</div>
															<div class="EditPoste__containner--body">
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Tipo de Servicio</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select name="type_service" id="type_service" class="selectBox__select" disabled>
																				<option value="tipo_servicio_P" selected>Poste</option>
																				<option value="tipo_servicio_C">Cliente</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Detalle del Servicio</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" name="detail_service" id="detail_service" disabled>
																				<option value="detalle_servicio_A">Zona sin Alumbrado Público</option>
																				<option value="detalle_servicio_CH">Poste Chocado</option>
																				<option value="detalle_servicio_CC">Poste Caido por Corrosión</option>
																				<option value="detalle_servicio_M">Mantenimiento de Poste</option>
																				<option value="detalle_servicio_I">Instalacion de Poste</option>
																				<option value="detalle_servicio_R">Registro de Poste</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Usuario</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" required name="" id="codigo_contratista"></select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Supervisor</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" required name="" id="codigo_supervisor"></select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Prioridad</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" name="priority" id="priority">
																				<option>Seleccione</option>
																				<option value="tipo_urgencia_A">Alta</option>
																				<option value="tipo_urgencia_M">Media</option>
																				<option value="tipo_urgencia_B">Baja</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Dirección</strong></p>
																	</div>
																	<div class="Data__right">
																		<input id="direccion" type="text"  class="inputs-label" value="${item.direccion}"/>
																	</div>
																</div>
																<div class="Data">
																	<div id="mapEdit" style="width:100%;height:200px"></div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Coordenada X</strong></p>
																	</div>
																	<div class="Data__right">
																		<input id="coordenada_X"  class="inputs-label" type="text" disabled value="${item.coordenada_X}"/>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Coordenada Y</strong></p>
																	</div>
																	<div class="Data__right">
																		<input id="coordenada_Y" type="text" disabled  class="inputs-label" value="${item.coordenada_Y}"/>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left labelTextarea">
																		<p><strong>Descripción</strong></p>
																	</div>
																	<div class="Data__right">
																		<textarea class="inputs-label" name="" id="descripcion" cols="30" rows="5">${item.descripcion}</textarea>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Fecha de Visita Esperada</strong></p>
																	</div>
																	<div class="Data__right">
																		<input class="inputs-label" id="date" type="date" />
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Público</strong></p>
																	</div>
																	<div class="Data__right inputStatus">
																		<div class="Data__right--true">
																			<input name="public" id="true" value="true" type="radio" />
																			<label for="true">Si</label>
																		</div>
																		<div class="Data__right--false">
																			<input name="public" id="false" value="false" type="radio" />
																			<label for="false">No</label>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left countPoste">
																		<p><strong>Cantidad de Postes</strong></p>
																	</div>
																	<div class="Data__right" id="postesContainner">	
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__btns">
																		<div class="Data__btns--cancel">
																			<button id="closeEditOrder">CANCELAR</button>
																		</div>
																		<div class="Data__btns--send">
																			<button type="submit">GUARDAR</button>
																		</div>
																	</div>
																</div>
															</div>
														</form>`

						$('.EditPoste').html(template)

						console.log(item.coordenada_Y, item.coordenada_X)
						console.log(item.fecha_visita_esperada)

            			// Validando reemplazo del inicio del path uploads
						var OldDate = item.fecha_visita_esperada
						OldDate = OldDate.split('/')
						console.log(OldDate)
						var day = OldDate[0]
						var mounth = OldDate[1]
						var year = OldDate[2]

						if (parseInt(mounth) <  10) {
							mounth = '0'+mounth
						}
						if (parseInt(day) <  10) {
							day = '0'+day
						}

						var fechaDate = year+'-'+mounth+'-'+day
						console.log(typeof fechaDate, fechaDate)
						$('#date').val(fechaDate)

					  // LISTA DE USUARIOS CONTRATISTAS
						$http({
							method: 'GET',
							url:'/dashboard/usuarios/list/users-campo'
						}).then(function(res){
							console.log('XD123456')
							console.log(res)
							var usersListContratista = res.data.usuarios
							for (var i = 0; i < usersListContratista.length; i++) {
								var content = $('#codigo_contratista')
								var user = document.createElement('option')
								user.setAttribute('value', usersListContratista[i]._id)
								user.innerHTML = usersListContratista[i].full_name
								content.append(user)
							}

							// SELECCION AUTOMATICA CON VALORES YA EXISTENTES DE DATA usuario
							for (var i = 0; i < $('#codigo_contratista option').length; i++) {
								var option = $('#codigo_contratista option')[i]
								if ($(option)[0].value === item.codigo_contratista) {
									option.setAttribute('selected', 'selected')
								}
							}
						}, function(err){
							console.log(err)
						})

						// LISTA DE USUARIOS SUPERVISORES
						$http({
							method: 'GET',
							url: '/dashboard/usuarios/list/officers'
						}).then(function(res){
							var usersListSupervisor = res.data.usuarios
							for (var i = 0; i < usersListSupervisor.length; i++) {
								console.log('XD')
								var content = $('#codigo_supervisor')
								var user = document.createElement('option')
								user.setAttribute('value', usersListSupervisor[i]._id)
								user.innerHTML = usersListSupervisor[i].full_name
								content.append(user)
							}

							for (var i = 0; i < $('#codigo_supervisor option').length; i++) {
								var option = $('#codigo_supervisor option')[i]
								if ($(option)[0].value === item.codigo_supervisor) {
									option.setAttribute('selected', 'selected')
								}
							}
						}, function(err){
							console.log(err)
						})

						// contentPostesContainner.on('click', postesItem)
						var mapEdit = new GMaps({
						  div: '#mapEdit',
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y
						})

						// mapEdit.markers
						mapEdit.addMarker({
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y,
						});

						var contentBoxItem = $('#postesContainner')

						console.log(contentBoxItem)
						if (item.detalle_servicio === 'detalle_servicio_R' || item.detalle_servicio === 'Registro de Poste') {
							var templatebox = `<div class="itemContainner" id="itemContainner">
																<div  id="contentItems" >
																</div>
																<div class="BtnNewElement">
																	<div class="BtnNewElement__containner">
																		<p id="addNewElement"><span class="icon-icon_agregar_poste"></span></p>
																	</div>
																</div>
															</div>`
							contentBoxItem.html(templatebox)
							$('#addNewElement').on('click', addElementOrder)
						} else {
							var templatebox = `<div class="searchItem">
																	<div class="searchItem__btnSearch">
																		<div class="searchItem__btnSearch--input">
																			<input class="inputs-label" id="codigoPoste" type="text" />
																		</div>
																		<div class="searchItem__btnSearch--btn">
																			<p id="AddOrderCodigo"><span>+</span> Agregar Poste</p>
																		</div>
																	</div>
																	<div id="contentItems"></div>
																</div>`
							contentBoxItem.html(templatebox)
							$('#AddOrderCodigo').on('click', addNewElementOrder)
						}

						// AGREGADO DE NUEVOS POSTES A LA LISTA DE ELEMENTOS
						function addNewElementOrder(){
							var codigo_poste = $('#codigoPoste')
							if (codigo_poste.val() !== '') {
								console.log('XD')
								var data = {
									code_service: codigo_poste.val()
								}
								// SE OBTIENE DATOS LOS DATOS DEL SERVICIO BUSCADO
								$http({
									method: 'POST',
									url: '/dashboard/ordenes_trabajo/poste',
									data: data,
								}).then(function(res){
									console.log(res)
									$('#codigoPoste').val('')
									var elementNew = res.data.poste
									var box_Content = $('#contentItems')
									var newDiv = document.createElement('div')
									newDiv.setAttribute('class', 'EditItem')
									newDiv.setAttribute('data-content', res.data.poste._id)
									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.poste.imagen_poste[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="codigo_poste">${res.data.poste.codigo_poste}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="type_poste"><strong>${res.data.poste.type_poste}</strong></p>
																		<p class="type_material">${res.data.poste.type_material}</p>
																	</div>
																	<!--<div class="EditItem__edit">
																		<p class="EditarPoste" data-id="${res.data.poste._id}">EDITAR</p>
																	</div>-->
																	<div class="EditItem__delete">
																		<p class="DeletePoste" data-id="${res.data.poste._id}">x</p>
																	</div>`
									newDiv.innerHTML = template
									box_Content.append(newDiv)
									// $('.EditarPoste').on('click', editOrdenItem)
									$('.DeletePoste').on('click', deletePoste)

									// CREACION DE NUEVO POSTE
									$http({
										method: 'POST',
										url: '/dashboard/ordenes_trabajo/'+item._id+'/add-item/poste'
									}).then(function(res){
										console.log(res)
										
										var data = {
											codigo_poste:elementNew.codigo_poste,
											type_poste:elementNew.type_poste,
											altura_poste:elementNew.altura_poste,
											type_material:elementNew.type_material,
											type_pastoral:elementNew.type_pastoral,
											type_luminaria:elementNew.Luminaria,
											type_lampara:elementNew.type_lampara,
											coordenada_X:elementNew.coordenada_X,
											coordenada_Y:elementNew.coordenada_Y,
											observaciones:elementNew.observaciones,
											estado_poste:elementNew.estado_poste,
											estado_pastoral:elementNew.estado_pastoral,
											estado_luminaria:elementNew.estado_luminaria,
											estado_lampara:elementNew.estado_lampara,
										}

										// EDICION DE POSTE NUEVO CREADO RECIENTEMENTE
										$http({
											method: 'POST',
											url: '/dashboard/ordenes_trabajo/'+item._id+'/item/poste/'+res.data.service._id+'?_method=put',
											data: data
										}).then(function(res){
											console.log(res)
										}, function(err){
											console.log(err)
										})		

									}, function(err){
										console.log(err)
									})

								}, function(err){
									console.log(err)
								})
							} else {
								console.log('ingrese codigo de poste')
							}
						}

						function addElementOrder(){
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/add-item/poste'
							}).then(function(res){
								console.log(res)
								var box_Content = $('#contentItems')
								var newDiv = document.createElement('div')
								newDiv.setAttribute('class', 'EditItem')
								newDiv.setAttribute('data-content', res.data.service._id)
								var template = `<div class="EditItem__image">
																	<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_poste[0].path})">
																	</div>
																	<div class="titleHead">
																		<p class="codigo_poste">${res.data.service.codigo_poste}</p>
																	</div>
																</div>
																<div class="EditItem__text">
																	<p class="type_poste"><strong>${res.data.service.type_poste}</strong></p>
																	<p class="type_material">${res.data.service.type_material}</p>
																</div>
																<div class="EditItem__edit">
																	<p class="EditarPoste" data-id="${res.data.service._id}">EDITAR</p>
																</div>
																<div class="EditItem__delete">
																	<p class="DeletePoste" data-id="${res.data.service._id}">x</p>
																</div>`
								newDiv.innerHTML = template
								box_Content.append(newDiv)
								// $('.EditarPoste').on('click', editOrdenItem)
								// $('.DeletePoste').on('click', deletePoste)
							}, function(err){
								console.log(err)
							})
						}

						// OBTENCION DE DATOS DE CADA ELEMENTO DE LA ORDEN
						for (var e = 0; e < item.elementos.length; e++) {
							var element = item.elementos[e]
							var it = e

							$http({
								method:'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/read/'+element.type+'/'+element._id
							}).then(function(res){
								console.log(res)

								var contentElement = document.createElement('div')
								contentElement.setAttribute('class', 'EditItem')
								contentElement.setAttribute('data-content', res.data.service._id)
								console.log(item.detalle_servicio)

								if (item.detalle_servicio === 'detalle_servicio_R') {

									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_poste[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="codigo_poste">${res.data.service.codigo_poste}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="type_poste"><strong>${res.data.service.type_poste}</strong></p>
																		<p class="type_material">${res.data.service.type_material}</p>
																	</div>
																	<div class="EditItem__edit">
																		<p class="EditarPoste" data-id="${res.data.service._id}">EDITAR</p>
																	</div>
																	<div class="EditItem__delete">
																		<p class="DeletePoste" data-id="${res.data.service._id}">x</p>
																	</div>`

									// $('#ElementsContainner').html(template)
									contentElement.innerHTML = template
									$('#contentItems').append(contentElement)
									// contentPostesContainner.append(contentElement)
									// $('.EditarPoste').on('click', editOrdenItem)
									// $('#addNewElement').on('click', addNewElementEdited)
								} else {
									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_poste[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="codigo_poste">${res.data.service.codigo_poste}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="type_poste"><strong>${res.data.service.type_poste}</strong></p>
																		<p class="type_material">${res.data.service.type_material}</p>
																	</div>
																	<div class="EditItem__delete">
																		<p class="DeletePoste" data-id="${res.data.service._id}">x</p>
																	</div>`
									contentElement.innerHTML = template
									$('#contentItems').append(contentElement)
								}

								// console.log(it, $('.EditItem').length-1)

								if (e === $('.EditItem').length) {
									// console.log(i+2, $('.EditItem').length)
									// console.log('XD')
									// var items = $('.editOrdenItem')
									// items.on('click', editOrdenItem)
									$('#contentItems').on('click','.EditarPoste', editOrdenItem)
									$('#contentItems').on('click', '.DeletePoste', deletePoste)
									// console.log($('.EditItem').length)
								}

							}, function(err){
								console.log(err)
							})
						}

						// ELIMINACION DE POSTES
						function deletePoste(){
							console.log(this.getAttribute('data-id'))
							var id = this.getAttribute('data-id')
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/delete/poste/'+id+'?_method=delete'
							}).then(function(res){
								console.log(res)
								$('[data-content="'+id+'"]').remove()
								$('[data-id="'+id+'"]').remove()
							}, function(err){
								console.log(err)
							})
						}
						
						// EDICION DE ITEM DE ORDEN DE TRABAJO
						function editOrdenItem(){
							var idPoste = this.getAttribute('data-id')
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/read/poste/'+idPoste
							}).then(function(res){
								console.log(res)
								var item = res.data.service
								var contentTemplateEditPoste = document.createElement('div')
								contentTemplateEditPoste.setAttribute('class', 'editPosteModal')
								var template = `<form action="" id="sendEditPoste" class="editPoste">
																	<div class="editPoste__containner">
																		<div class="editPoste__containner--title">
																			<h3>EDITAR REGISTRO DE POSTE</h3>
																		</div>
																		<div class="editPoste__containner--content">
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>Caracteristicas</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Código Poste</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="txt_codigo_poste" value="${item.codigo_poste}"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Altura de Poste</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="altura_poste" value="${item.altura_poste}"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de Poste</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="txt_type_poste" value="${item.type_poste}" />
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de Material</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="txt_type_material" value="${item.type_material}" />
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de pastoral</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="type_pastoral" value="${item.type_pastoral}"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de Luminaria</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="type_luminaria" value="${item.type_luminaria}"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de Lampará</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" id="type_lampara" value="${item.type_lampara}"/>
																					</div>
																				</div>
																			</div>
																			<div class="ubication">
																				<div class="ubication__title">
																					<h4>Ubicación</h4>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--map"  style="width:100%;height:200px" id="ItemMapsEdit"></div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada X</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" id="data-coordenada_X" value="${item.coordenada_X}"/>
																					</div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada Y</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" id="data-coordenada_Y" value="${item.coordenada_Y}"/>
																					</div>
																				</div>
																			</div>
																			<div class="estado">
																				<div class="estado__title">
																					<h4>Estado</h4>
																				</div>
																				<div class="estado__item">
																					<div class="estado__item--left">
																						<p><strong>Estado de Poste</strong></p>
																					</div>
																					<div class="estado__item--right">
																						<input type="text" class="inputs-label" id="estado_poste" value="${item.estado_poste}"/>
																					</div>
																				</div>
																				<div class="estado__item">
																					<div class="estado__item--left">
																						<p><strong>Estado de Pastoral</strong></p>
																					</div>
																					<div class="estado__item--right">
																						<input type="text" class="inputs-label" id="estado_pastoral" value="${item.estado_pastoral}"/>
																					</div>
																				</div>
																				<div class="estado__item">
																					<div class="estado__item--left">
																						<p><strong>Estado de Luminaria</strong></p>
																					</div>
																					<div class="estado__item--right">
																						<input type="text" class="inputs-label" id="estado_luminaria" value="${item.estado_luminaria}"/>
																					</div>
																				</div>
																				<div class="estado__item">
																					<div class="estado__item--left">
																						<p><strong>Estado de Lampará</strong></p>
																					</div>
																					<div class="estado__item--right">
																						<input type="text" class="inputs-label" id="estado_lampara" value="${item.estado_lampara}"/>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="editPoste__containner--buttons">
																			<div class="btn"><button id="editPosteCancel">CANCELAR</button></div>
																			<div class="btn"><button id="editPosteSave" type="submit">GUARDAR</button></div>
																		</div>
																	</div>
																</form>`

								contentTemplateEditPoste.innerHTML = template
								$('.OrderWork').append(contentTemplateEditPoste)

								// var url = GMaps.staticMapURL({
								//   size: [800, 400],
								//   lat: item.coordenada_X,
								//   lng: item.coordenada_Y,
								//   markers: [
								//     {lat: item.coordenada_X, lng: item.coordenada_Y}
								//   ]
								// })

								// $('#ItemMapsEdit').css('background-image', 'url('+url+')')

								var OldMapEdit = new GMaps({
								  div: '#ItemMapsEdit',
								  zoom: 11,
								  lat: -12.043333,
								  lng: -77.028333,
								  click: function(e) {
								    OldMapEdit.removeMarkers()
								    console.log(e)
								    $('#data-coordenada_X').val(e.latLng.lat())
								    $('#data-coordenada_Y').val(e.latLng.lng())
								    OldMapEdit.addMarker({
								      lat: e.latLng.lat(),
								      lng: e.latLng.lng(),
								      title: 'Lima',
								    })
								  }
								})

								OldMapEdit.addMarker({
								  lat: item.coordenada_X || '', 
								  lng: item.coordenada_Y || '', 
								});

								var btnCloseEditPoste = $('#editPosteCancel')
								btnCloseEditPoste.on('click', closeEditPoste)

								function closeEditPoste(ev){
									ev.preventDefault()
									$('.editPosteModal').remove()
								}

								$('#sendEditPoste').submit(function(ev){
									ev.preventDefault()

									var codigo_poste = $('#txt_codigo_poste')
									var type_poste = $('#txt_type_poste')
									var altura_poste = $('#altura_poste')
									var type_material = $('#txt_type_material')
									var type_pastoral = $('#type_pastoral')
									var type_luminaria = $('#type_luminaria')
									var type_lampara = $('#type_lampara')
									var coordenada_X = $('#data-coordenada_X')
									var coordenada_Y = $('#data-coordenada_Y')
									// var observaciones = $('#observaciones')
									var estado_poste = $('#estado_poste')
									var estado_pastoral = $('#estado_pastoral')
									var estado_luminaria = $('#estado_luminaria')
									var estado_lampara = $('#estado_lampara')

									console.log(altura_poste);

									var data = {
										codigo_poste: codigo_poste.val(),
										type_poste: type_poste.val(),
										altura_poste: altura_poste.val(),
										type_material: type_material.val(),
										type_pastoral: type_pastoral.val(),
										type_luminaria: type_luminaria.val(),
										type_lampara: type_lampara.val(),
										coordenada_X: coordenada_X.val(),
										coordenada_Y: coordenada_Y.val(),
										// observaciones:
										estado_poste: estado_poste.val(),
										estado_pastoral: estado_pastoral.val(),
										estado_luminaria: estado_luminaria.val(),
										estado_lampara: estado_lampara.val()
									}

									console.log(data)

									$http({
										method: 'POST',
										url: '/dashboard/ordenes_trabajo/'+res.data.work_order_id+'/item/poste/'+res.data.service._id+'?_method=put',
										data: data
									}).then(function(res){
										console.log(res)
										console.log($('[data-content="'+res.data.service._id+'"] .codigo_poste'))
										$('[data-content="'+res.data.service._id+'"] .codigo_poste').html(res.data.service.codigo_poste)
										$('[data-content="'+res.data.service._id+'"] .type_material').html(res.data.service.type_material)
										$('[data-content="'+res.data.service._id+'"] .type_poste').html(res.data.service.type_poste)
										// location.reload()
										$('.editPosteModal').remove()
									}, function(err){
										console.log(err)
									})
								})
							}, function(err){
								console.log(err)
							})
						}

						console.log($('#type_service'))
						var option = $('#detail_service option')
						// console.log(option)

						// SELECCION AUTOMATICA CON VALORES YA EXISTENTES DE DATA detalle de servicio
						var order_type_service
						if (item.detalle_servicio === 'Zona sin Alumbrado Publico') {
							item.detalle_servicio = 'detalle_servicio_A'
						} else if (item.detalle_servicio === 'Poste Chocado') {
							item.detalle_servicio = 'detalle_servicio_CH'
						} else if (item.detalle_servicio === 'Poste Caido por Corrosion') {
							item.detalle_servicio = 'detalle_servicio_CC'
						} else if (item.detalle_servicio === 'Mantenimiento de Poste') {
							item.detalle_servicio = 'detalle_servicio_M'
						} else if (item.detalle_servicio === 'Instalacion de Poste') {
							item.detalle_servicio = 'detalle_servicio_I'
						} else {
							item.detalle_servicio = 'detalle_servicio_R'
						}

						for (var i = 0; i < $('#detail_service option').length; i++) {
							var option = $('#detail_service option')[i]
							console.log('Esto es un form :D', item.detalle_servicio, option.value)
							if (option.value === item.detalle_servicio) {
								console.log('los datos estan aqui!',option.value, item.detalle_servicio)
								option.setAttribute('selected', 'selected')
							}
						}

						// SELECCION AUTOMATICA CON VALORES YA EXISTENTES DE DATA prioridad
						for (var i = 0; i < $('#priority option').length; i++) {
							var option = $('#priority option')[i]
							if ($(option)[0].value === item.tipo_urgencia) {
								option.setAttribute('selected', 'selected')
							}
						}

						if (item.public === true) {
							document.getElementById('true').checked = true
						} else {
							document.getElementById('false').checked = true
						}

						var sendEditOrder = $('.EditPoste__containner')

						sendEditOrder.submit(function(ev){
							var cod_contr = $('#codigo_contratista')
							var cod_super = $('#codigo_supervisor')
							var urgency = $('#priority')
							var direccion = $('#direccion')
							var descripcion = $('#descripcion')
							var fecha_visita_esperada = $('#date')
							var public = $("[name='public']:checked")

							ev.preventDefault()
							var data = {
								codigo_supervisor: cod_super.val(),
								codigo_contratista: cod_contr.val(),
								tipo_urgencia: urgency.val(),
								direccion: direccion.val(),
								descripcion: descripcion.val(),
								fecha_visita_esperada: fecha_visita_esperada.val(),
								public:public.val()
							}

							console.log(data)

							$http({
								method: 'POST',
								url:'/dashboard/ordenes_trabajo/'+order+'?_method=put',
								data: data
							}).then(function(res){
								console.log(res)
								location.reload()
							}, function(err){
								console.log(err)
							})
						})

						$('#closeEditOrder').on('click', function(ev){
							ev.preventDefault()
							$('.EditPoste').remove()
						})
					})
				}

				// MAPA STATIC
				var url = GMaps.staticMapURL({
				  size: [800, 400],
				  lat: item.coordenada_X,
				  lng: item.coordenada_Y,
				  markers: [
				    {lat: item.coordenada_X, lng: item.coordenada_Y}
				  ]
				});
				console.log(marker_order_poste)

				$('#mapStatic').css('background-image', 'url('+url+')')

				if (item.tipo_urgencia === 'tipo_urgencia_M') {
					$('#urgency').html('Media')
				} else if(item.tipo_urgencia === 'tipo_urgencia_A'){
					$('#urgency').html('Alta')
				} else {
					$('#urgency').html('Baja')						
				}

				if (item.public === true ) {
					$('#privacity').html('Público')
				} else {
					$('#privacity').html('No Público')						
				}
				$('.back').on('click', function(){
					$location.path('/dashboard')
					if (!$scope.$$phase) $scope.$apply()
				})
			}

			// INFORMACION DE ORDEN DE TRABAJO DE TIPO CLIENTE
			function infoCliente(item, type_service){
				var image = '../images/icon-Cliente.png'
				map.zoomIn(4)
				map.setCenter(item.coordenada_X,item.coordenada_Y)

				console.log(item.estado)

				var marker_order_client
				if (item.estado === $scope.url.pendiente) {
					marker_order_client = $scope.url.markers_focus_cliente_pendiente_short
				} else if(item.estado === $scope.url.en_curso){
					marker_order_client = $scope.url.markers_focus_cliente_en_curso_short
				} else if (item.estado === $scope.url.resuelto) {
					marker_order_client = $scope.url.markers_focus_cliente_resuelto_short
				} else if (item.estado === $scope.url.no_resuelto) {
					marker_order_client = $scope.url.markers_focus_cliente_no_resuelto_short
				} else if(item.estado === $scope.url.reprogramado){
					marker_order_client = $scope.url.markers_focus_cliente_reprogramado_short
				} else if(item.estado === $scope.url.cancelado){
					marker_order_client = $scope.url.markers_focus_cliente_cancelado_short
				}else {
					marker_order_client = $scope.url.markers_focus_cliente_reportado_short
				}

				map.addMarker({
				  lat: item.coordenada_X,
				  lng: item.coordenada_Y,
				  icon: marker_order_client
				});

				// Destalles de Servicio: CLIENTE
				if(item.detalle_servicio === 'detalle_servicio_VC') {

					item.detalle_servicio = 'Verificar Direccion de Cliente'
				} else if (item.detalle_servicio === 'detalle_servicio_RD') {

					item.detalle_servicio = 'Registro de Direccion'
				} else {

					item.detalle_servicio = 'Registrar Cliente Nuevo'
				}

				var contentWindow = $('.OrderWork__left')
				var DetailContent = document.createElement('div')
				DetailContent.setAttribute('class','InfoContainner')
				template = `<div class="InfoOrder">
											<div class="InfoOrder__imagePortrate">
												<div id="streetViewClient" style="width:100%;height:300px"></div>
											</div>
											<div class="InfoOrder__status">
												<p><span id="urgency"></span> <span id="status">${item.estado}</span></p>
												<div class="InfoOrder__desplegable" id="option_desplegable">
													<span class="icon-icon_submenu"></span>
													<div class="InfoOrder__desplegable--container">
														<div class="Items" id="optionOrders"></div>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Cliente</strong></p>
														<p class="content">${item.direccion}</p>
													</div>
													<div class="InfoOrder__data--privacity">
														<span id="privacity"></span>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Código de la Orden de trabajo</strong></p>
														<p class="content">${item.codigo_orden}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Detalle del Servicio</strong></p>
														<p class="content">${item.detalle_servicio}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<div class="userInfo__title">
															<h3>A cargo de</h3>
														</div>
														<div class="userInfo__data">
															<div class="userInfo__data--title">
																<h3>${item.user_card_data.user.name}</h3>	
															</div>
															<div class="userInfo__data--content">
																<div class="left">
																	<h4>Contratista</h4>
																	<p>${item.user_card_data.contratista.name}</p>
																</div>
																<div class="right">
																	<h4>Supervisor</h4>
																	<p>${item.user_card_data.supervisor.name}</p>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data mapastatic">
												<div id="mapStatic" class="InfoOrder__data--map">
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Descripción</strong></p>
														<p class="content">${item.descripcion}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--complete">
														<p class="title"><strong>Observaciones</strong></p>
														<p class="content">${item.conclusiones}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Fecha de Publicado</strong></p>
														<p class="content">${item.fecha_publicado}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Fecha de Visita esperada</strong></p>
														<p class="content">${item.fecha_visita_esperada}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data">
												<div class="InfoOrder__data--containner">
													<div class="InfoOrder__data--left">
														<p class="title"><strong>Fecha de Trabajo realizado</strong></p>
														<p class="content">${item.fecha_trabajo_realizado}</p>
													</div>
													<div class="InfoOrder__data--right">
														<p class="title"><strong>Reprogramado de</strong></p>
														<p class="content">${item.reprogramado_de}</p>
													</div>
												</div>
											</div>
											<div class="InfoOrder__data--slider">
												<div class="Slider">
													<div class="Slider__items" id="slides">
													</div>
													<div class="Slider__btnPrev"><span id="btnPrev" class="icon-icon_prev"></span></div>
													<div class="Slider__btnNext"><span class="icon-icon_next" id="btnNext"></span></div>
												</div>
											</div>
										</div>
										<div class="back">
											<span id="back" class="icon-icon_cerrar"></span>
										</div>`

				DetailContent.innerHTML = template
				contentWindow.append(DetailContent)

				// EFECTO HOVER SOBRE ICONO PARA VER OPCIONES OCULTAS DE ORDER
				$('#option_desplegable').on('mouseover', function(){
					console.log(this)
					$(this).find('.InfoOrder__desplegable--container').css('display', 'block')
				})

				$('#option_desplegable').on('mouseleave', function(){
					console.log(this)
					$(this).find('.InfoOrder__desplegable--container').css('display', 'none')
				})

				// VALIDACION DE COLORES POR ESTADO
				if (item.estado === 'pendiente') {
					console.log('XD')
					$('#status').html('Pendiente')
					$('#status').css('background-color', '#099692')
					$('.InfoOrder__status').css('border-top', '5px solid #099692')
				} else if (item.estado === 'resuelto') {
					console.log('XD')
					$('#status').html('Resueltas')
					$('#status').css('background-color', '#455a64')
					$('.InfoOrder__status').css('border-top', '5px solid #455a64')
				} else if (item.estado === 'no_resuelto') {
					console.log('XD')
					$('#status').html('No resuelta')
					$('#status').css('background-color', '#cb2948')
					$('.InfoOrder__status').css('border-top', '5px solid #cb2948')
				} else if (item.estado === 'reportado') {
					console.log('XD')
					$('#status').html('Reportada')
					$('#status').css('background-color', '#f15a24')
					$('.InfoOrder__status').css('border-top', '5px solid #f15a24')
				} else if (item.estado === 'en_curso') {
					console.log('XD')
					$('#status').html('En curso')
					$('#status').css('background-color', '#29abe2')
					$('.InfoOrder__status').css('border-top', '5px solid #29abe2')
				} else if (item.estado === 'cancelado') {
					console.log('XD')
					$('#status').html('Cancelada')
					$('#status').css('background-color', '#939393')
					$('.InfoOrder__status').css('border-top', '5px solid #939393')
				} else {
					console.log('XD')
					$('#status').html('Reprogramada')
					$('#status').css('background-color', '#e3d534')
					$('.InfoOrder__status').css('border-top', '5px solid #e3d534')
				}

				var contentOptionOrder = $('#optionOrders')

				if (item.estado === 'pendiente' && item.public === true) {
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					contentOptionOrder.html(txt)
					var CancelOrder = $('#btnCancelOrderPoste')
					CancelOrder.on('click', cancelOrder)
				} else if(item.estado === 'pendiente' && item.public === false){
					var txt = `<div id="btnEditOrderPoste" data-element="${item._id}"><span>Editar</span></div>
										<div id="deleteOrder"><span>Eliminar</span></div>`
					contentOptionOrder.html(txt)
					var EditOrder = $('#btnEditOrderPoste')
					EditOrder.on('click', editOrder)
				} else if(item.estado === 'resuelto' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
					$('#option_desplegable').remove()
				} else if(item.estado === 'no_resuelto' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
					$('#option_desplegable').remove()
				} else if(item.estado === 'reportado' && item.public === true){
					var txt = `<div data-reported="${item._id}" id="btnReporteOrderPoste"><span>Ver Reporte</span></div>`
					contentOptionOrder.html(txt)
					var viewReporte = $('#btnReporteOrderPoste')
					viewReporte.on('click', actionOrder)
				} else if(item.estado === 'en_curso' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					contentOptionOrder.html(txt)
					var CancelOrder = $('#btnCancelOrderPoste')
					CancelOrder.on('click', cancelOrder)
				}  else if(item.estado === 'cancelado' && item.public === true){
					var txt = `<div id="btnCancelOrderPoste"><span>Cancelar</span></div>`
					// contentOptionOrder.html(txt)
					// var CancelOrder = $('#btnCancelOrderPoste')
					// CancelOrder.on('click', cancelOrder)
					$('#option_desplegable').remove()
				} else if(item.estado === 'reprogramado' && item.public === false) {
					var txt = `<div id="btnEditOrderPoste" data-element="${item._id}"><span>Editar</span></div>
										<div id="deleteOrder"><span>Eliminar</span></div>`
					contentOptionOrder.html(txt)
					var EditOrder = $('#btnEditOrderPoste')
					EditOrder.on('click', editOrder)
				} else {
					console.log('XD')
				}

				function cancelOrder(){
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/change-status/cancelado'
					}).then(function(res){
						console.log(res)
						location.reload()
					}, function(err){
						console.log(err)
					})
				}

				var contentSlides = $('#slides')
				// var dataCliente

				console.log(item.coordenada_X,item.coordenada_Y)

				var panorama = GMaps.createPanorama({
				  el: '#streetViewClient',
				  lat : item.coordenada_X,
				  lng : item.coordenada_Y
				})


				panorama.setOptions({disableDefaultUI: true, clickToGo:false, zoomControl:false, scrollwheel:false, streetViewControl:false})

				// ELIMINACION DE ORDEN
				$('#deleteOrder').on('click', function(){
					console.log('XD')
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/delete/'+item._id+'?_method=delete'
					}).then(function(res){
						console.log(res)
						location.reload()
					}, function(err){
						console.log(err)
					})
				})

				// LECTURA DE CADA ELEMENTO DE LA ORDEN
				for (var i = 0; i < item.elementos.length; i++) {
					var element = item.elementos[i]
					$http({
						method:'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/read/'+element.type+'/'+element._id
					}).then(function(res){
						console.log(item.estado)

						var marker_client
						if (item.estado === $scope.url.pendiente) {
							marker_client = $scope.url.marker_client_pendiente_short
						} else if(item.estado === $scope.url.en_curso){
							marker_client = $scope.url.marker_client_en_curso_short
						} else if(item.estado === $scope.url.cancelado){
							marker_client = $scope.url.marker_client_cancelada_short
						} else if(item.estado === $scope.url.resuelto){
							marker_client = $scope.url.marker_client_resuelta_short
						} else if(item.estado === $scope.url.no_resuelto){
							marker_client = $scope.url.marker_client_no_resuelta_short
						} else if(item.estado === $scope.url.reprogramado){
							marker_client = $scope.url.marker_client_reprogramada_short
						} else if(item.estado === $scope.url.reportado){
							marker_client = $scope.url.marker_client_reportada_short
						} else {
							marker_client = $scope.url.marker_client_no_asignada_short
						}

						console.log(marker_client)

						map.addMarker({
							lat: Number(res.data.service.coordenada_X),
							lng: Number(res.data.service.coordenada_Y),
							click: function(e){
								console.log(e)
							},
							icon: marker_client
						})

						console.log(res)

						var contentElement = document.createElement('div')
						contentElement.setAttribute('class', 'Slider__items--item')
						contentElement.setAttribute('data-id', res.data.service._id)
						// console.log(contentElement)
						var template = `<div class="ItemContainner">
															<div class="ItemContainner__box">
																<div class="ItemContainner__box--image">
																	<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_cliente[0].path})">
																	</div>
																	<div class="titleHead">
																		<p>${res.data.service.numero_cliente}</p>
																	</div>
																</div>
																<div class="ItemContainner__box--text">
																	<p class="titleContent"><strong>${res.data.service.name_cliente}</strong></p>
																	<p class="typeResidencial" id="type_residencial"></p>
																</div>
															</div>
														</div>`

						contentElement.innerHTML = template
						contentSlides.append(contentElement)

						if (res.data.service.type_residencial === true) {
							$('#type_residencial').innerHTML = 'Residencial'
						} else {
							$('#type_residencial').innerHTML = 'No Residencial'
						}

						console.log($('.Slider__items--item'))
						console.log(i, $('.Slider__items--item').length)
						if (i === $('.Slider__items--item').length) {
							initSlides()
							$('.Slider__items--item').on('click', dateCliente)
						}

					}, function(err){
						console.log(err)
					})
				}

				var estadoCliente = item.estado

				// VISTA DE CADA ELEMENTO DE LA ORDEN
				function dateCliente(){
					map.removeMarkers()
					var idElement = this.getAttribute('data-id')
					console.log(idElement)
					$http({
						method: 'POST',
						url: '/dashboard/ordenes_trabajo/'+item._id+'/read/cliente/'+idElement
					}).then(function(res){
						console.log(res)

						var item = res.data.service
						var residencial
						if (item.type_residencial ===  true) {
							residencial = 'Residencial'
						} else {
							residencial = 'No Residencial'
						}
						var containner = $('.OrderWork__left')
						var content = document.createElement('div')
						content.setAttribute('class', 'DateInfoElement')
						var templateElement = `<div class="DateInfoElement__containner">
													<div class="DateInfoElement__containner--slider">
														<div class="ContentSliderItem" id="ContentSliderItem"></div>
														<div class="ContentSliderPrev" id="btnPrevB"><span class="icon-icon_prev"></span></div>
														<div class="ContentSliderNext" id="btnNextB"><span class="icon-icon_next"></span></div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>ID Cliente</strong></p>
																<p class="content">${item.cliente_id}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Código de Orden de Trabajo</strong></p>
																<p class="content">${item.codigo_orden_trabajo}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Número de Cliente</strong></p>
																<p class="content">${item.numero_cliente}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Distrito</strong></p>
																<p class="content">${item.altura_poste}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Nombre de Vía</strong></p>
																<p class="content">${item.codigo_via}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Número dem Puerta</strong></p>
																<p class="content">${item.numero_puerta}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Puerta Interior</strong></p>
																<p class="content">${item.numero_interior}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Urbanización</strong></p>
																<p class="content">${item.type_lampara}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Manzana</strong></p>
																<p class="content">${item.manzana}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Lote</strong></p>
																<p class="content">${item.lote}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Nombre de Cliente</strong></p>
																<p class="content">${item.nombre_de_cliente}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Tipo de Residencial</strong></p>
																<p class="content">${residencial}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Maximetro BT</strong></p>
																<p class="content">${item.is_maximetro_bt}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data mapastatic">
														<div id="mapaElement" class="mapaElement"></div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Coordenada X</strong></p>
																<p class="content">${item.coordenada_X}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Coordenada Y</strong></p>
																<p class="content">${item.coordenada_Y}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Tipo de Conexión</strong></p>
																<p class="content">${item.type_conexion}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Tipo de Acometida</strong></p>
																<p class="content">${item.type_acometida}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Tipo de Cable de Acometida</strong></p>
																<p class="content">${item.type_cable_acometida}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Calibre de Cable de Acometida</strong></p>
																<p class="content">${item.calibre_cable_acometida}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Calibre de Cable Matriz</strong></p>
																<p class="content">${item.calibre_cable_matriz}</p>
															</div>
															<div class="DateRight">
																<p class="title"><strong>Fecha de Ejecución</strong></p>
																<p class="content">${item.fecha_ejecucion}</p>
															</div>
														</div>
													</div>
													<div class="DateInfoElement__containner--data">
														<div class="DateItem">
															<div class="DateLeft">
																<p class="title"><strong>Observaciones</strong></p>
																<p class="content">${item.observaciones}</p>
															</div>
														</div>
													</div>
												</div>
												<div class="DateInfoElement__back">
													<span id="backItemOrder" class="icon-icon_close"></span>
												</div>`

						content.innerHTML = templateElement
						// console.log(content)
						containner.append(content)

						var items = item.imagen_cliente
						$('#ContentSliderItem').css('width', items.length*100+'px')
						for (var o = 0; o < items.length; o++) {
							if ($('.sliderItem__containner').length < 1) {
								Loader.delete('.ContentSliderItem', 'SliderItemsOrder')
							}
							var sliderItem = document.createElement('div')
							sliderItem.setAttribute('class', 'sliderItem')

							var template
							console.log(items[o])

							if (items[o].extension === 'jpeg' || items[o].extension==='png' || items[o].extension==='gif' || items[o].extension==='jpg') {
								if (items[o].extension === 'jpg' && items[o].size > 3000000) {
									console.log(items[o])
									template = `<div class="sliderItem__containner">
																<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																	<div class="BoxIcon" data-size="${items[o].size}" data-extension="${items[o].extension}" data-path="${items[o].path}">
																		<span class="panoramaView icon-icon_360"></span>
																	</div>
																</div>
															</div>`

									sliderItem.innerHTML = template

									$('#ContentSliderItem').append(sliderItem)
									console.log('es imagen 360° XD')
								} else {
									console.log(items[o])
									template = `<div class="sliderItem__containner">
																<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																	<div class="BoxIcon" data-size="${items[o].size}" data-extension="${items[o].extension}" data-path="${items[o].path}">
																		<span class="icon-icon_imagen"></span>
																	</div>
																</div>
															</div>`

									sliderItem.innerHTML = template

									$('#ContentSliderItem').append(sliderItem)											
								}
							} else if(items[o].extension === 'mp4') {
								console.log(items[o])
								// if (items[o].path === 'http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4'){
								// 	items[o].path = 'https://1fhjlow.oloadcdn.net/dl/l/xm11v2PR7QNTX2nR/wGFgoVy7ur0/rezerooo-24.mp4?mime=true'
								// }
								console.log('este es un video')
								template = `<div class="sliderItem__containner">
															<div class="sliderItem__containner--video">
																<div class="BoxIcon" data-extension="${items[o].extension}" data-path="${items[o].path}">
																	<span class="icon-icon_video"></span>
																</div>
																<video class="videoPlayer" data-extension="${items[o].extension}" data-path="${items[o].path}" src="${items[o].path}"></video>
															</div>
														</div>`

								sliderItem.innerHTML = template

								$('#ContentSliderItem').append(sliderItem)
								// $('.videoPlayer').on('click', videoPlayer)
							} else if(items[o].mimetype === 'default'){
								console.log('es imagen XD')
								console.log(items[o])
								template = `<div class="sliderItem__containner">
															<div class="sliderItem__containner--image" data-content="${items[o].position}"  style="background-image:url(${items[o].path})">
																<div class="BoxIcon" data-extension="${items[o].extension}" data-path="${items[o].path}">
																	<!--<span class="icon-icon_imagen"></span>-->
																</div>
															</div>
														</div>`

								sliderItem.innerHTML = template

								$('#ContentSliderItem').append(sliderItem)
							} else {
								console.log('ninguna no coincide')
							}

							// console.log(o, $('.sliderItem').length-1, items.length)

							if (o === items.length-1) {
								initSlidesImages()
								console.log('XD')
							} else {
								console.log('XDFG')
							}
							
						}

						$('.BoxIcon').on('click', modalLighBox)
						$('.videoPlayer').on('click', modalLighBox)

						function modalLighBox(){
							var path = this.getAttribute('data-path')
							console.log(path)
							var  LightBox = document.createElement('div')
							LightBox.setAttribute('class', 'LightBox')
							var extension = this.getAttribute('data-extension')
							var size = this.getAttribute('data-size')

							var  template = ''

							if (extension !== 'mp4') {
								if (extension === 'jpg' && size > 3000000) {
									template = `<div class="LightBox__containner">
																<div class="Panorama" id="PanoramaPhoto"></div>
																<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
															</div>`
								} else {
									template = `<div class="LightBox__containner">
																<figure class="LightBox__containner--photo">
																	<img src="${path}"/>
																</figure>
																<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
															</div>`
								}
							} else {
								template = `<div class="LightBox__containner">
															<div class="LightBox__containner--video">
																<video src="${path}" controls="true" autoplay></video>
															</div>
															<div class="LightBox__containner--close"><span class="icon-icon_close" id="closeLighBox"></span></div>
														</div>`
							}

							LightBox.innerHTML = template
							$('.container').append(LightBox)
							if (document.getElementById('PanoramaPhoto') !== null) {
								pannellum.viewer('PanoramaPhoto', {
									"type": "equirectangular",
									"panorama": path,
									// "preview": "./361.jpg",
									"autoLoad": true,
									"compass": false,
								})
							}
							$('#closeLighBox').on('click', function(){
								console.log('XD')
								$('.LightBox').remove()
							})

						}


						$('#backItemOrder').on('click', function(){
							$('.DateInfoElement').remove()
						})

						// MAPA STATIC
						var url = GMaps.staticMapURL({
						  size: [800, 400],
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y,
						  markers: [
						    {lat: item.coordenada_X, lng: item.coordenada_Y}
						  ]
						});

						$('#mapaElement').css('background-image', 'url('+url+')')

						console.log(estadoCliente)
						
						map.setCenter(item.coordenada_X,item.coordenada_Y)

						var marker_info_cliente
						if (estadoCliente === $scope.url.pendiente) {
							marker_info_cliente = $scope.url.marker_client_pendiente_short
						} else if(estadoCliente === $scope.url.en_curso){
							marker_info_cliente = $scope.url.marker_client_en_curso_short
						} else if (estadoCliente === $scope.url.resuelto) {
							marker_info_cliente = $scope.url.marker_client_resuelta_short
						} else if (estadoCliente === $scope.url.no_resuelto) {
							marker_info_cliente = $scope.url.marker_client_no_resuelta_short
						} else if(estadoCliente === $scope.url.reprogramado){
							marker_info_cliente = $scope.url.marker_client_reprogramada_short
						} else if(estadoCliente === $scope.url.cancelado){
							marker_info_cliente = $scope.url.marker_client_cancelada_short
						} else {
							marker_info_cliente = $scope.url.marker_client_reportada_short
						}

						// // mapEdit.markers
						map.addMarker({
							lat: Number(item.coordenada_X),
							lng: Number(item.coordenada_Y),
							click: function(e){
								console.log(e)
							},
							icon: marker_info_cliente
						})

						// INICIO DE SLIDES de imagenes y videos
						function initSlidesImages(){

							// $('#ContentSliderItem').css('width', (items.length*width)+'px')
							$('#ContentSliderItem').css('width', (items.length)*450+'px')

							var btnNext = $('#btnNextB')
							var btnPrev = $('#btnPrevB')

							btnNext.on('click', nextSlideB)
							btnPrev.on('click', prevSlideB)
						}

						// NEXT SLIDES
						function nextSlideB(){
							console.log('XD')
							var margin = $('#ContentSliderItem').css('margin-left')
							var px = 'px'
							if (margin.indexOf(px) != -1) {
								margin = margin.replace('px','')
								margin = parseInt(margin)
							}

							var maxMargin = ($('.sliderItem').length-1)*-450
							console.log(margin,maxMargin)

							if (margin > maxMargin) {
								// console.log(margin)
								var newMargin = margin - 450
								$('#ContentSliderItem').animate({
									marginLeft: newMargin+'px'
								}, 80)
							}
						}

						// PREV SLIDES
						function prevSlideB(){
							var margin = $('#ContentSliderItem').css('margin-left')
							var px = 'px'
							if (margin.indexOf(px) != -1) {
								margin = margin.replace('px','')
								margin = parseInt(margin)
							}
							if (margin < 0) {
								var minMargin = margin + 450
								console.log(margin, minMargin)
								$('#ContentSliderItem').animate({
									marginLeft: minMargin
								}, 80)
							}
						}

					}, function(err){
						console.log(err)
					})
				}

				var EditOrder = $('#btnEditOrderClient')
				EditOrder.on('click', editOrder)

				function editOrder(){
					var order = this.getAttribute('data-element')
					contentTemplateEdit = $('.OrderWork')
					var templateEditPoste = document.createElement('div')
					templateEditPoste.setAttribute('class', 'EditPoste')
					contentTemplateEdit.append(templateEditPoste)
					Loader.create('.EditPoste', 'LoaderCliente')
					$http({
						method: 'GET',
						url: '/dashboard/ordenes_trabajo/'+order
					}).then(function(res){
						Loader.delete('.EditPoste', 'LoaderCliente')
						console.log(res)
						var item = res.data.work_order
						// Destalles de Servicio: CLIENTE
						if(item.detalle_servicio === 'detalle_servicio_VC') {

							item.detalle_servicio = 'Verificar Direccion de Cliente'
						} else if (item.detalle_servicio === 'detalle_servicio_RD') {

							item.detalle_servicio = 'Registro de Direccion'
						} else {

							item.detalle_servicio = 'Registrar Cliente Nuevo'
						}

						var template = `<form action="" class="EditPoste__containner">
															<div class="EditPoste__containner--head">
																<h3>EDITAR ORDEN DE TRABAJO</h3>
															</div>
															<div class="EditPoste__containner--body">
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Tipo de Servicio</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" name="type_service" id="type_service" disabled>
																				<option value="tipo_servicio_P">Poste</option>
																				<option value="tipo_servicio_C" selected>Cliente</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Detalle del Servicio</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" name="detail_service" id="detail_service" disabled>
																				<option>Seleccione</option>
																				<option value="detalle_servicio_VC">Verificar Direccion de Cliente</option>
																				<option value="detalle_servicio_RD">Registro de Direccion</option>
																				<option value="detalle_servicio_RCN">Registrar Cliente Nuevo</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Usuario</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" required name="" id="codigo_contratista"></select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Supervisor</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" required name="" id="codigo_supervisor"></select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Prioridad</strong></p>
																	</div>
																	<div class="Data__right">
																		<div class="selectBox">
																			<select class="selectBox__select" name="priority" id="priority">
																				<option value="tipo_urgencia_A">Alta</option>
																				<option value="tipo_urgencia_M">Media</option>
																				<option value="tipo_urgencia_B">Baja</option>
																			</select>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Dirección</strong></p>
																	</div>
																	<div class="Data__right">
																		<input class="inputs-label" id="direccion" type="text" class="" value="${item.direccion}"/>
																	</div>
																</div>
																<div class="Data">
																	<div id="mapEdit" style="width:100%;height:200px"></div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Coordenada X</strong></p>
																	</div>
																	<div class="Data__right">
																		<input class="inputs-label" id="coordenada_X" type="text" class=""  value="${item.coordenada_X}"/>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Coordenada Y</strong></p>
																	</div>
																	<div class="Data__right">
																		<input class="inputs-label" id="coordenada_Y" type="text" class=""  value="${item.coordenada_Y}"/>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left labelTextarea">
																		<p><strong>Descripción</strong></p>
																	</div>
																	<div class="Data__right">
																		<textarea name="" class="inputs-label" id="descripcion" cols="30" rows="5">${item.descripcion}</textarea>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Fecha de Visita Esperada</strong></p>
																	</div>
																	<div class="Data__right">
																		<input class="inputs-label" id="date" type="date" />
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left">
																		<p><strong>Público</strong></p>
																	</div>
																	<div class="Data__right inputStatus">
																		<div class="Data__right--true">
																			<input name="public" id="true" value="true" type="radio" />
																			<label for="true">Si</label>
																		</div>
																		<div class="Data__right--false">
																			<input name="public" id="false" value="false" type="radio" />
																			<label for="false">No</label>
																		</div>
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__left countPoste">
																		<p><strong>Cantidad de Clientes</strong></p>
																	</div>
																	<div class="Data__right" id="ElementsContainner">
																	</div>
																</div>
																<div class="Data">
																	<div class="Data__btns">
																		<div class="Data__btns--cancel">
																			<button id="closeEditOrder">CANCELAR</button>
																		</div>
																		<div class="Data__btns--send">
																			<button type="submit">GUARDAR</button>
																		</div>
																	</div>
																</div>
															</div>
														</form>`

						$('.EditPoste').html(template)
						
						var OldDate = item.fecha_visita_esperada
						OldDate = OldDate.split('/')
						console.log(OldDate)
						var day = OldDate[0]
						var mounth = OldDate[1]
						var year = OldDate[2]

						if (parseInt(mounth) <  10) {
							mounth = '0'+mounth
						}
						if (parseInt(day) <  10) {
							day = '0'+day
						}

						var fechaDate = year+'-'+mounth+'-'+day
						console.log(typeof fechaDate, fechaDate)
						$('#date').val(fechaDate)

						// USUARIOS CONTRATISTAS EN SELECT
						$http({
							method: 'GET',
							url:'/dashboard/usuarios/list/users-campo'
						}).then(function(res){
							console.log('XD123456')
							console.log(res)
							var usersListContratista = res.data.usuarios
							for (var i = 0; i < usersListContratista.length; i++) {
								var content = $('#codigo_contratista')
								var user = document.createElement('option')
								user.setAttribute('value', usersListContratista[i]._id)
								user.innerHTML = usersListContratista[i].full_name
								content.append(user)
							}

							for (var i = 0; i < $('#codigo_contratista option').length; i++) {
								var option = $('#codigo_contratista option')[i]
								if ($(option)[0].value === item.codigo_contratista) {
									option.setAttribute('selected', 'selected')
								}
							}
						}, function(err){
							console.log(err)
						})

						// USUARIOS SUPERVISORES EN SELECT
						$http({
							method: 'GET',
							url: '/dashboard/usuarios/list/officers'
						}).then(function(res){
							var usersListSupervisor = res.data.usuarios
							for (var i = 0; i < usersListSupervisor.length; i++) {
								console.log('XD')
								var content = $('#codigo_supervisor')
								var user = document.createElement('option')
								user.setAttribute('value', usersListSupervisor[i]._id)
								user.innerHTML = usersListSupervisor[i].full_name
								content.append(user)
							}

							for (var i = 0; i < $('#codigo_supervisor option').length; i++) {
								var option = $('#codigo_supervisor option')[i]
								if ($(option)[0].value === item.codigo_supervisor) {
									option.setAttribute('selected', 'selected')
								}
							}
						}, function(err){
							console.log(err)
						})

						// console.log($('#type_service'))
						// var option = $('#detail_service option')[0]
						// console.log($(option)[0].value)

						if (item.detalle_servicio === 'Registrar Cliente Nuevo') {
							var template = `<div class="itemContainner" id="itemContainner">
																<div  id="contentItems" >
																</div>
															</div>`

							$('#ElementsContainner').html(template)
							// $('.EditarPoste').on('click', editElementOrderDireccion)
						} else if (item.detalle_servicio === 'Verificar Direccion de Cliente'){
							var template = `<div class="searchItem">
																<div class="searchItem__btnSearch">
																	<div class="searchItem__btnSearch--input">
																		<input class="inputs-label" id="codigoCliente" type="text" />
																	</div>
																	<div class="searchItem__btnSearch--btn">
																		<p id="AddOrderCodigo"><span>+</span> Agregar Cliente</p>
																	</div>
																</div>
																<div id="contentItems"></div>
															</div>`
							$('#ElementsContainner').html(template)					
							$('#AddOrderCodigo').on('click',addSearchElementOrder)
						} else {
							var template = `<div class="itemContainner" id="itemContainner">
																<div  id="contentItems" >
																</div>
																<div class="BtnNewElement">
																	<div class="BtnNewElement__containner">
																		<p id="addNewElement"><span class="icon-icon_agregar_poste"></span></p>
																	</div>
																</div>
															</div>`
							$('#ElementsContainner').html(template)
							$('#addNewElement').on('click', addNewElementEdited)
							// $('.EditarPoste').on('click', editElementOrderExistent)
						}

						for (var e = 0; e < item.elementos.length; e++) {
							// console.log('XD')
							var element = item.elementos[e]
							var it = e

							$http({
								method:'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/read/'+element.type+'/'+element._id
							}).then(function(res){
								console.log(res)
								console.log(item.detalle_servicio)
								var contentPostesContainner = $('#contentItems')

								var contentElement = document.createElement('div')
								contentElement.setAttribute('class', 'EditItem')
								contentElement.setAttribute('data-content', res.data.service._id)
								// console.log(contentElement)
								var residencial
								if (res.data.service.type_residencial === 'true') {
									residencial = 'Residencial'
								} else {
									residencial = 'No Residencial'
								}

								if (item.detalle_servicio === 'detalle_servicio_RCN') {
									console.log('XD RCN')
									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_cliente[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="cliente_id">${res.data.service.cliente_id}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="nombre_de_cliente"><strong>${res.data.service.nombre_de_cliente}</strong></p>
																		<p class="type_residencial">${residencial}</p>
																	</div>
																	<div class="EditItem__edit">
																		<p class="EditarPosteRCN" data-id="${res.data.service._id}">EDITAR</p>
																	</div>`
									contentElement.innerHTML = template
									contentPostesContainner.append(contentElement)
									if (e === $('.EditItem').length) {
										// var items = $('.EditarPosteRCN')
										$('#contentItems').on('click', '.EditarPosteRCN', editOrdenItemClientNew)
									}
								} else if (item.detalle_servicio === 'detalle_servicio_VC') {
									console.log('XD VC')
									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_cliente[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="cliente_id">${res.data.service.cliente_id}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="nombre_de_cliente"><strong>${res.data.service.nombre_de_cliente}</strong></p>
																		<p class="type_residencial">${residencial}</p>
																	</div>
																	<div class="EditItem__delete">
																		<p class="DeleteCliente" data-id="${res.data.service._id}">x</p>
																	</div>`
									contentElement.innerHTML = template
									contentPostesContainner.append(contentElement)
									// $('#addNewElement').on('click', addNewElementEdited)
									if (e === $('.EditItem').length) {
										$('#contentItems').on('click', '.DeleteCliente', deleteItemCliente)
									}
								} else {
									console.log('XD RD')
									var template = `<div class="EditItem__image">
																		<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_cliente[0].path})">
																		</div>
																		<div class="titleHead">
																			<p class="cliente_id">${res.data.service.cliente_id}</p>
																		</div>
																	</div>
																	<div class="EditItem__text">
																		<p class="nombre_de_cliente"><strong>${res.data.service.nombre_de_cliente}</strong></p>
																		<p class="type_residencial">${residencial}</p>
																	</div>
																	<div class="EditItem__edit">
																		<p class="EditarPoste" data-id="${res.data.service._id}">EDITAR</p>
																	</div>
																	<div class="EditItem__delete">
																		<p class="DeleteCliente" data-id="${res.data.service._id}">x</p>
																	</div>`
									contentElement.innerHTML = template
									contentPostesContainner.append(contentElement)
									// console.log(e, $('.EditItem').length)
									if (e === $('.EditItem').length) {
										console.log('XD')
										// var items = $('.EditarPoste')
										$('#contentItems').on('click', '.EditarPoste', editOrdenItemClient)
										$('#contentItems').on('click', '.DeleteCliente', deleteItemCliente)
									}
								}

							}, function(err){
								console.log(err)
							})
						}

						// AGREGADO DE UN NUEVO ELEMENTO
						function addNewElementEdited(){
							console.log('XD')
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/add-item/cliente'
							}).then(function(res){
								console.log(res)
								var item = res.data.service
								var containner = $('#contentItems')
								var div = document.createElement('div')
								div.setAttribute('data-content', item._id)
								div.setAttribute('class', 'EditItem')
								var template = `<div class="EditItem__image">
																	<div class="ItemPhoto" style="background-image:url('/images/elemento_defaul.png')">
																	</div>
																	<div class="titleHead">
																		<p class="cliente_id">Sin Datos</p>
																	</div>
																</div>
																<div class="EditItem__text">
																	<p class="nombre_de_cliente"><strong>Sin Datos</strong></p>
																	<p class="type_residencial">Sin Datos</p>
																</div>
																<div class="EditItem__edit">
																	<p class="EditarPoste" data-id="${item._id}">EDITAR</p>
																</div>
																<div class="EditItem__delete">
																	<p class="DeleteCliente" data-id="${item._id}">x</p>
																</div>`

								div.innerHTML = template
								containner.append(div)
								// $('.EditarPoste').on('click', editOrdenItemClient)
								// $('.DeleteCliente').on('click', deleteItemCliente)

							}, function(err){
								console.log(err)
							})
						}

						// ELIMINACION DE UN CIENTE DE LA ORDEN
						function deleteItemCliente(){
							var id = this.getAttribute('data-id')
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/delete/cliente/'+id+'?_method=delete'
							}).then(function(res){
								console.log(res)
								$('[data-content="'+id+'"]').remove()
							}, function(err){
								console.log(err)
							})
						}

						// EDICION DE UN ITEM DE LA ORDEN DE TIPO CLIENTE RD
						function editOrdenItemClient(){
							console.log(this)
							var idElement = this.getAttribute('data-id')
							console.log(idElement)
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/read/cliente/'+idElement
							}).then(function(res){
								console.log(res)
								var elementData = res.data.service
								var contentTemplateEditPoste = document.createElement('div')
								contentTemplateEditPoste.setAttribute('class', 'editPosteModal')
								var template = `<form action="" class="editPoste editClientElement">
																	<div class="editPoste__containner">
																		<div class="editPoste__containner--title">
																			<h3>REGISTRO DE DIRECCIÓN DE CLIENTE</h3>
																		</div>
																		<div class="editPoste__containner--content">
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>Caracteristicas</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>ID Cliente</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.cliente_id}" id="data_cliente_id"/>
																					</div>
																				</div>
																			</div>
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>DIRECCIÓN</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Distrito</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" value="${elementData.distrito}" class="inputs-label" id="data_distrito"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Nombre de Vía</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.codigo_via}" id="data_codigo_via"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Número de Puerta</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.numero_puerta}" id="data_numero_puerta"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Puerta Interior</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.numero_interior}" id="data_numero_interior"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Urbanización</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" value="${elementData.urbanizacion}" class="inputs-label" id="data_urbanizacion"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Manzana</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.manzana}" id="data_manzana"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Lote</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.lote}" id="data_lote"/>
																					</div>
																				</div>
																			</div>
																			<div class="ubication">
																				<div class="ubication__title">
																					<h4>Ubicación</h4>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication_item--map" style="width:100%;height:200px" id="OldMapsEdits"></div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada X</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" value="${elementData.coordenada_X}" id="element_coordenada_X"/>
																					</div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada Y</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" value="${elementData.coordenada_Y}" id="element_coordenada_Y"/>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="editPoste__containner--buttons">
																			<div class="btn"><button class="editClienteCancel">CANCELAR</button></div>
																			<div class="btn"><button class="editClienteSend" type="submit">GUARDAR</button></div>
																		</div>
																	</div>
																</form>`

								contentTemplateEditPoste.innerHTML = template
								$('.OrderWork').append(contentTemplateEditPoste)
								// $('#mapsEdit').css('background-image', 'url('+url+')')

								var btnCloseEditPoste = $('.editClienteCancel')
								// btnCloseEditPoste.on('click', closeEditPoste)

								var OldMapEdit = new GMaps({
								  div: '#OldMapsEdits',
								  zoom: 11,
								  lat: -12.043333,
								  lng: -77.028333,
								  click: function(e) {
								    OldMapEdit.removeMarkers()
								    console.log(e)
								    $('#element_coordenada_X').val(e.latLng.lat())
								    $('#element_coordenada_Y').val(e.latLng.lng())
								    OldMapEdit.addMarker({
								      lat: e.latLng.lat(),
								      lng: e.latLng.lng(),
								      title: 'Lima',
								    })
								  }
								})

								OldMapEdit.addMarker({
								  lat: elementData.coordenada_X,
								  lng: elementData.coordenada_Y,
								});

								btnCloseEditPoste.on('click',function(ev){
									ev.preventDefault()
									$('.editPosteModal').remove()
								})

								$('.editClientElement').submit(function(ev){
									ev.preventDefault()
									console.log('bvbnmmn')
									var el_cliente_distrito = $('#data_distrito')
									var el_cliente_id = $('#data_cliente_id')
									var el_codigo_via = $('#data_codigo_via')
									var el_numero_puerta = $('#data_numero_puerta')
									var el_numero_interior = $('#data_numero_interior')
									var el_manzana = $('#data_manzana')
									var el_lote = $('#data_lote')
									var el_coordenada_X = $('#element_coordenada_X')
									var el_coordenada_Y = $('#element_coordenada_Y')
									var el_urbanizacion = $('#data_urbanizacion')

									console.log(el_codigo_via);

									var data = {
										urbanizacion: el_urbanizacion.val(),
										distrito: el_cliente_distrito.val(),
										cliente_id: el_cliente_id.val(),
										codigo_via: el_codigo_via.val(),
										numero_puerta: el_numero_puerta.val(),
										numero_interior:el_numero_interior.val(),
										manzana:el_manzana.val(),
										lote:el_lote.val(),
										coordenada_X: el_coordenada_X.val(),
										coordenada_Y: el_coordenada_Y.val()
									}

									console.log(data)

									$http({
										method: 'POST',
										url: '/dashboard/ordenes_trabajo/'+item._id+'/item/cliente/'+idElement+'?_method=put',
										data: data
									}).then(function(res){
										console.log(res, idElement)
										$('[data-content="'+idElement+'"] .ItemPhoto').attr('style', 'background-image:url('+res.data.service.imagen_cliente[0].path+')')
										$('[data-content="'+idElement+'"] .cliente_id').html(res.data.service.cliente_id)
										$('[data-content="'+idElement+'"] .nombre_de_cliente').html(res.data.service.nombre_de_cliente)
										if (res.data.service.type_residencial === true) {
											$('[data-content="'+idElement+'"] .type_residencial').html('Residencial')
										} else {
											$('[data-content="'+idElement+'"] .type_residencial').html('No Residencial')
										}
										// location.reload()
										$('.editPosteModal').remove()
									}, function(err){
										console.log(err)
									})
								})
							}, function(err){
								console.log(err)
							})
						}

						// EDICION DE ORDENES DE TIPO CLIENTE, DETALLE REGISTRO DE NUEVO CLIENTE
						function editOrdenItemClientNew(){
							console.log('RNC')
							console.log(this)
							var idElement = this.getAttribute('data-id')
							console.log(idElement)
							$http({
								method: 'POST',
								url: '/dashboard/ordenes_trabajo/'+item._id+'/read/cliente/'+idElement
							}).then(function(res){
								console.log(res)
								var elementData = res.data.service
								var contentTemplateEditPoste = document.createElement('div')
								contentTemplateEditPoste.setAttribute('class', 'editPosteModal')
								var template = `<form action="" class="editPoste editClientElement">
																	<div class="editPoste__containner">
																		<div class="editPoste__containner--title">
																			<h3>REGISTRO DE CLIENTE</h3>
																		</div>
																		<div class="editPoste__containner--content">
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>Caracteristicas</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>ID Cliente</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.cliente_id}" id="data_cliente_id"/>
																					</div>
																				</div>
																			</div>
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>DIRECCIÓN</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Distrito</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" value="${elementData.distrito}" class="inputs-label" id="data_distrito" value=""/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Nombre de Vía</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.codigo_via}" id="data_codigo_via"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Número de Puerta</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.numero_puerta}" id="data_numero_puerta"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Puerta Interior</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.numero_interior}" id="data_numero_interior"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Urbanización</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" value="${elementData.urbanizacion}" class="inputs-label" id="data_urbanizacion"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Manzana</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.manzana}" id="data_manzana"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Lote</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.lote}" id="data_lote"/>
																					</div>
																				</div>
																			</div>
																			<div class="characteristic">
																				<div class="characteristic__title">
																					<h4>Datos</h4>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Nombre de Cliente</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<input type="text" class="inputs-label" value="${elementData.nombre_de_cliente}" id="data_nombre_de_cliente"/>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Tipo de Residencial</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<div class="selectBox">
																							<select class="selectBox__select" name="" id="data_type_residencial">
																								<option id="residencial_true" value="true">Si</option>
																								<option id="residencial_false" value="false">No</option>
																							</select>
																						</div>
																					</div>
																				</div>
																				<div class="characteristic__item">
																					<div class="characteristic__item--left">
																						<p><strong>Maximetro BT</strong></p>
																					</div>
																					<div class="characteristic__item--right">
																						<div class="selectBox">
																							<select class="selectBox__select" name="" id="data_is_maximetro_bt">
																								<option id="maximetro_true" value="true">Si</option>
																								<option id="maximetro_false" value="false">No</option>
																							</select>
																						</div>
																					</div>
																				</div>
																			</div>
																			<div class="ubication">
																				<div class="ubication__title">
																					<h4>Ubicación</h4>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication_item--map" style="width:100%;height:200px" id="ItemMapsEdits"></div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada X</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" value="${elementData.coordenada_X}" id="element_coordenada_X"/>
																					</div>
																				</div>
																				<div class="ubication__item">
																					<div class="ubication__item--left">
																						<p><strong>Coordenada Y</strong></p>
																					</div>
																					<div class="ubication__item--right">
																						<input type="text" class="inputs-label" value="${elementData.coordenada_Y}" id="element_coordenada_Y"/>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div class="editPoste__containner--buttons">
																			<div class="btn"><button class="editClienteCancel">CANCELAR</button></div>
																			<div class="btn"><button class="editClienteSend"type="submit">GUARDAR</button></div>
																		</div>
																	</div>
																</form>`

								contentTemplateEditPoste.innerHTML = template
								$('.OrderWork').append(contentTemplateEditPoste)
								// $('#mapsEdit').css('background-image', 'url('+url+')')

								var btnCloseEditPoste = $('.editClienteCancel')
								// btnCloseEditPoste.on('click', closeEditPoste)

								// console.log($('#type_service'))
								var option1 = $('#data_type_residencial option')
								console.log($(option1)[0].value)

								if (elementData.type_residencial === true) {
									$('#residencial_true').attr('selected', 'selected')
								} else {
									$('#residencial_false').attr('selected', 'selected')
								}

								for (var i = 0; i < $(option1).length; i++) {
								}

								var option2 = $('#data_is_maximetro_bt option')
								console.log(option2[0].value)

								if (elementData.is_maximetro_bt === true) {
									$('#maximetro_true').attr('selected', 'selected')
								} else {
									$('#maximetro_false').attr('selected', 'selected')
								}

								var ItemMapEdit = new GMaps({
								  div: '#ItemMapsEdits',
								  zoom: 11,
								  lat: -12.043333,
								  lng: -77.028333,
								  click: function(e) {
								    console.log(e)
								    $('#element_coordenada_X').val(e.latLng.lat())
								    $('#element_coordenada_Y').val(e.latLng.lng())
								    ItemMapEdit.removeMarkers()
								    ItemMapEdit.addMarker({
								      lat: e.latLng.lat(),
								      lng: e.latLng.lng(),
								      title: 'Lima',
								    })
								  }
								})

								ItemMapEdit.addMarker({
								  lat: elementData.coordenada_X,
								  lng: elementData.coordenada_Y,
								});

								btnCloseEditPoste.on('click',function(ev){
									ev.preventDefault()
									$('.editPosteModal').remove()
								})

								$('.editClientElement').submit(function(ev){
									ev.preventDefault()
									console.log('bvbnmmn')
									var el_cliente_distrito = $('#data_distrito')
									var el_cliente_id = $('#data_cliente_id')
									var el_codigo_via = $('#data_codigo_via')
									var el_numero_puerta = $('#data_numero_puerta')
									var el_numero_interior = $('#data_numero_interior')
									var el_manzana = $('#data_manzana')
									var el_lote = $('#data_lote')
									var el_coordenada_X = $('#element_coordenada_X')
									var el_coordenada_Y = $('#element_coordenada_Y')
									var nombre_de_cliente = $('#data_nombre_de_cliente')
									var type_residencial = $('#data_type_residencial')
									var is_maximetro_bt = $('#data_is_maximetro_bt')
									var el_urbanizacion = $('#data_urbanizacion')

									console.log(el_codigo_via);

									var data = {
										urbanizacion: el_urbanizacion.val(),
										distrito: el_cliente_distrito.val(),
										cliente_id: el_cliente_id.val(),
										codigo_via: el_codigo_via.val(),
										numero_puerta: el_numero_puerta.val(),
										numero_interior:el_numero_interior.val(),
										manzana:el_manzana.val(),
										lote:el_lote.val(),
										nombre_de_cliente: nombre_de_cliente.val(),
										coordenada_X: el_coordenada_X.val(),
										coordenada_Y: el_coordenada_Y.val(),
										type_residencial: type_residencial.val(),
										is_maximetro_bt: is_maximetro_bt.val()
									}

									console.log(data)

									$http({
										method: 'POST',
										url: '/dashboard/ordenes_trabajo/'+item._id+'/item/cliente/'+idElement+'?_method=put',
										data: data
									}).then(function(res){
										console.log(res)
										$('[data-content="'+idElement+'"] .image').attr('src', res.data.service.imagen_cliente[0].path)
										$('[data-content="'+idElement+'"] .cliente_id').html(res.data.service.cliente_id)
										$('[data-content="'+idElement+'"] .nombre_de_cliente').html(res.data.service.nombre_de_cliente)
										if (res.data.service.type_residencial === true) {
											$('[data-content="'+idElement+'"] .type_residencial').html('Residencial')
										} else {
											$('[data-content="'+idElement+'"] .type_residencial').html('No Residencial')
										}
										// location.reload()
										$('.editPosteModal').remove()
									}, function(err){
										console.log(err)
									})
								})
							}, function(err){
								console.log(err)
							})
						}

						// BUSCAR ELEMENTO POR NUMERO IDETIFICADOR Y AGREGAR A ORDEN DE TRABAJO
						function addSearchElementOrder(){
							var cliente_id = $('#codigoCliente')
							if (cliente_id.val() !== '') {
								console.log('XD')
								var data = {
									code_service: cliente_id.val()
								}
								// SE OBTIENE DATOS LOS DATOS DEL SERVICIO BUSCADO
								$http({
									method: 'POST',
									url: '/dashboard/ordenes_trabajo/cliente',
									data: data,
								}).then(function(res){
									console.log(res)
									if (res.data.status !== 'not_found') {
										cliente_id.val('')
										var elementNew = res.data.cliente

										// CREACION DE NUEVO CLIENTE
										$http({
											method: 'POST',
											url: '/dashboard/ordenes_trabajo/'+item._id+'/add-item/cliente'
										}).then(function(res){
											console.log(res)

											var data = {
												cliente_id:elementNew.cliente_id,
												numero_cliente:elementNew.numero_cliente,
												codigo_via:elementNew.codigo_via,
												numero_puerta:elementNew.numero_puerta,
												numero_interior:elementNew.numero_interior,
												codigo_localidad:elementNew.codigo_localidad,
												manzana:elementNew.manzana,
												lote:elementNew.lote,
												nombre_de_cliente:elementNew.nombre_de_cliente,
												type_residencial:elementNew.type_residencial,
												is_maximetro_bt:elementNew.is_maximetro_bt,
												suministro_derecha:elementNew.suministro_derecha,
												suministro_izquierda:elementNew.suministro_izquierda,
												medidor_derecha:elementNew.medidor_derecha,
												medidor_izquierda:elementNew.medidor_izquierda,
												numero_poste_cercano:elementNew.numero_poste_cercano,
												type_conexion:elementNew.type_conexion,
												type_acometida:elementNew.type_acometida,
												type_cable_acometida:elementNew.type_cable_acometida,
												calibre_cable_acometida:elementNew.calibre_cable_acometida,
												calibre_cable_matriz:elementNew.calibre_cable_matriz,
												observaciones:elementNew.observaciones,
												fecha_ejecucion:elementNew.fecha_ejecucion,
												coordenada_X:elementNew.coordenada_X,
												coordenada_Y:elementNew.coordenada_Y,
											}

											// EDICION DE CLIENTE NUEVO CREADO RECIENTEMENTE
											$http({
												method: 'POST',
												url: '/dashboard/ordenes_trabajo/'+item._id+'/item/cliente/'+res.data.service._id+'?_method=put',
												data: data
											}).then(function(res){
												console.log(res)
												var type_of_residencial
												if (res.data.service.type_residencial === true) {
													type_of_residencial = 'Residencial'
												} else {	
													type_of_residencial = 'No Residencial'
												}

												var box_Content = $('#contentItems')
												var newDiv = document.createElement('div')
												newDiv.setAttribute('class', 'EditItem')
												newDiv.setAttribute('data-content', res.data.service._id)
												var template = `<div class="EditItem__image" >
																					<div class="ItemPhoto" style="background-image:url(${res.data.service.imagen_cliente[0].path})">
																					</div>
																					<div class="titleHead">
																						<p id="cliente_id">${res.data.service.cliente_id}</p>
																					</div>
																				</div>
																				<div class="EditItem__text">
																					<p id="nombre_de_cliente"><strong>${res.data.service.nombre_de_cliente}</strong></p>
																					<p id="type_residencial">${type_of_residencial}</p>
																				</div>
																				<div class="EditItem__delete">
																					<p class="DeleteCliente" data-id="${res.data.service._id}">x</p>
																				</div>`
												newDiv.innerHTML = template
												box_Content.append(newDiv)
												// $('.DeleteCliente').on('click', deleteItemCliente)
											}, function(err){
												console.log(err)
											})		

										}, function(err){
											console.log(err)
										})
									} else {
										console.log('No se encontraron los datos nesarios')
									}

								}, function(err){
									console.log(err)
								})
							} else {
								console.log('ingrese codigo de poste')
							}
						}

						// RELLENADO DE INFORMACION DE TIPO DE DETALLE DE SERVICIO
						var order_type_service
						if (item.detalle_servicio === 'Verificar Direccion de Cliente') {
							item.detalle_servicio = 'detalle_servicio_VC'
						} else if (item.detalle_servicio === 'Registro de Direccion') {
							item.detalle_servicio = 'detalle_servicio_RD'
						} else {
							item.detalle_servicio = 'detalle_servicio_RCN'
						}

						for (var i = 0; i < $('#detail_service option').length; i++) {
							var option = $('#detail_service option')[i]
							console.log('Esto es un form :D', item.detalle_servicio, option.value)
							if (option.value === item.detalle_servicio) {
								console.log('los datos estan aqui!',option.value, item.detalle_servicio)
								option.setAttribute('selected', 'selected')
							}
						}

						for (var i = 0; i < $('#priority option').length; i++) {
							var option = $('#priority option')[i]
							if ($(option)[0].value === item.tipo_urgencia) {
								option.setAttribute('selected', 'selected')
							}
						}

						if (item.public === true) {
							document.getElementById('true').checked = true
						} else {
							document.getElementById('false').checked = true
						}

						var sendEditOrder = $('.EditPoste__containner')

						sendEditOrder.submit(function(ev){
							var cod_contr = $('#codigo_contratista')
							var cod_super = $('#codigo_supervisor')
							var urgency = $('#priority')
							var direccion = $('#direccion')
							var descripcion = $('#descripcion')
							var fecha_visita_esperada = $('#date')
							var public = $("[name='public']:checked")

							ev.preventDefault()
							var data = {
								codigo_supervisor: cod_super.val(),
								codigo_contratista: cod_contr.val(),
								tipo_urgencia: urgency.val(),
								direccion: direccion.val(),
								descripcion: descripcion.val(),
								fecha_visita_esperada: fecha_visita_esperada.val(),
								public:public.val()
							}

							console.log(data)

							$http({
								method: 'POST',
								url:'/dashboard/ordenes_trabajo/'+order+'?_method=put',
								data: data
							}).then(function(res){
								console.log(res)
								location.reload()
							}, function(err){
								console.log(err)
							})
						})

						$('#closeEditOrder').on('click', function(ev){
							ev.preventDefault()
							$('.EditPoste').remove()
						})

						var mapEdit = new GMaps({
						  div: '#mapEdit',
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y
						})
						// mapEdit.markers
						mapEdit.addMarker({
						  lat: item.coordenada_X,
						  lng: item.coordenada_Y,
						});
					},function(err){
						Loader.delete('.EditPoste', 'LoaderCliente')
						console.log(err)
					})
				}

				var url = GMaps.staticMapURL({
				  size: [800, 400],
				  lat: item.coordenada_X,
				  lng: item.coordenada_Y,
				  markers: [
				    {lat: item.coordenada_X, lng: item.coordenada_Y}
				  ]
				});

				$('#mapStatic').css('background-image', 'url('+url+')')

				if (item.tipo_urgencia === 'tipo_urgencia_M') {
					$('#urgency').html('Media')
				} else if(item.tipo_urgencia === 'tipo_urgencia_A'){
					$('#urgency').html('Alta')
				} else {
					$('#urgency').html('Baja')						
				}

				if (item.public === true ) {
					$('#privacity').html('Público')
				} else {
					$('#privacity').html('No Público')						
				}
				
				$('.back').on('click', function(){
					$location.path('/dashboard')
					if (!$scope.$$phase) $scope.$apply()
				})
			}

			// INICIO DE SLIDES
			function initSlides(){
				$('#slides').css('width', (item.elementos.length*260)+'px')

				var btnNext = $('#btnNext')
				var btnPrev = $('#btnPrev')

				btnNext.on('click', nextSlide)
				btnPrev.on('click', prevSlide)
			}

			// NEXT SLIDES
			function nextSlide(){
				// console.log('XD')
				var margin = $('#slides').css('margin-left')
				var px = 'px'
				if (margin.indexOf(px) != -1) {
					margin = margin.replace('px','')
					margin = parseInt(margin)
				}

				var maxMargin = ($('.Slider__items--item').length-1)*-260
				// console.log(margin,maxMargin)

				if (margin > maxMargin) {
					// console.log(margin)
					var newMargin = margin - 260
					contentSlides.animate({
						marginLeft: newMargin+'px'
					}, 80)
				}
				
			}

			// PREV SLIDES
			function prevSlide(){
				var margin = $('#slides').css('margin-left')
				var px = 'px'
				if (margin.indexOf(px) != -1) {
					margin = margin.replace('px','')
					margin = parseInt(margin)
				}
				// console.log(margin)
				if (margin < 0) {
					var minMargin = margin + 260
					contentSlides.animate({
						marginLeft: minMargin
					}, 80)
				}
			}

		}
		init()
	}, function(err){
		console.log(err)
	})
}])