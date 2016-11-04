myApp.controller('userControllers', ['$scope', '$http', 'url', 'Loader', function($scope, $http, url, Loader){
	
	Loader.create('.users__list', 'ListUsers')

	$http({
		method:'GET',
		url:'/dashboard/usuarios/dynamic-filter/users-campo/todos'
	}).then(function(res){
		console.log(res)
		Loader.delete('.users__list', 'ListUsers')	

		$scope.users = []
		// Socket.connect()
		// console.log(url)
		function initMap(){

			function initialTemplateLeft(){
				for (var i = 0; i < res.data.usuarios_found.length; i++) {
					$scope.users.push(res.data.usuarios_found[i])
				}

				console.log($scope.users)
			}

			var iter = 0
			$scope.viewFilter = function(){
				$('#FilterContents').toggleClass('openViewFilter')
				if (iter === 0) {
					// console.log(i)
					$('#triangle').css('display', 'block')
					iter = 1
				} else {
					// console.log(i)
					$('#triangle').css('display', 'none')
					iter = 0
				}
			}

			$('#usuarios').on('change', seachUsers)
			$('#estado').on('change', seachUsers)

			function seachUsers(){
				$scope.users = []
				Loader.create('.users__list', 'ListUsers')
				var type_user = $('#usuarios')
				var status = $('#estado')
				// console.log('/dashboard/usuarios/dynamic-filter/'+type_user.val()+'/'+status.val())
				// console.log(type_user.val(), status.val())
				$http({
					method: 'GET',
					url: '/dashboard/usuarios/dynamic-filter/'+type_user.val()+'/'+status.val()
				}).then(function(res){
					Loader.delete('.users__list', 'ListUsers')
					// console.log(res)
					for (var i = 0; i < res.data.usuarios_found.length; i++) {
						$scope.users.push(res.data.usuarios_found[i])
					}
				}, function(err){
					console.log(err)
				})
			}

			initialTemplateLeft()

			function templateRight(){
				var contentRight = $('.users__right--mapCanvas')
				var divContainer = document.createElement('div')
				divContainer.setAttribute('class','ContentMap')
				var template = `<div class="ContentMap__btnBottom">
													<div class="ContentMap__btnBottom--containner">
														<div title="Agregar Nuevo Usuario" class="BtnPlus" id="BtnPlus"><span class="icon-icon_nuevo"></span></div>
														<ul class="BtnList" id="BtnList">
															<!-- <li><span id="Viewer">V</span></li> -->
															<li title="Usuario de Oficina" id="Officce"><span class="icon-icon_usuario_oficina"></span></li>
															<li title="Usuario de Campo" id="Countryside"><span class="icon-icon_usuario_campo"></span></li>
														</ul>
													</div>
												</div>`
				divContainer.innerHTML = template
				contentRight.append(divContainer)

				var btnPlus = $('#BtnPlus')
				// console.log(btnPlus)
				var it = 0
				btnPlus.on('click', function(){
					var btnList = $('#BtnList')
					btnList.animate({
						opacity: 'toggle',
						height: 'toggle'
					})
				})

				var btnViewer = $('#Viewer')
				var btnOffice = $('#Officce')
				var btnCountryside = $('#Countryside')
				// console.log(btnViewer)
				btnViewer.on('click', NewUsuarioViewer)
				btnOffice.on('click', NewUsuarioOffice)
				btnCountryside.on('click', NewUsuarioCountryside)
			}

			$scope.deleteUser = function(id){

				$http({
					method: 'POST',
					url: '/dashboard/usuarios/delete/'+id+'?_method=delete'
				}).then(function(res){
					console.log(res)
					$('[data-containneruser="'+id+'"]').remove()
				}, function(err){
					console.log(err)
				})

			}

			$scope.viewBtn = function(id){
				// console.log(id)
				var btn = $('[data-iduser="'+id+'"] .Item__dropdown .Item__dropdown--content')
				// $('[data-iduser="'+id+'"] .Item__dropdown .Item__dropdown--content').css('display', 'block')
				if (btn.css('display') === 'none') {
					btn.css('display', 'block')
				} else {
					btn.css('display', 'none')
				}
			}

			templateRight()

			function NewUsuarioViewer(){
				var modalContent = document.createElement('div')
				modalContent.setAttribute('class', 'ModalContainner')
				var dadContent = $('.users')
				// modalContent.setAttribute = 'ModalContainner'
				var template = `<div class="ModalContainner__Box">
													<div class="ModalContainner__Box--title">
														<h2>NUEVO USUARIO VIEWER</h2>
													</div>
													<div class="ModalContainner__box--form">
														<form action="" class="FormUser">
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Nombres</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Apellido</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="last_name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">DNI</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="id" type="number" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Email</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="email" type="email" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Usuario</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="usernam" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Nombres</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="nombres" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Verificar Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input id="repeat_password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<button>CANCELAR</button>
																</div>
																<div class="FormUser__option--right">
																	<button type="submit">REGISTRAR</button>
																</div>
															</div>
														</form>
													</div>
												</div>`
				modalContent.innerHTML = template
				dadContent.append(modalContent)

				var NewViewerSend = $('.FormUser')

				NewViewerSend.submit(function(ev){
					ev.preventDefault()
					// console.log('XD')
					var name = $('#name')
					var last_name = $('#last_name')
					var dni = $('#dni')
					var email = $('#email')
					var username = $('#username')
					var password = $('#password')
					var repeat_password = $('#repeat_password')
					if (password.val() === repeat_password.val()) {
						// data = {
						// 	password: password.val();
						// 	names:
						// 	last_names:
						// 	dni:
						// 	email:
						// 	username:
						// }

						$.ajax({
							method: 'POST',
							data: data,
							url: '/dashboard/usuarios/viewer/register',
							success: function(res){
								console.log(res)
							},
							error: function(err){
								console.log(err)
							}
						})
					}
				})
			}

			function NewUsuarioOffice(){
				var modalContent = document.createElement('div')
				modalContent.setAttribute('class', 'ModalContainner')
				var dadContent = $('.users')
				// modalContent.setAttribute = 'ModalContainner'
				var template = `<div class="ModalContainner__box">
													<div class="ModalContainner__box--title">
														<h2>NUEVO USUARIO DE OFICINA</h2>
													</div>
													<div class="ModalContainner__box--form">
														<form action="" class="FormUser">
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Nombres</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Apellido</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="last_name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">DNI</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="dni" type="number" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Email</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="email" type="email" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Usuario</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="username" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Verificar Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="repeat_password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__btns">
																<div class="FormUser__btns--cancel">
																	<button id="CancelAddUser">CANCELAR</button>
																</div>
																<div class="FormUser__btns--send">
																	<button type="submit">REGISTRAR</button>
																</div>
															</div>
														</form>
													</div>
												</div>`
				modalContent.innerHTML = template
				dadContent.append(modalContent)

				var NewViewerSend = $('.FormUser')

				$('#dni').on('keypress',validar)

				NewViewerSend.submit(function(ev){
					ev.preventDefault()
					// console.log('XD')
					var name = $('#name')
					var last_name = $('#last_name')
					var dni = $('#dni')
					var email = $('#email')
					var username = $('#username')
					var password = $('#password')
					var repeat_password = $('#repeat_password')
					if (password.val() === repeat_password.val()) {
						var data = {
							password: password.val(),
							names: name.val(),
							last_names: last_name.val(),
							dni: dni.val(),
							email: email.val(),
							username: username.val(),
							re_password: repeat_password.val()
						}
						console.log(data)

						$.ajax({
							method: 'POST',
							url: '/dashboard/usuarios/officers/register',
							data: data,
							success: function(res){
								console.log(res)
								var contentModal = $('.ModalContainner')
								contentModal.remove()
							},
							error: function(err){
								console.log(err)
							}
						})

					} else {
						console.log('las contraseñas tienen que ser iguales')
					}
				})

				var btnCloseModal = $('#CancelAddUser')
				btnCloseModal.on('click', function(){
					var contentModal = $('.ModalContainner')
					contentModal.remove()
				})
			}

			function NewUsuarioCountryside(){
				var modalContent = document.createElement('div')
				modalContent.setAttribute('class', 'ModalContainner')
				var dadContent = $('.users')
				// modalContent.setAttribute = 'ModalContainner'
				var template = `<div class="ModalContainner__box">
													<div class="ModalContainner__box--title">
														<h2>NUEVO USUARIO DE CAMPO</h2>
													</div>
													<div class="ModalContainner__box--form">
														<form action="" class="FormUser">
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Nombres</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Apellido</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="last_name" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">DNI</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="dni" type="number" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Email</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="email" type="email" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Contratista</label>
																</div>
																<div class="FormUser__option--right select" id="contratistas">
																	<div class="selectBox">
																		<select class="selectBox__select" name="" required id="contratista"></select>
																	</div>
																	<span id="addContratista">+</span>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Usuario</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="username" type="text" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__option">
																<div class="FormUser__option--left">
																	<label for="">Verificar Contraseña</label>
																</div>
																<div class="FormUser__option--right">
																	<input class="inputs-label" id="repeat_password" type="password" required/>
																</div>
															</div>
															<div class="FormUser__btns">
																<div class="FormUser__btns--cancel">
																	<button id="CancelAddUser">CANCELAR</button>
																</div>
																<div class="FormUser__btns--send">
																	<button type="submit">REGISTRAR</button>
																</div>
															</div>
														</form>
													</div>
												</div>`
				modalContent.innerHTML = template
				dadContent.append(modalContent)

				// var contratistas = []

				$http({
					method:'GET',
					url: '/dashboard/usuarios/users-campo/new'
				}).then(function(res){
					console.log(res)
					// $scope.users.push(res.data.user)
					var contentList = $('#contratista')
					for (var i = 0; i < res.data.contratistas.length; i++) {
						console.log('XD')
						// contratistas.push(res.data.contratistas[i])
						var contratista = document.createElement('option')
						contratista.setAttribute('value', res.data.contratistas[i]._id)
						contratista.innerHTML=res.data.contratistas[i].name
						// console.log(contratista)
						contentList.append(contratista)
					}
					// console.log(contratistas)
				},function(err){
					console.log(err)
				})

				$('#addContratista').on('click', addContentContratista)

				var NewViewerSend = $('.FormUser')
				$('#dni').on('keypress',validar)

				NewViewerSend.submit(function(ev){
					ev.preventDefault()
					// console.log('XD')
					var name = $('#name')
					var last_name = $('#last_name')
					var dni = $('#dni')
					var email = $('#email')
					var contratista = $('#contratista')
					var username = $('#username')
					var password = $('#password')
					var repeat_password = $('#repeat_password')
					if (password.val() === repeat_password.val()) {
						var data = {
							last_names: last_name.val(),
							dni: dni.val(),
							password: password.val(),
							names: name.val(),
							email: email.val(),
							contratista: contratista.val(),
							username: username.val(),
							re_password: repeat_password.val()						
						}
						console.log(data)

						$.ajax({
							method: 'POST',
							url: '/dashboard/usuarios/users-campo/register',
							data: data,
							success: function(res){
								console.log(res)
								var contentModal = $('.ModalContainner')
								contentModal.remove()
							},
							error: function(err){
								console.log(err)
							}
						})

					} else {
						console.log('las contraseñas tienen que ser iguales')
					}
				})

				var btnCloseModal = $('#CancelAddUser')
				btnCloseModal.on('click', function(){
					var contentModal = $('.ModalContainner')
					contentModal.remove()
				})
			}

			function addContentContratista(){
				console.log('XwertD')
				if (document.getElementById('newUserContratist') === null) {
					var div = document.createElement('div')
					div.setAttribute('class', 'newUserContratist')
					div.setAttribute('id', 'newUserContratist')
					var template = `<input class="inputs-label" id="newInfoContratista" type="text" />
													<div class="button" id="addNewInfoContratista">Agregar</div>`

					div.innerHTML = template
					$('#contratistas').append(div)
					$('#addNewInfoContratista').on('click', addNewContratista)
				}
			}

			function addNewContratista(){
				var search = $('#newInfoContratista')
				$http({
					method: 'POST',
					url: '/dashboard/usuarios/contratista-name/add',
					data: {contratista:search.val()}
				}).then(function(res){
					console.log(res)
					var contentList = $('#contratista')
					var contratista = document.createElement('option')
					contratista.setAttribute('value', res.data.contratista.name)
					contratista.setAttribute('selected', 'selected')
					contratista.innerHTML = res.data.contratista.name
					// console.log(contratista)
					contentList.append(contratista)
					$('.newUserContratist').remove()
				}, function(err){
					console.log(err)
				})				
			}

			$scope.actionUser = function(id){
				var typeViewRight = $('#vista')
				if (typeViewRight.val() === 'perfil') {
					perfil(id)
				} else if(typeViewRight.val() === 'traking'){
					tracking(id)
				} else {
					perfil()
				}
			}

			function perfil(idUser){
				console.log(idUser)
				console.log('perfil')
				$('.users__right--mapCanvas').html('')

				var divInfoUser = document.createElement('div')
				divInfoUser.setAttribute('class', 'infoUser')
				$('.users__right--mapCanvas').append(divInfoUser)
				Loader.create('.infoUser', 'dataUser')
				$http({
					method: 'GET',
					url:'/dashboard/usuarios/' + idUser
				}).then(function(res){
					console.log(res)
					Loader.delete('.infoUser', 'dataUser')
					templateRight()
					var user = res.data.user_found
			
					var templateInfo = `<div class="infoUser__containner">
																<div class="infoUser__containner--data">
																	<div class="headDetail">
																		<figure class="headDetail__image">
																			<img src="${user.photo.path}" alt="${user.full_name}" />
																		</figure>
																		<div class="headDetail__text">
																			<h3>${user.full_name}</h3>
																			<p>${user.contratista}</p>
																		</div>
																	</div>
																</div>
																<div class="infoUser__containner--detailUser">
																	<div class="DataUser">
																		<div class="DataUser__option">
																			<div class="DataUser__option--left">
																				<p>Nombre de Usuario</p>
																			</div>
																			<div class="DataUser__option--right">
																				<p>@${user.username}</p>
																			</div>
																		</div>
																		<div class="DataUser__option">
																			<div class="DataUser__option--left">
																				<p>Contratista</p>
																			</div>
																			<div class="DataUser__option--right">
																				<p>${user.contratista}</p>
																			</div>
																		</div>
																		<div class="DataUser__option">
																			<div class="DataUser__option--left">
																				<p>DNI</p>
																			</div>
																			<div class="DataUser__option--right">
																				<p>${user.dni}</p>
																			</div>
																		</div>
																		<div class="DataUser__option">
																			<div class="DataUser__option--left">
																				<p>Email</p>
																			</div>
																			<div class="DataUser__option--right">
																				<p>${user.email}</p>
																			</div>
																		</div>
																		<div class="DataUser__option">
																			<div class="DataUser__option--btn">
																				<button data-id="${user._id}" id="EditInfoUser">EDITAR</button>
																			</div>
																		</div>
																	</div>
																</div>
															</div>`
					$('.infoUser').html(templateInfo)

					$('#EditInfoUser').on('click', editUser)

				}, function(err){
					console.log(err)
				})
			}

			function editUser(){
				console.log(this)
				var id = this.getAttribute('data-id')
				// console.log('ESTE ES EL ID Q DEBE DE CORRER'+id)
				var divEditInfoUser = document.createElement('div')
				divEditInfoUser.setAttribute('class', 'editInfoUser')
				$('.users__right--mapCanvas').append(divEditInfoUser)
				console.log('XD')
				Loader.create('.editInfoUser', 'editDataUser')
				$http({
					method: 'GET',
					url: '/dashboard/usuarios/' + id
				}).then(function(res){
					console.log(res)
					Loader.delete('.editInfoUser', 'editDataUser')
					var user = res.data.user_found
					var templateInfo = `<div class="editInfoUser__containner">
																<div class="editInfoUser__containner--data">
																	<div class="headDetail">
																		<figure class="headDetail__image">
																			<img src="${user.photo.path}" alt="${user.full_name}" />
																		</figure>
																	</div>
																</div>
																<div class="editInfoUser__containner--detailUser">
																	<form action="" class="FormEditUser">
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Nombres</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<input class="inputs-label" value="${user.names}" id="name" type="text" required/>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Apellido</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<input class="inputs-label" value="${user.last_names}" id="last_name" type="text" required/>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Contratista</label>
																			</div>
																			<div class="FormEditUser__option--right select" id="contratistas">
																				<div class="selectBox contentSelect">
																					<select class="selectBox__select" name="" required id="contratista"></select>
																				</div>
																				<span id="addContratista" class=" icon-icon_agregar_poste"></span>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Nombre de Usuario</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<input class="inputs-label" value="${user.username}" id="username" type="text" required/>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Contraseña</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<div class="editPassword" data-id="${user._id}" id="btnEditPassword">Cambiar contraseña</div>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">DNI</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<input class="inputs-label" value="${user.dni}" id="dni" type="number" required/>
																			</div>
																		</div>
																		<div class="FormEditUser__option">
																			<div class="FormEditUser__option--left">
																				<label for="">Email</label>
																			</div>
																			<div class="FormEditUser__option--right">
																				<input class="inputs-label" value="${user.email}" id="email" type="email" required/>
																			</div>
																		</div>
																		<div class="FormEditUser__btns">
																			<div class="FormEditUser__btns--btnCancel">
																				<button id="CancelEditUser">CANCELAR</button>
																			</div>
																			<div class="FormEditUser__btns--btnSend">
																				<button type="submit">GUARDAR</button>
																			</div>
																		</div>
																	</form>
																</div>
															</div>`

					$('.editInfoUser').html(templateInfo)

					$http({
						method:'GET',
						url: '/dashboard/usuarios/users-campo/new'
					}).then(function(res){
						console.log(res)
						// $scope.users.push(res.data.user)
						var contentList = $('#contratista')
						for (var i = 0; i < res.data.contratistas.length; i++) {
							// contratistas.push(res.data.contratistas[i])
							var contratista = document.createElement('option')
							contratista.setAttribute('value', res.data.contratistas[i]._id)
							contratista.innerHTML=res.data.contratistas[i].name
							// console.log(contratista)
							contentList.append(contratista)
						}
						// console.log(contratistas)
					},function(err){
						console.log(err)
					})

					$('#addContratista').on('click', addContentContratista)

					var NewDataSend = $('.FormEditUser')
					$('#dni').on('keypress',validar)

					NewDataSend.submit(function(ev){
						// Loader.create('')
						ev.preventDefault()
						// console.log('XD')
						var name = $('#name')
						var last_name = $('#last_name')
						var dni = $('#dni')
						var email = $('#email')
						var contratista = $('#contratista')
						var username = $('#username')

						var data = {
							last_names: last_name.val(),
							dni: dni.val(),
							names: name.val(),
							email: email.val(),
							contratista: contratista.val(),					
						}
						console.log(data)

						$http({
							method: 'POST',
							url: '/dashboard/usuarios/edit/'+id+'?_method=put',
							data: data
						}).then(function(res){
							console.log(res)
							var contentModal = $('.ModalContainner')
							contentModal.remove()
							location.reload()
						}, function(err){
							console.log(err)
						})
					})

					$('#btnEditPassword').on('click', function(){
						var id = this.getAttribute('data-id')
						var LightBox = document.createElement('div')
						LightBox.setAttribute('class','ChangePass')

						var template = `<div class="ChangePass__containner">
															<div class="ChangePass__containner--title">
																<h3>CAMBIO DE CONTRASEÑA</h3>
															</div>
															<div class="ChangePass__containner--inputs">
																<div class="inputs">
																	<label for="inputs__newPass">Contraseña Nueva</label>
																	<input id="inputs__newPass" class="inputs-label" type="text" />
																</div>
																<div class="inputs">
																	<label for="inputs__confirmated">Confirmar Nueva Contraseña</label>
																	<input id="inputs__confirmated" class="inputs-label" type="text" />
																</div>
															</div>
															<div class="ChangePass__containner--btns">
																<button class="cancel" id="cancelChosePass">Cancelar</button>
																<button class="chosePass" id="ChangePass" data-id="${id}" >Aceptar</button>
															</div>
														</div>`
						LightBox.innerHTML = template

						$('.container').append(LightBox)

						$('#cancelChosePass').on('click', function(){
							$('.ChangePass').remove()
						})

						$('#ChangePass').on('click', function(){
							var id = this.getAttribute('data-id')
							var new_pass = $('#inputs__newPass')
							var confirmated_pass = $('#inputs__confirmated')

							if (new_pass.val() === confirmated_pass.val()) {
								var data = {
									password: confirmated_pass.val()
								}
								console.log(data)

								$http({
									method: 'POST',
									url: '/dashboard/usuarios/edit/'+id+'?_method=put',
									data: data
								}).then(function(res){
									console.log(res)
									$('.ChangePass').remove()
								}, function(err){
									console.log(err)
								})
							} else {
								console.log('No son los mismos')
								if (document.getElementById('ErrorPass') === null) {
									var textMessage = document.createElement('div')
									textMessage.setAttribute('class', 'ErrorPass')
									textMessage.setAttribute('id', 'ErrorPass')
									var template = `<div class="ErrorPass__text">
																		<p>El valor de los campos no coinciden!</p>
																	</div>`
									textMessage.innerHTML = template
									$('.ChangePass__containner').append(textMessage)
								}
							}
						})
					})

					var btnCloseModal = $('#CancelEditUser')
					btnCloseModal.on('click', function(ev){
						ev.preventDefault()
						var contentModal = $('.editInfoUser')
						contentModal.remove()
					})
				}, function(err){
					console.log(err)
				})
			}

			function tracking(idConnect){
				$('.ContentMap__box').append(map)

				map = new GMaps({
					div: '#map',
					zoom: 10,
					lat: -12.043333,
					lng: -77.028333,
					click: function(e){
						console.log(e)
					}
				})
				Loader.create('.users__right--mapCanvas', 'TrackingUserData')
				var socket = io('/tracking-io')



			  socket.emit('TrackRoom', idConnect)
			  
				$('.ContentMap__box').html('')

				// var map = document.createElement('div')
				// map.setAttribute('class', 'mapUser')
				// map.setAttribute('id', 'mapUser')
				// map.style.width = '100%'
				// map.style.height = '100%'
				// map.style.position = 'absolute'


				$http({
					method: 'GET',
					url:'/dashboard/usuarios/tracking/' + idConnect + '/draw'
				}).then(function(res){
					Loader.delete('.users__right--mapCanvas', 'TrackingUserData')
					console.log(res)
					templateRight()

					var path = []

					var infoTracking = document.createElement('div')
					infoTracking.setAttribute('class', 'infoTracking')

					var template = `<div class="infoTracking__containner">
														<div class="infoTracking__containner--title">
															<h2><span>°</span> INFORMACION DE USUARIO</h2>
														</div>
														<div id="listInfoCoord" class="infoTracking__containner--content">
														</div>
													</div>`

					infoTracking.innerHTML = template
					$('.users__right--mapCanvas').append(infoTracking)

					for(var g = 0; g <= res.data.tracking_list.track_info.length - 1; g++) {
						var el_coord =  res.data.tracking_list.track_info[g]

						var containnerCoordds = $('#listInfoCoord')

						var coord = document.createElement('div')
						coord.setAttribute('class', 'Item')
						var template = `<div class="date">${el_coord.date}</div>
														<div class="coord-X">X: ${el_coord.coordX}</div>
														<div class="coord-Y">Y: ${el_coord.coordY}</div>`

						coord.innerHTML = template
						$('#listInfoCoord').prepend(coord)
						
						var arr_item = [Number(el_coord.coordX), Number(el_coord.coordY), el_coord.date]

						path.push(arr_item)
					}

					console.log('EPIC ARRAY')
					console.log(path)

					map.drawPolyline({
						path: path,
						strokeColor: '#22b573',
						strokeOpacity: 0.6,
						strokeWeight: 6
					});            

					var coordPathStartX = path[0][0]
					var coordPathStartY = path[0][1]

					// Marcador de la primera posicion
					map.addMarker({
					  lat: coordPathStartX,
					  lng: coordPathStartY,
					  title: 'Inicio',
					  click: function(e) {
					     
					   console.log('You clicked in this marker')
					   console.log(e)
					   
					  },
					    icon: '../../../../images/tracking/41. icon_tracking_partida.png'
					})


					var coordPathX = path[path.length - 1][0]
					var coordPathY = path[path.length - 1][1]

					// Definiendo tipo de servicio
					var template_tarjeta = ''
					var title = ''
					var image = ''
					
					title=res.data.user_info.full_name
					image = '../../../../images/tracking/icon_tracking_user_inactive2x.png';
					template_tarjeta = `<div style="width:350px">
																<div style="width:100%;padding:.5em .5em .5em 50px;position:relative;display:flex;justify-content:center;align-items:center;box-sizing:border-box;height:50px;background-color:#f5f5f5">
																	<div style="background-image:url(${res.data.user_info.photo.path});background-position:center;background-repeat:no-repeat;background-size:cover;width: 40px;height:40px;position:absolute;border-radius:50%;top: 5px;left:5px"></div>
																	<p style="font-family:'Avenir Bold';color:#555e61">${res.data.user_info.full_name}</p>
																</div>
																<div style="padding:5px;display:flex;justify-content:space-between">
																	<div style="width:50%">
																		<p style="color: #555e61;font-family:'Avenir Bold'">Contratista</p>
																		<p style="font-family:'Avenir Lighter';color:rgba(158,169, 175,1)">${res.data.user_info.contratista}</p>
																	</div>
																	<div style="width:50%">
																		<p style="color: #555e61;font-family:'Avenir Bold'">Empresa</p>
																		<p style="font-family: 'Avenir Lighter';color:rgba(158,169, 175,1)">${res.data.user_info.empresa_admin}</p>
																	</div>
																</div>
															</div>`

					 // Marcador de la ultima posicion
					map.addMarker({
						lat: coordPathX,
						lng: coordPathY,
						title: 'Ultima posicion',
						click: function(e) {
					    
							console.log('You clicked in this marker')
							console.log(e)
					  
						},
					  infoWindow: {
					  	content: template_tarjeta
					  },
					  icon: image
					})

					// var infoTracking = document.createElement('div')
					// infoTracking.setAttribute('class', 'infoTracking')

					// var template = `<div class="infoTracking__containner">
					// 									<div class="infoTracking__containner--title">
					// 										<h2><span>°</span> INFORMACION DE USUARIO</h2>
					// 									</div>
					// 									<div id="listInfoCoord" class="infoTracking__containner--content">
					// 									</div>
					// 								</div>`

					// infoTracking.innerHTML = template

					$('.users__right--mapCanvas').append(infoTracking)

					socket.on('Track_one_user', function(content) {

						var containnerCoordds = $('#listInfoCoord')

						var coord = document.createElement('div')
						coord.setAttribute('class', 'Item')
						var template = `<div class="date">${content.date}</div>
														<div class="coord-X">X: ${content.coordX}</div>
														<div class="coord-Y">Y: ${content.coordY}</div>`

						coord.innerHTML = template

						$('#listInfoCoord').prepend(coord)

						// console.log('Posicion de usuarios')
						console.log(content)
						title=content.user.full_name
						image = '../../../../images/tracking/icon_user2x.png';
						// template_tarjeta = `<div>
						//                       <div>
						//                         <img src="../../../../images/avatar_defect.png" width="40">
						//                       </div>
						//                       <strong>Ericson Quispe</strong>
						//                       <p>Contratista: 57a981d33f368bc90cca2abe</p>
						//                       <p>Supervisor: 57aad49a372ffd7227c7c73f</p>
						//                       <p> Empresa: Astrum</p>
						//                       <p>X: ${content.coordX} Y: ${content.coordY}</p>
						//                   </div>`
						template_tarjeta:`<div style="width:350px">
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

						 // Marcador de la ultima posicion
						map.removeMarkers()

						map.addMarker({
						  lat: content.coordX,
						  lng: content.coordY,
						  title: 'Ultima posicion',
						  click: function(e) {      
						    console.log('You clicked in this marker')
						    console.log(e)
						  },
						  infoWindow: {
						    content: template_tarjeta
						  },
						   icon: image
						})

						  // Contruyendo coordenadas del tecking de usuario
						  
						if(path.length >= 0 && path.length <= 1) {
						  console.log('+1: ' + path.length)
						  // var el_coord =  result.tracking_list.track_info[g]    
						  var arr_item = [Number(content.coordX), Number(content.coordY)]

						  path.push(arr_item)

						} else {
						  path.push([Number(content.coordX), Number(content.coordY)])

						  console.log('dibujo')
						  // Dibujando el recorrido
						  map.drawPolyline({
						    path: path,
						    strokeColor: '#22b573',
						    strokeOpacity: 0.6,
						    strokeWeight: 6
						  }); 

						  // Reseteando 
						  path = []
						  path.push([Number(content.coordX), Number(content.coordY)])
						}
					})
				}, function(err){
					console.log(err)
				})
			}

			function validar(){
				
				//Almacenamos los valores
				nombre=$(this).val();
				
			   //Comprobamos la longitud de caracteres
				if (nombre.length<8){
					return true;
				}
				else {
					return false;
					
				}
			}
		}
		initMap()

	}, function(err){
		console.log(err)
	})
}])