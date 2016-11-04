var ffmpeg = require('fluent-ffmpeg')

var Work_Order = require('../../../../models/orden_trabajo')
var Cliente = require('../../../../models/orden_trabajo/cliente')
var Poste = require('../../../../models/orden_trabajo/poste')
var Usuarios = require('../../../../models/usuarios')

var Contratista = require('../../../../models/usuarios/contratistas/index.js')
var Empresas_Cliente = require('../../../../models/usuarios/empresas_clientes/index.js')

var Notificaciones = require('../../../../models/notificaciones/index.js')
var config  = require('../../../../config.js')

var Noti_Send_Messages = require('../../../../controllers/notificaciones/index.js').time
var FindUserData = require('../../../../controllers/find_user_data/index.js')
var users_type = config.users_access

var work_order_status = config.status

var scope_path_system = config.path_system.server

function GetDate (string_Date) {
	var RTime = new Date(string_Date)
	var month = RTime.getMonth() + 1   // 0 - 11 *
	var day = RTime.getDate()          // 1- 31  *
	var year = RTime.getFullYear()     // año   *
	var hour = RTime.getHours()		   // 0 - 23  *
	var min  = RTime.getMinutes()      // 0 - 59
	var sec =  RTime.getSeconds()

	var string_date_new = day + '/' + month + '/' + year

	return string_date_new
}

function BuildWorkOrder (item_work, cb) {

	// Obteniendo datos del supervisor
	var work_order = item_work

	var new_work_orden_model = {
		_id:  						 work_order._id,
		codigo_orden:      	         work_order.codigo_orden,
		codigo_supervisor:           work_order.codigo_supervisor,
		codigo_contratista:          work_order.codigo_contratista,
		empresa_admin: 				 work_order.empresa_admin,
		contratista: 				 work_order.contratista,
		tipo_servicio:               work_order.tipo_servicio,
		user_card_data: 			 '',
		detalle_servicio:            work_order.detalle_servicio,
		tipo_urgencia:  	         work_order.tipo_urgencia,
		cover_image: 				 work_order.cover_image,
		coordenada_X:  		         work_order.coordenada_X,
		coordenada_Y:  		         work_order.coordenada_Y,
		direccion:                   work_order.direccion,
		descripcion:                 work_order.descripcion,
		public:                      work_order.public,
		estado:                      work_order.estado,
		conclusiones:                work_order.conclusiones,
		fecha_publicado:             work_order.fecha_publicado,   // Si el campo public es false, esta data se sobresescribe por nueva fecha al cambiar por public true
		fecha_visita_esperada:       work_order.fecha_visita_esperada,
		fecha_trabajo_realizado:     work_order.fecha_trabajo_realizado,
		reprogramado_de:             work_order.reprogramado_de,
		elementos:                   work_order.elementos,  // Arreglo contenidor de elementos
		fecha_creada: 				 work_order.fecha_creada,
		progress_to_complete: 		 work_order.progress_to_complete
	}

	// Buscando datos del usuario de campo encargado de la orden en la base de datos
	FindUserData(work_order.codigo_contratista, function (err, user_found) {
		if(err) {
			return cb(err)
		} 

		// Asignando model card data
		new_work_orden_model.user_card_data = {
		 	user: {  // Datos del usuario encargado de la orden de trabajo
		 		name:  user_found.full_name,
		 		photo: user_found.photo
		 	},
		 	contratista: {
		 		name: user_found.contratista // Empresa contratista d registro
		 	},
		 	empresa: {
		 		name: user_found.empresa_admin
		 	}
		}

		// Obteniendo datos del elemento para la orden de trabajo

		/*
		var type_service_re2 
		if(work_order.tipo_servicio === 'tipo_servicio_P') {
			type_service_re2 = 'postes'

		} else if (work_order.tipo_servicio === 'tipo_servicio_C') {
			type_service_re2 = 'clientes'

		} else {
			type_service_re2 = 'not_found'

		}*/
		
		cb(err, new_work_orden_model)

	})



}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next()

	    console.log('El usuario no esta autentificado. Requiere logearse')
	    res.status(403).json({
	      status: 'not_access',
	      message: 'El usuario no esta autentificado. Requiere logearse'
	    })
}

function BuildWorkFilters (arr_work, cb11) {

	console.log('RECIBIENDO array DE ORDEr')
	console.log(arr_work.length)

	var arr_work_orders_new = []
	var err 
	if(arr_work.length === 0) {
		cb11(err, arr_work_orders_new)

	} else {

		for(var z = 0; z <= arr_work.length - 1; z++) {
			var work_item = arr_work[z]

			BuildWorkOrder(work_item, function (err, work_item_data) {
				if(err) {
					return cb11(err)
				}

				arr_work_orders_new.push(work_item_data)

				if(arr_work_orders_new.length === arr_work.length) {

					//console.log(arr_work_orders_new)
					console.log('Ordenesd de trabajo------->>> GOOOOOOO')

				    cb11(err, arr_work_orders_new)
				}

			})
		}

	}
	
}

function FormWorkOrder (app, io) {

	// Ejecutar funcion de enviar notificacion 
	var notis_alert = new Noti_Send_Messages(io)

	notis_alert.connect()

	// >> Order de Trabajo

	// API: CREATE - Crear nueva orden de Trabajo y el primer elemento en blanco
	app.post('/dashboard/ordenes_trabajo/create', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {

			// console.log('Datos recibidos')
			// console.log(req.body)

			var new_work_orden  = new Work_Order({
				codigo_supervisor:       req.body.codigo_supervisor ||  req.user._id,
				codigo_contratista:      req.body.codigo_contratista || '57eaaf0c482ff52f727a9a7e',
				tipo_servicio:           req.body.tipo_servicio || '',
				detalle_servicio:        req.body.detalle_servicio || '',
				empresa_admin: 			 req.user.empresa_admin,
				contratista: 			 req.user.contratista,
				tipo_urgencia:  	     req.body.tipo_urgencia || 'tipo_urgencia_B',
				cover_image: 			 {
											path: '/images/elemento_defaul.png'
				},
				coordenada_X:  		     req.body.coordenada_X || '-12.040422304735399',
				coordenada_Y:  		     req.body.coordenada_Y || '-77.09879726171494',
				direccion:               req.body.direccion || '',
				descripcion:             req.body.descripcion || '',
				public:                  false,
				conclusiones:            req.body.conclusiones || '',
				fecha_visita_esperada:   req.body.fecha_visita_esperada || '',
				fecha_trabajo_realizado: '',
				fecha_publicado: 		 '',
				reprogramado_de: 		 ''
			})

			// Buscando elementos como orden de trabajo
			Work_Order.find(function (err, work_orders) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar las ordenes de trabajo',
					  error: err
					})
				}
				
				// Asignando numero de orden a la orden de trabajo
				new_work_orden.codigo_orden = 'NWO_00' + Number(work_orders.length + 1)

				// Asignando fecha actual, si la fecha de publicado si es publico
				if(new_work_orden.public === true){
					new_work_orden.fecha_publicado = new Date()
					new_work_orden.estado = work_order_status.pendiente
				}

				if(new_work_orden.public === false){
					new_work_orden.fecha_publicado = new Date()
					new_work_orden.estado = work_order_status.pendiente
				}

				// guardando nueva orden de trabajo
				new_work_orden.save(function (err) {
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Error para guardar orden de trabajo',
						  error: err
						})
					}
					
					// console.log('Nueva orden de trabajo creada')
					// console.log(new_work_orden)
					
					var type_service = ''
					
					// Validando tipo de servicio para crear
					if(new_work_orden.tipo_servicio === 'tipo_servicio_P') {
						// Tipo de servicio POSTE
						type_service = 'poste'

						// Creando poste
						var new_poste = new Poste({
							codigo_poste: 		  '',
							codigo_orden_trabajo: new_work_orden.codigo_orden,
							type_poste: 		  '',
							altura_poste: 		  '',
							type_material: 		  '',
							type_pastoral: 		  '',
							type_luminaria: 	  '',
							type_lampara: 	      '',
							coordenada_X: 		  '',
							coordenada_Y:    	  '',
							observaciones: 		  '',
							estado_poste: 	   	  '',
							estado_pastoral:      '',
							estado_luminaria: 	  '',
							estado_lampara:  	  ''
						})

						// Agregando imagen por defecto en el elemento
						new_poste.imagen_poste.push({
							path: '/images/elemento_defaul.png',
							mimetype: 'default',
							position: new_poste.imagen_poste.length + 1
						})

						new_poste.save(function (err) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al guardar nuevo poste',
								  error: err
								})
							}

							// Guardando imagen cover del primer elemento en la orden de trabajo
							new_work_orden.cover_image = new_poste.imagen_poste[0]

				   			// Obteniendo numero de orden en el arreglo
				   			var num_order_element = new_work_orden.elementos.length + 1

							// Alcenando nuevo elemento dentro de la orden de tabajo
							new_work_orden.elementos.push({
								_id: new_poste._id,
								image_element: { 
									path: new_poste.imagen_poste[0].path
								},
								type: 'poste',
								position: num_order_element
							})

							// Guardando nuevo elemento integrado - poste
							new_work_orden.save(function (err) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error para guardar orden de trabajo',
									  error: err
									})
								}

								var user_id = JSON.stringify(req.user._id)
								user_id = JSON.parse(user_id)

								var tipo_servicio_name = ''

								// Validando variable de tipo de servicio
								if(new_work_orden.tipo_servicio === 'tipo_servicio_C') {
									
									tipo_servicio_name = 'Cliente' 

								} else {

									tipo_servicio_name = 'Poste'

								}

								// Enviando notificación: Nueva orden asignada
								var new_noti = new Notificaciones ({
									work_order_id:      new_work_orden._id,
									codigo_orden:       new_work_orden.codigo_orden,
									users: {
										user_emiter:    user_id,
										user_receptor:  new_work_orden.codigo_contratista  // al id del usuario
									},
									type_notification:  config.notification_type.new_order || 'new_order',
									type_service:       tipo_servicio_name || 'Poste',
									type_answer:  		config.notification_type.type_answer.new_order.asignado || 'asignado',
									message_copy: {
										detalle: `Te ha asignado una nueva orden de trabajo ${new_work_orden.codigo_orden}`
									},
									status_lectura:     config.card_status.no_read || false

								})

								new_noti.save(function(err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar notificación de nueva orden asginada, en la db',
										  error: err
										})
									}

									// Enviando notificacion: Asignando nueva orden de trabajo - poste
									notis_alert.notificar(new_noti.users.user_receptor, new_noti)

									// Render para Actualizar data, segun el tipo de servicio
									// Dato minimo a almacenar el codigo del elemento de tipo de servicio (poste o cliente)
									var service = new_poste
									
									// res.render('./admin/dashboard/ordenes_trabajo/work_order_item/index.jade', {
								 	//    user: req.user,
								 	//    work_order: new_work_orden,
									// 	  type_service: type_service,
									// 	  service: service,
									// 	  codigo_work_order: new_poste.codigo_orden_trabajo
									// })

									console.log(new_work_orden)
									console.log('ORDEN DE TRABAJO CREADA!!!')

									res.status(200).json({
								   		user: req.user,
								   		work_order: new_work_orden,
										type_service: type_service,
										service: service,
										codigo_work_order: new_poste.codigo_orden_trabajo
									})

									// res.redirect('/dashboard/ordenes_trabajo/')

								})
							
							})
						
						})


					} else {
						// Tipo de servicio CLIENTE
						type_service = 'cliente'

						// Creando cliente
						var new_cliente = new Cliente({
							cliente_id:  			 '',
							codigo_orden_trabajo:    new_work_orden.codigo_orden,
							numero_cliente: 		 '',
							codigo_via: 	   		 '',  // nombre vida
							distrito: 				 '',  // distrito
							urbanizacion: 			 '', 
							numero_puerta: 			 '',
							numero_interior: 		 '',
							manzana: 				 '',
							lote: 					 '',
							nombre_de_cliente: 		 '',
							type_residencial:  		 '',
							is_maximetro_bt: 		 '',
							suministro_derecha:  	 {
								coordX: '',
								coordY: '',
								value:  ''
							},
							suministro_izquierda:    {
								coordX: '',
								coordY: '',
								value:  ''
							},
							poste_cercano:           {
								coordX: '',
								coordY: '',
								value:  ''
							},
							medidor_derecha:    	 '',
							medidor_izquierda:  	 '',
							type_conexion: 			 '',
							type_acometida: 		 '',
							type_cable_acometida:    '',
							calibre_cable_acometida: '',
							calibre_cable_matriz:    '',
							observaciones: 			 '',
							fecha_ejecucion: 		 '',
							croquis: 				 '',
							coordenada_X: 			 '',
							coordenada_Y: 			 ''
						})

						// Agregando imagen por defecto en el elemento
						new_cliente.imagen_cliente.push({
							path: '/images/elemento_defaul.png',
							mimetype: 'default',
							position: new_cliente.imagen_cliente.length + 1
						})

						new_cliente.save(function (err) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al guardar nuevo cliente',
								  error: err
								})
							}
							
							// console.log('Nuevo cliente creado')
							// console.log(new_cliente)

							// Guardando imagen cover del primer elemento en la orden de trabajo
							new_work_orden.cover_image = new_cliente.imagen_cliente[0]

							// Obteniendo numero de orden en el arreglo
				   			var num_order_element2 = new_work_orden.elementos.length + 1

							// Alcenando nuevo elemento dentro de la orden de tabajo
							new_work_orden.elementos.push({
								_id: new_cliente._id,
								image_element: {
									path: new_cliente.imagen_cliente[0].path
								},
								type: 'cliente',
								position: num_order_element2
							})

							// Guardando nuevo elemento integrado - poste
							new_work_orden.save(function (err) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error para guardar orden de trabajo',
									  error: err
									})
								}

								var user_id = JSON.stringify(req.user._id)
								user_id = JSON.parse(user_id)

								// Notificacion - Enviado al usuario
								// Enviando notificación: Nueva orden asignada

								var tipo_servicio_name = ''
								// Validando variable de tipo de servicio
								if(new_work_orden.tipo_servicio === 'tipo_servicio_C') {
									
									tipo_servicio_name = 'Cliente' 

								} else {

									tipo_servicio_name = 'Poste'

								}

								var new_noti = new Notificaciones ({
									work_order_id:      new_work_orden._id,
									codigo_orden:       new_work_orden.codigo_orden,
									users: {
										user_emiter:    user_id,
										user_receptor:  new_work_orden.codigo_contratista  // al id del usuario
									},
									type_notification:  config.notification_type.new_order || 'new_order',
									type_service:       tipo_servicio_name || 'Cliente',
									type_answer:  		config.notification_type.type_answer.new_order.asignado || 'asignado',
									message_copy: {
										datalle: `Nuva Orden de Trabajo ${new_work_orden.codigo_orden} se te a asignado`
									},
									status_lectura:     config.card_status.no_read
								})

								new_noti.save(function(err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar notificación de nueva orden asginada, en la db',
										  error: err
										})
									}

									// Enviando notificacion: Asignando nueva orden de trabajo - cliente
									notis_alert.notificar(new_noti.users.user_receptor, new_noti)
									
									var service = new_cliente
									// Render para Actualizar data, segun el tipo de servicio
									// Dato minimo a almacenar el codigo del elemento de tipo de servicio (poste o cliente)
									
									// res.render('./admin/dashboard/ordenes_trabajo/work_order_item/index.jade', {
								    //   user: req.user,
								 	//   work_order: new_work_orden,
									// 	 type_service: type_service,
									// 	 service: service,
									// 	 codigo_work_order: new_cliente.codigo_orden_trabajo
									// })

									console.log(new_work_orden)
									console.log('ORDEN DE TRABAJO CREADA!!!')

									res.status(200).json({
								   		user: req.user,
								   		work_order: new_work_orden,
										type_service: type_service,
										service: service,
										codigo_work_order: new_cliente.codigo_orden_trabajo
									})

									// res.redirect('/dashboard/ordenes_trabajo/')

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

	})

	// API: READ - Obtener detalles por orden de Trabajo
	app.get('/dashboard/ordenes_trabajo/:work_order_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {

			var work_order_id = req.params.work_order_id

			console.log('Id de una orden de trabajo')
			console.log(work_order_id)

			Work_Order.findById({'_id': work_order_id}, function (err, work_order) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar orden de trabajo en la base de datos',
					  error: err
					})
				}

				// Obteniendo datos del supervisor
				var new_work_orden_model = {
					_id:  						 work_order._id,
					codigo_orden:      	         work_order.codigo_orden,
					codigo_supervisor:           work_order.codigo_supervisor,
					codigo_contratista:          work_order.codigo_contratista,
					empresa_admin: 				 work_order.empresa_admin,
					contratista: 				 work_order.contratista,
					tipo_servicio:               work_order.tipo_servicio,
					user_card_data: 			 '',
					detalle_servicio:            work_order.detalle_servicio,
					tipo_urgencia:  	         work_order.tipo_urgencia,
					cover_image: 				 work_order.cover_image,
					coordenada_X:  		         work_order.coordenada_X,
					coordenada_Y:  		         work_order.coordenada_Y,
					direccion:                   work_order.direccion,
					descripcion:                 work_order.descripcion,
					public:                      work_order.public,
					estado:                      work_order.estado,
					conclusiones:                work_order.conclusiones,
					fecha_publicado:             work_order.fecha_publicado,   // Si el campo public es false, esta data se sobresescribe por nueva fecha al cambiar por public true
					fecha_visita_esperada:       work_order.fecha_visita_esperada,
					fecha_trabajo_realizado:     work_order.fecha_trabajo_realizado,
					reprogramado_de:             work_order.reprogramado_de,
					elementos:                   work_order.elementos,  // Arreglo contenidor de elementos
					fecha_creada: 				 work_order.fecha_creada,
					progress_to_complete: 		 work_order.progress_to_complete
				}

				// Validando fecha pretty
				if(new_work_orden_model.fecha_publicado !== '') {
					new_work_orden_model.fecha_publicado = GetDate(work_order.fecha_publicado)
				}

				if(new_work_orden_model.fecha_visita_esperada !== '') {
					new_work_orden_model.fecha_visita_esperada = GetDate(work_order.fecha_visita_esperada)
				}

				if(new_work_orden_model.fecha_trabajo_realizado !== '') {
					new_work_orden_model.fecha_trabajo_realizado = GetDate(work_order.fecha_trabajo_realizado)
				}

				if(new_work_orden_model.fecha_creada !== '') {
					new_work_orden_model.fecha_creada = GetDate(work_order.fecha_creada)
				}

				// Buscando datos del usuario de campo encargado de la orden en la base de datos
				FindUserData(work_order.codigo_contratista, function (err, user_found) {
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Error datos del usuario, en la base de datos',
						  error: err
						})
					} 

					// Buscando datos del contratista en la base de datos
					Contratista.findById({'_id': work_order.contratista}, function (err, contratista_name) {
						if(err) {
							return res.status(500).json({
							  status: 'error_server',
							  message: 'Error al encontrar los datos del contratista en la base de datos',
							  error: err
							})
						}

						// BUscando datos del usuario supervisor, encargado de la orden
						FindUserData(work_order.codigo_supervisor, function(err, user_supervisor) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al encontrar la usuario supervisor en la base de datos',
								  error: err
								})
							}

							//console.log('Usuario encontrado')
							//console.log(user_found)
							
							// Asignando model card data
							new_work_orden_model.user_card_data = {
							 	user: {  // Datos del usuario encargado de la orden de trabajo
							 		name:  user_found.full_name,
							 		photo: user_found.photo
							 	},
							 	contratista: {
							 		name: contratista_name.name // Empresa contratista d registro
							 	},
							 	supervisor: { // Nombre del supervisor encargado
							 		name:  user_supervisor.full_name,
							 		photo: user_supervisor.photo
							 	}
							}

							// Obteniendo datos del elemento para la orden de trabajo
							var type_service_re2 

							if(work_order.tipo_servicio === 'tipo_servicio_P') {
								type_service_re2 = 'postes'

							} else if (work_order.tipo_servicio === 'tipo_servicio_C') {
								type_service_re2 = 'clientes'

							} else {
								type_service_re2 = 'not_found'

							}

							 console.log('ORDEN DE TRABAJO PARA MOSTRAR')
							 console.log(new_work_orden_model)
							
							// console.log('Orden de trabajo encontrado')
							res.status(200).json({
						   		user: req.user,
						   		type_service_name: type_service_re2,
								work_order: new_work_orden_model
							})

						})

					})


				})

			})

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}

	})

	// API: READ - work_order - obteniendo todas las ordenes de tabajo
		console.log('Lectura interna?')
	app.get('/dashboard/ordenes_trabajo/works_ordeners/list', isLoggedIn, function (req, res) {

		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {

			console.log('Heello todas las ordenes')
			Work_Order.find(function (err, work_orders) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar ordenes de trabajo',
					  error: err
					})
				}

				if(work_orders.length === 0) {

					var arr_work_orders = []

					res.status(200).json({
						user: req.user,
						work_orders: arr_work_orders
					})

				} else {

					work_orders.reverse()
					var arr_work_orders = []
					
					
					for(var f = 0; f <= work_orders.length - 1; f++) {
						var work_item = work_orders[f]

						BuildWorkOrder(work_item, function (err, work_item_data) {
							if(err) {
								return res.status(500).json({
									status: 'error_server',
									message: 'Errror al encontrar orden de trabajo por id'
								})
							}

							//console.log('DATOS ITEM')
							//console.log(work_item_data)

							arr_work_orders.push(work_item_data)

							console.log('arr_work_orders')
							console.log(arr_work_orders.length)

							console.log('work_oders')
							console.log(work_orders.length)

							if(arr_work_orders.length === work_orders.length) {
								console.log(arr_work_orders)
								console.log('Ordenesd de trabajo------->>>')

							   res.status(200).json({
							   		user: req.user,
							   		work_orders: arr_work_orders
							   })
							}

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
		
	})

	// API: DELETE - Orden de trabajo
	app.delete('/dashboard/ordenes_trabajo/delete/:work_order_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
		   
		   var work_order_id = req.params.work_order_id
		   
		   // ELiminando order de trabajo por id de la orden de trabajo
		   Work_Order.remove({'_id': work_order_id}, function (err) {
		   		if(err) {
		   			return res.status(500).json({
		   			  status: 'error_server',
		   			  message: 'Error al eliminar order de trabajo',
		   			  error: err
		   			})
		   		}
		   		console.log('Orden de trabajo eliminada de la base de datos')

		   		res.status(200).json({
		   			status: 'ok',
		   			message: 'Orden de trabajo eliminada'
		   		})

		   		//res.redirect('/dashboard/ordenes_trabajo')
		   })

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// API: UPDATE - Orden de trabajo actualizar
	app.put('/dashboard/ordenes_trabajo/:work_order_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
		   
			var work_order_id = req.params.work_order_id
			var message_action = ''

			// Buscando elemento editado en la base de datos
			Work_Order.findById({'_id': work_order_id}, function (err, work_order_first) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar orden de trabajo',
					  error: err
					})
				}

				var data = {
					codigo_supervisor:       req.body.codigo_supervisor || work_order_first.codigo_supervisor,
					codigo_contratista:      req.body.codigo_contratista || work_order_first.codigo_contratista,
					detalle_servicio:        req.body.detalle_servicio || work_order_first.detalle_servicio,
					contratista: 			 '',
					tipo_urgencia:  	     req.body.tipo_urgencia || work_order_first.tipo_urgencia,
					coordenada_X:  		     req.body.coordenada_X || work_order_first.coordenada_X,
					coordenada_Y:  		     req.body.coordenada_Y || work_order_first.coordenada_Y,
					direccion:               req.body.direccion || work_order_first.direccion,
					descripcion:             req.body.descripcion || work_order_first.descripcion,
					public:                  req.body.public || work_order_first.public,
					conclusiones:            req.body.conclusiones || work_order_first.conclusiones,
					fecha_visita_esperada:   req.body.fecha_visita_esperada || work_order_first.fecha_visita_esperada,
					tipo_servicio:           req.body.tipo_servicio || work_order_first.tipo_servicio,
					fecha_publicado:         req.body.fecha_publicado || work_order_first.fecha_publicado,
					reprogramado_de: 		 req.body.reprogramado_de || work_order_first.reprogramado_de		 
			    }

			    // Buscando empresa contratista del usuario contratista
			    Usuarios.findById({'_id': data.codigo_contratista}, function (err, usuario_campo33) {
			    	if(err) {
			    		return res.status(500).json({
			    			status: 'error_server',
			    			error: err
			    		})
			    	}

			    	console.log('DATOS OBTENIDOS DEL USUARIO')
			    	console.log(usuario_campo33)

			    	console.log('------')
			    	
			    	data.contratista = usuario_campo33.contratista

		    	    console.log('EDITANDO CAMPOS DE WORK ORDER')
		    	    
		    	    console.log(data)

		    	    if(req.body.public === 'true') {
		    	    	console.log('La publicaicon es publica --------- ')
		    	    	data.fecha_publicado = new Date()
		    	    	data.estado = work_order_status.pendiente
		    	    	message_action = `Orden de Trabajo, Se te ha asignado`

		    	    }

		    	    if(req.body.public === 'false') {
		    	    	console.log('La publicaicon Ya no es publica -------- ')
		    	    	data.estado = work_order_status.pendiente
		    	    	message_action = `Orden de Trabajo. Se te ha pasado a no publico`

		    	    }

		    		Work_Order.update({'_id': work_order_id}, data, function (err) {
		    			if(err) {
		    				return res.status(500).json({
		    				  status: 'error_server',
		    				  message: 'Error al actualizar orden de trabajo',
		    				  error: err
		    				})
		    			}

		    			console.log('Orden de trabajo editada')
		    			// Buscando elemento editado en la base de datos
		    			Work_Order.findById({'_id': work_order_id}, function (err, work_order_find) {
		    				if(err) {
		    					return res.status(500).json({
		    					  status: 'error_server',
		    					  message: 'Error al encontrar orden de trabajo',
		    					  error: err
		    					})
		    				}
		    				
		    		    	// Enviando Notificación - Nueva orden de trabajo Pendiente
		    		    	var user_id = JSON.stringify(req.user._id)
		    		    	user_id = JSON.parse(user_id)

		    		    	var tipo_servicio_name = ''
		    		    	// Validando variable de tipo de servicio
		    		    	if(work_order_find.tipo_servicio === 'tipo_servicio_C') {
		    		    		
		    		    		tipo_servicio_name = 'Cliente' 

		    		    	} else {

		    		    		tipo_servicio_name = 'Poste'

		    		    	}

		    		    	// Enviando notificación: Nueva orden asignada
		    		    	var new_noti = new Notificaciones ({
		    		    		work_order_id:      work_order_find._id,
		    		    		codigo_orden:       work_order_find.codigo_orden,
		    		    		users: {
		    		    			user_emiter:    user_id,
		    		    			user_receptor:  work_order_find.codigo_contratista  // al id del usuario
		    		    		},
		    		    		type_notification:  config.notification_type.change_status,
		    		    		type_service:       tipo_servicio_name,
		    		    		type_answer:  		config.notification_type.type_answer.change_status.actualizada,
		    		    		message_copy: {
		    		    			detalle: `La orden de trabajo ${work_order_find.codigo_orden} ha sido actualizada.`
		    		    		},
		    		    		status_lectura:     config.card_status.no_read
		    		    	})

		    		    	new_noti.save(function (err) {
		    		    		if(err) {
		    		    			return res.status(500).json({
		    		    			  status: 'error_server',
		    		    			  message: 'Error al guardar notificaion, orden de trabajo publico',
		    		    			  error: err
		    		    			})
		    		    		}
		    		    		
		    		    		// Enviando notificacion
		    					notis_alert.notificar(new_noti.users.user_receptor, new_noti)

		    			   		// Usuarios de oficina filtrados
		    			   		Usuarios.find(function (err, usuarios) {
		    			   			if(err) {
		    			   				return res.status(500).json({
		    			   				  status: 'error_server',
		    			   				  message: 'Error al encontrar lista de usuarios en la base de datos',
		    			   				  error: err
		    			   				})
		    			   			}

		    			   			// - Officers

		    			   			// Filtrando a todos los oficcers
		    			   			var officer_filter = usuarios.filter(function (element) {
		    			   				return element.permiso === users_type.officers
		    			   			})

		    			   			// Filtrando a los officers que pertenecen a la empresa del usuario que crea
		    			   			var officer_empresa_filter = officer_filter.filter(function (element) {
		    			   				return element.empresa_admin === req.user.empresa_admin
		    			   			})

		    			   			// Filtrando a los officers que pertenecen a la contratista del usuario que crea
		    			   			var officer_contratista_filter = officer_empresa_filter.filter(function (element) {
		    			   				return element.contratista === req.user.contratista
		    			   			})

		    			   			// - Usuarios de campo

		    			   			// Filtrando a todos los usuarios de campo
		    			   			var user_campo_filter = usuarios.filter(function (element) {
		    			   				return element.permiso === users_type.users_campo
		    			   			})

		    			   			// Filtrando a los usuarios de campo que pertenecen a la empresa del usuario que crea
		    			   			var user_campo_empresa_filter = user_campo_filter.filter(function (element) {
		    			   				return element.empresa_admin === req.user.empresa_admin
		    			   			})

		    			   			// Filtrando a los usuarios de campo que pertenecen a la contratista del usuario que crea
		    			   			var user_campo_contratista_filter = user_campo_empresa_filter.filter(function (element) {
		    			   				return element.contratista === req.user.contratista
		    			   			})

		    			   			console.log(work_order_find)

		    			   			console.log('Proceso de editar')

		    			   			console.log('ORDEN DE TRABAJO - EDICION TERMINADA')

		    			   			// Render de formulario editable
		    			   			// res.render('./admin/dashboard/ordenes_trabajo/form_edit/index.jade', {
		    			   			// 	user: req.user,
		    			   			// 	officers: officer_contratista_filter,
		    			   			// 	user_campos: user_campo_contratista_filter,
		    			   			// 	work_order: work_order_find
		    			   			// })

		    			   			res.status(200).json({
		    				   			user: req.user,
		    				   			officers: officer_contratista_filter,
		    				   			user_campos: user_campo_contratista_filter,
		    				   			work_order: work_order_find
		    			   			})

		    			   		})

		    		    	})

		    			})

		    		})

			    })
			    
			})

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// Render vista principal dashboard
	app.get('/dashboard/ordenes_trabajo', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {

			Work_Order.find(function (err, work_orders) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar ordenes de trabajo',
					  error: err
					})
				}

				work_orders.reverse()

			   // res.render('./admin/dashboard/ordenes_trabajo/index.jade',{
			   // 	user: req.user,
			   // 	work_orders: work_orders
			   // })
			   
			   res.status(200).json({
		   	   		user: req.user,
			   		work_orders: work_orders
			   })
				
			})
		
		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
			
		}
	})

	// Render - formulario para crear nueva orden
	app.post('/dashboard/ordenes_trabajo/new', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {

			// Usuarios de oficina filtrados
			Usuarios.find(function (err, usuarios) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar lista de usuarios en la base de datos',
					  error: err
					})
				}

				// - Officers

				// Filtrando a todos los oficcers
				var officer_filter = usuarios.filter(function (element) {
					return element.permiso === users_type.officers
				})

				// Filtrando a los officers que pertenecen a la empresa del usuario que crea
				var officer_empresa_filter = officer_filter.filter(function (element) {
					return element.empresa_admin === req.user.empresa_admin
				})

				// Filtrando a los officers que pertenecen a la contratista del usuario que crea
				var officer_contratista_filter = officer_empresa_filter.filter(function (element) {
					return element.contratista === req.user.contratista
				})

				// - Usuarios de campo

				// Filtrando a todos los usuarios de campo
				var user_campo_filter = usuarios.filter(function (element) {
					return element.permiso === users_type.users_campo
				})

				// Filtrando a los usuarios de campo que pertenecen a la empresa del usuario que crea
				var user_campo_empresa_filter = user_campo_filter.filter(function (element) {
					return element.empresa_admin === req.user.empresa_admin
				})

				// Filtrando a los usuarios de campo que pertenecen a la contratista del usuario que crea
				var user_campo_contratista_filter = user_campo_empresa_filter.filter(function (element) {
					return element.contratista === req.user.contratista
				})

				// res.render('./admin/dashboard/ordenes_trabajo/form_new_order/index.jade',{
				// 	user: req.user,
				// 	officers: officer_contratista_filter,
				// 	user_campos: user_campo_contratista_filter
				// })

				res.status(200).json({
					user: req.user,
					officers: officer_contratista_filter,
					user_campos: user_campo_contratista_filter
				})
		
			})

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
			
		}
	})

	// Render form to Edit Orden de Trabajo
	app.post('/dashboard/ordenes_trabajo/edit/:work_order_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
			
		   var work_order_id = req.params.work_order_id

		   Work_Order.findById({'_id': work_order_id}, function (err, work_order_find) {
		   		if(err) {
		   			return res.status(500).json({
		   			  status: 'error_server',
		   			  message: 'Error al encontrar la orden de trabajo en la base de datos',
		   			  error: err
		   			})
		   		}

		   		// Usuarios de oficina filtrados
		   		Usuarios.find(function (err, usuarios) {
		   			if(err) {
		   				return console.log('Error al encontrar lista de usuarios en la base de datos : ' + err)
		   			}

		   			// - Officers

		   			// Filtrando a todos los oficcers
		   			var officer_filter = usuarios.filter(function (element) {
		   				return element.permiso === users_type.officers
		   			})

		   			// Filtrando a los officers que pertenecen a la empresa del usuario que crea
		   			var officer_empresa_filter = officer_filter.filter(function (element) {
		   				return element.empresa_admin === req.user.empresa_admin
		   			})

		   			// Filtrando a los officers que pertenecen a la contratista del usuario que crea
		   			var officer_contratista_filter = officer_empresa_filter.filter(function (element) {
		   				return element.contratista === req.user.contratista
		   			})

		   			// - Usuarios de campo

		   			// Filtrando a todos los usuarios de campo
		   			var user_campo_filter = usuarios.filter(function (element) {
		   				return element.permiso === users_type.users_campo
		   			})

		   			// Filtrando a los usuarios de campo que pertenecen a la empresa del usuario que crea
		   			var user_campo_empresa_filter = user_campo_filter.filter(function (element) {
		   				return element.empresa_admin === req.user.empresa_admin
		   			})

		   			// Filtrando a los usuarios de campo que pertenecen a la contratista del usuario que crea
		   			var user_campo_contratista_filter = user_campo_empresa_filter.filter(function (element) {
		   				return element.contratista === req.user.contratista
		   			})

		   			console.log('Proceso de editar')

		   			// Validando type_service
		   			var type_service_re

		   			if(work_order_find.tipo_servicio === 'tipo_servicio_P') {
		   				type_service_re = 'poste'

		   			} else if (work_order_find.tipo_servicio === 'tipo_servicio_C') {
		   				type_service_re = 'cliente'

		   			} else {
		   				type_service_re = 'not_found'

		   			}

		   			// Render de formulario editable
		   			// res.render('./admin/dashboard/ordenes_trabajo/form_edit/index.jade', {
		   			// 	user: req.user,
		   			// 	officers: officer_contratista_filter,
		   			// 	type_service_re: type_service_re,
		   			// 	user_campos: user_campo_contratista_filter,
		   			// 	work_order: work_order_find
		   			// })

		   			res.status(200).json({
			   			user: req.user,
			   			officers: officer_contratista_filter,
			   		 	type_service_re: type_service_re,
			   			user_campos: user_campo_contratista_filter,
			   			work_order: work_order_find
		   			})

		   		})

		   })

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// >> Orden de Trabajos - Filtro validation
	app.post('/dashboard/ordenes_trabajo/dynamic-filter/:public/:tipo_servicio/:codigo_contratista', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {
			
			var public = req.params.public
			var tipo_servicio = req.params.tipo_servicio
			var codigo_contratista = req.params.codigo_contratista

			// El en cliente front - se coloca un uri de llamado por default y sus parametros cambian a corde a la modificaciones, pero nunca se queda sin ninguno
			// /dynamic-filter/public/tipo_servicio_P/57954c2a1076ba8c066b4437

			Work_Order.find(function (err, work_orders) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al obtener las ordenes de trabajo',
					  error: err
					})
				}

				if(work_orders.length === 0) {
					
					console.log('NO hay ninguna orden de trabajo en la base de datos')

					res.status(200).json({
						status: 'not_found',
						message: 'No hay ordenes de trabajo del día'
					})

				} else {

					// Public Validation
					if(public === 'true') {
						// Orders Public

						// Filtrando por public === true
						var orders_public = work_orders.filter(function (element) {
							return element.public === true
						})
						
						if(orders_public.length === 0) {

							console.log('No hay ordenes de trabajo publicas en la base de datos')

							res.status(200).json({
								status: 'not_found',
								message: 'No hay ordenes de trabajo del día'
							})

						} else {

							console.log('PUBLIC')

							// Filtrando por fecha de hoy 
							var orders_today = []

							// Comparando con fecha del dia de hoy 
							var today = new Date()
							var today_day = today.getDate()
							var today_month = today.getMonth() + 1
							var today_year = today.getFullYear() 

							for(var f = 0; f <= orders_public.length - 1; f++) {

								var el_order_filter_date = orders_public[f]

								//console.log('Date here: ' + el_order_filter_date.fecha_publicado)

								// Comparando con fecha de publicado de la orden
								var RTime = new Date(el_order_filter_date.fecha_publicado)
								var month = RTime.getMonth() + 1   // 0 - 11 *
								var day = RTime.getDate()          // 1- 31  *
								var year = RTime.getFullYear()     // año   *

								//console.log('Comparando here: ' + day + '/' + month + '/' + year)

								// Validando si es hoy y en menos de 24h
								if( Number(day) <= Number(today_day) && 
									Number(day) >= Number(today_day) - 1 &&
								    Number(month) === Number(today_month)  &&
								    Number(year) === Number(today_year) ) {

									//console.log('orden es del dia + 1')

									// añadiendo elemento si coincide con la fecha del dia
									orders_today.push(el_order_filter_date)

								} 

							}

							var orders_empresa_select = []

							
							if(orders_today.length !== 0 ) { 

								// Filtrando por id de contratista
								if(codigo_contratista !== '' &&
								   codigo_contratista !== undefined) {

									// Filtrando Ordenes por empresa. Ordenes de la empresa
									var orders_empresa = orders_today.filter(function (element) {
										return element.empresa_admin === req.user.empresa_admin
									})
									
									// Filtrando Ordenes por supervisor
									var orders_supervisor_here = []
									var supervisor_user = JSON.stringify(req.user._id)
									supervisor_user = JSON.parse(supervisor_user)

									// Evaluando el tipo de usuario
									if(req.user.permiso === users_type.officers) {

										orders_supervisor_here = orders_empresa.filter(function (element) {
											return element.codigo_supervisor === supervisor_user
										})

									} else {

										orders_supervisor_here = orders_empresa

									}

									// Filtrando por parametro Contratista id
									if(codigo_contratista === 'all') {
										orders_empresa_select = orders_supervisor_here

									} else {

										// Filtrando por codigo de contratista
										orders_empresa_select = orders_supervisor_here.filter(function (element) {
											return element.contratista === codigo_contratista
										})

									}

									// Filtrando por tipo de servicio
									if(tipo_servicio === 'tipo_servicio_P' ||
									   tipo_servicio === 'tipo_servicio_C') {

										var orders_type_service = orders_empresa_select.filter(function (element) {
											return element.tipo_servicio === tipo_servicio
										})									

										// Filtrando por estado de la orden

										// Pendientes 
										var orders_status_pendientes = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.pendiente
										})

										// En curso
										var orders_status_en_curso = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.en_proceso
										})

										// Resueltas
										var orders_status_resueltas = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.resuelto
										})

										// No resueltas
										var orders_status_no_resueltas = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.no_resuelto
										})

										// Cancelado
										var orders_status_cancelado = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.cancelado
										})

										// Reportadas
										var orders_status_reportado = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.reportado
										})

										
										console.log('-----------------------')
										console.log('PENDIENTES')
										console.log(orders_status_pendientes.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('EN CURSO')
										console.log(orders_status_en_curso.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('RESUELTAS')
										console.log(orders_status_resueltas.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('NO RESUELTAS')
										console.log(orders_status_no_resueltas.length)
										console.log('-----------------------')


										console.log('-----------------------')
										console.log('CANCELADOS')
										console.log(orders_status_cancelado.length)
										console.log('-----------------------')


										console.log('-----------------------')
										console.log('REPORTADO')
										console.log(orders_status_reportado.length)
										console.log('-----------------------')
										

										
										var new_orders_status_pendientes = []
										var new_orders_status_en_curso = []
										var new_orders_status_resueltas = []
										var new_orders_status_no_resueltas = []
										var new_orders_status_cancelado = []
										var new_orders_status_reportado = []

										console.log('ANTES DE entrar')

										// Obteniendo datos de copy de la orden
										BuildWorkFilters(orders_status_pendientes, function (err, orders_status_pendientes1) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													error: err
												})
											}


											new_orders_status_pendientes = orders_status_pendientes1


											BuildWorkFilters(orders_status_en_curso, function (err, new_orders_status_en_curso1) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														error: err
													})
												}


												new_orders_status_en_curso = new_orders_status_en_curso1

												BuildWorkFilters(orders_status_resueltas, function (err, orders_status_resueltas1) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															error: err
														})
													}



													new_orders_status_resueltas = orders_status_resueltas1

													BuildWorkFilters(orders_status_no_resueltas, function(err, orders_status_no_resueltas1) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																error: err
															})
														}

														new_orders_status_no_resueltas = orders_status_no_resueltas1

														BuildWorkFilters(orders_status_cancelado, function (err, orders_status_cancelado1) {
															if(err) {
																return res.status(500).json({
																	status: 'error_server',
																	error: err
																})
															}


															new_orders_status_cancelado = orders_status_cancelado1

															BuildWorkFilters(orders_status_reportado, function (err, orders_status_reportado1) {
																if(err) {
																	return res.status(500).json({
																		status: 'error_server',
																		error: err
																	})
																}

																new_orders_status_reportado = orders_status_reportado1
																

																console.log('-----------------------')
																console.log('PENDIENTES new_')
																console.log(new_orders_status_pendientes.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('EN CURSO new_')
																console.log(new_orders_status_en_curso.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('RESUELTAS new_')
																console.log(new_orders_status_resueltas.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('NO RESUELTAS new_')
																console.log(new_orders_status_no_resueltas.length)
																console.log('-----------------------')


																console.log('-----------------------')
																console.log('CANCELADOS new_')
																console.log(new_orders_status_cancelado.length)
																console.log('-----------------------')


																console.log('-----------------------')
																console.log('REPORTADO new_')
																console.log(new_orders_status_reportado.length)
																console.log('-----------------------')	
																



																console.log('----------------')
																console.log('ORDENES PUBLICAS')
																console.log(orders_public.length)
																console.log('----------------')

																console.log('----------------')
																console.log('ORDENES DEL DIA POR FECHA')
																console.log(orders_today.length)
																console.log('----------------')

																console.log('----------------')
																console.log('Hoy de la empresa')
																console.log(orders_empresa.length)
																console.log('----------------')

																console.log('----------------')
																console.log('Para el supervidor')
																console.log(orders_supervisor_here.length)
																console.log('----------------')

																console.log('Filtrado por contratista: ' + codigo_contratista)
																console.log(orders_empresa_select.length)

																console.log('Filtrado por service: ' + tipo_servicio)
																console.log(orders_type_service.length)	


																// Enviando ordenes de trabajo filtradas
																res.status(200).json({
																	status: 'ok',
																	work_orders: {
																		pendiente:   new_orders_status_pendientes,
																		en_curso:    new_orders_status_en_curso,
																		resuelto:    new_orders_status_resueltas,
																		no_resuelto: new_orders_status_no_resueltas,
																		cancelado:   new_orders_status_cancelado,
																		reportado:   new_orders_status_reportado
																	}
																})

															})


														})
														
													})

												})

											})

										})

									} else if(tipo_servicio === 'all') {

										var orders_type_service = orders_empresa_select

										// Filtrando por estado de la orden

										// Pendientes 
										var orders_status_pendientes = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.pendiente
										})

										// En curso
										var orders_status_en_curso = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.en_proceso
										})

										// Resueltas
										var orders_status_resueltas = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.resuelto
										})

										// No resueltas
										var orders_status_no_resueltas = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.no_resuelto
										})

										// Cancelado
										var orders_status_cancelado = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.cancelado
										})

										// Reportadas
										var orders_status_reportado = orders_type_service.filter(function (element) {
											return element.estado === work_order_status.reportado
										})

										
										console.log('-----------------------')
										console.log('PENDIENTES')
										console.log(orders_status_pendientes.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('EN CURSO')
										console.log(orders_status_en_curso.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('RESUELTAS')
										console.log(orders_status_resueltas.length)
										console.log('-----------------------')

										console.log('-----------------------')
										console.log('NO RESUELTAS')
										console.log(orders_status_no_resueltas.length)
										console.log('-----------------------')


										console.log('-----------------------')
										console.log('CANCELADOS')
										console.log(orders_status_cancelado.length)
										console.log('-----------------------')


										console.log('-----------------------')
										console.log('REPORTADO')
										console.log(orders_status_reportado.length)
										console.log('-----------------------')



										console.log('----------------')
										console.log('ORDENES PUBLICAS')
										console.log(orders_public.length)
										console.log('----------------')

										console.log('----------------')
										console.log('ORDENES DEL DIA POR FECHA')
										console.log(orders_today.length)
										console.log('----------------')

										console.log('----------------')
										console.log('Hoy de la empresa')
										console.log(orders_empresa.length)
										console.log('----------------')

										console.log('----------------')
										console.log('Para el supervidor')
										console.log(orders_supervisor_here.length)
										console.log('----------------')

										console.log('Filtrado por contratista: ' + codigo_contratista)
										console.log(orders_empresa_select.length)

										console.log('Filtrado por service: ' + tipo_servicio)
										console.log(orders_type_service.length)	
										

										var new_orders_status_pendientes = []
										var new_orders_status_en_curso = []
										var new_orders_status_resueltas = []
										var new_orders_status_no_resueltas = []
										var new_orders_status_cancelado = []
										var new_orders_status_reportado = []

										console.log('ANTES DE entrar')

										// Obteniendo datos de copy de la orden
										BuildWorkFilters(orders_status_pendientes, function (err, orders_status_pendientes1) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													error: err
												})
											}


											new_orders_status_pendientes = orders_status_pendientes1


											BuildWorkFilters(orders_status_en_curso, function (err, new_orders_status_en_curso1) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														error: err
													})
												}


												new_orders_status_en_curso = new_orders_status_en_curso1

												BuildWorkFilters(orders_status_resueltas, function (err, orders_status_resueltas1) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															error: err
														})
													}



													new_orders_status_resueltas = orders_status_resueltas1

													BuildWorkFilters(orders_status_no_resueltas, function(err, orders_status_no_resueltas1) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																error: err
															})
														}

														new_orders_status_no_resueltas = orders_status_no_resueltas1

														BuildWorkFilters(orders_status_cancelado, function (err, orders_status_cancelado1) {
															if(err) {
																return res.status(500).json({
																	status: 'error_server',
																	error: err
																})
															}


															new_orders_status_cancelado = orders_status_cancelado1

															BuildWorkFilters(orders_status_reportado, function (err, orders_status_reportado1) {
																if(err) {
																	return res.status(500).json({
																		status: 'error_server',
																		error: err
																	})
																}

																new_orders_status_reportado = orders_status_reportado1
																

																console.log('-----------------------')
																console.log('PENDIENTES new_')
																console.log(new_orders_status_pendientes.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('EN CURSO new_')
																console.log(new_orders_status_en_curso.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('RESUELTAS new_')
																console.log(new_orders_status_resueltas.length)
																console.log('-----------------------')

																console.log('-----------------------')
																console.log('NO RESUELTAS new_')
																console.log(new_orders_status_no_resueltas.length)
																console.log('-----------------------')


																console.log('-----------------------')
																console.log('CANCELADOS new_')
																console.log(new_orders_status_cancelado.length)
																console.log('-----------------------')


																console.log('-----------------------')
																console.log('REPORTADO new_')
																console.log(new_orders_status_reportado.length)
																console.log('-----------------------')	
																

																
																console.log('----------------')
																console.log('ORDENES PUBLICAS')
																console.log(orders_public.length)
																console.log('----------------')

																console.log('----------------')
																console.log('ORDENES DEL DIA POR FECHA')
																console.log(orders_today.length)
																console.log('----------------')

																console.log('----------------')
																console.log('Hoy de la empresa')
																console.log(orders_empresa.length)
																console.log('----------------')

																console.log('----------------')
																console.log('Para el supervidor')
																console.log(orders_supervisor_here.length)
																console.log('----------------')

																console.log('Filtrado por contratista: ' + codigo_contratista)
																console.log(orders_empresa_select.length)

																console.log('Filtrado por service: ' + tipo_servicio)
																console.log(orders_type_service.length)	

																// Enviando ordenes de trabajo filtradas
																res.status(200).json({
																	status: 'ok',
																	work_orders: {
																		pendiente:   new_orders_status_pendientes,
																		en_curso:    new_orders_status_en_curso,
																		resuelto:    new_orders_status_resueltas,
																		no_resuelto: new_orders_status_no_resueltas,
																		cancelado:   new_orders_status_cancelado,
																		reportado:   new_orders_status_reportado
																	}
																})

															})


														})

													})

												})

											})

										})

									} else {
										res.status(200).json({
											status: 'error',
											message: 'El servicio, solo puede ser tipo_servicio_P o tipo_servicio_C'
										})
									}

								} else {
									res.status(200).json({
										status: 'error',
										message: 'El campo, codigo de contratista no es correcto'
									})

								}

							} else {
								res.status(200).json({
									status: 'not_found',
									message: 'No hay ordenes de trabajo del día'
								})

							}

						}

					} else {
						// Ordens No public

						// Filtrando por public === false
						var orders_public = work_orders.filter(function (element) {
							return element.public === false
						})

						if(orders_public.length === 0) {

							console.log('No hay ordenes de trabajo no publicas en la base de datos')

							res.status(200).json({
								status: 'not_found',
								message: 'No hay ordenes de trabajo del día'
							})

						} else {

							console.log('----------------')
							console.log('ORDENES NO PUBLICAS')
							console.log(orders_public.length)
							console.log('----------------')

							var orders_date_filter_custon = []

							// Filtrando por fecha_filter: A (inicio) and B(final)
							var date_select_to_filter_A = new Date(req.body.fecha_filter_a) // fecha de inicio
							var date_select_to_filter_B = new Date(req.body.fecha_filter_b) // fecha de fin

							console.log('Fecha A')
							console.log(date_select_to_filter_A)

							console.log('Fecha B')
							console.log(date_select_to_filter_B)

							if(typeof(date_select_to_filter_A) === "object" &&
							   typeof(date_select_to_filter_B) === "object") {

								// Fecha de marcado A
								var RTimeA = new Date(date_select_to_filter_A)
								var monthA = RTimeA.getMonth() + 1   // 0 - 11 *
								var dayA = RTimeA.getDate() + 1        // 1- 31  *
								var yearA = RTimeA.getFullYear()     // año   *

								// Fecha de marcado B
								var RTimeB = new Date(date_select_to_filter_B)
								var monthB = RTimeB.getMonth() + 1   // 0 - 11 *
								var dayB = RTimeB.getDate() + 1         // 1- 31  *
								var yearB = RTimeB.getFullYear()     // año   *

								console.log('Fecha Limite A')
								console.log(dayA + '/' + monthA + '/' + yearA)

								console.log('---------------')
								console.log('---------------')

								console.log('Fecha Limite B')
								console.log(dayB + '/' + monthB + '/' + yearB)

								console.log('---------------')
								console.log('---------------')


								for(var d = 0; d <= orders_public.length - 1; d++) {

									var element_order = orders_public[d]

									console.log('---------------')

									console.log('ELEMENTO ' + d)
									console.log(element_order.fecha_publicado)

									// Comparando con fecha de publicado de la orden
									var RTime = new Date(element_order.fecha_publicado)
									var month1 = RTime.getMonth() + 1   // 0 - 11 *
									var day1 = RTime.getDate()          // 1- 31  *
									var year1 = RTime.getFullYear()     // año   *

									console.log('Fecha de elemento')
									console.log(day1 + '/' + month1 + '/' + year1)

									console.log('---------------')

									if(day1 >= dayA && day1 <= dayB &&
									   month1 >= monthA && month1 <= monthB &&
									   year1 >= yearA && year1 <= yearB) {

										// Añadiendo al arreglo de filtrado por fecha 
										 orders_date_filter_custon.push(element_order)
										 
									}

								}

								console.log(orders_date_filter_custon.length)
								console.log('CICLO TERMINADO -----')

								var orders_empresa_select = []

								if(orders_date_filter_custon.length !== 0) {
									// Filtrando por id de contratista
									if(codigo_contratista !== '' &&
									   codigo_contratista !== undefined) {

										// Filtrando por empresa
										var orders_empresa = orders_date_filter_custon.filter(function (element) {
											return element.empresa_admin === req.user.empresa_admin
										})
										
										// Filtrando Ordenes por supervisor
										var orders_supervisor_here = []
										var supervisor_user = JSON.stringify(req.user._id)
										supervisor_user = JSON.parse(supervisor_user)

										// Evaluando el tipo de usuario
										if(req.user.permiso === users_type.officers) {

											orders_supervisor_here = orders_empresa.filter(function (element) {
												return element.codigo_supervisor === supervisor_user
											})

										} else {

											orders_supervisor_here = orders_empresa

										}
	
										// Filtrando todos las ordenes dentro de la empresa y todos los contratistas
										if(codigo_contratista === 'all') {
											orders_empresa_select = orders_supervisor_here
										
										} else {
											// FIltrando por contratista. Parametro pasado
											orders_empresa_select = orders_supervisor_here.filter(function (element) {
												return element.contratista === codigo_contratista
											})
										}
										
										// Filtrando por tipo de servicio
										if(tipo_servicio === 'tipo_servicio_P' ||
										   tipo_servicio === 'tipo_servicio_C') {

											var orders_type_service = orders_empresa_select.filter(function (element) {
												return element.tipo_servicio === tipo_servicio
											})

											// Filtrando por estado de la orden

											// Pendientes 
											var orders_status_pendientes = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.pendiente
											})

											// 	Reprogramadas
											var orders_status_reprogramado = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.reprogramado
											})

											// No Asignadas
											var orders_status_no_asignado = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.no_asignado
											})

											console.log('-----------------------')
											console.log('PENDIENTES')
											console.log(orders_status_pendientes.length)
											console.log('-----------------------')

											console.log('-----------------------')
											console.log('REPROGRAMADAS')
											console.log(orders_status_reprogramado.length)
											console.log('-----------------------')

											console.log('-----------------------')
											console.log('NO ASIGNADAS')
											console.log(orders_status_no_asignado.length)
											console.log('-----------------------')
										

											console.log('----------------')
											console.log('ORDENES NO PUBLICAS')
											console.log(orders_public.length)
											console.log('----------------')

											console.log('----------------')
											console.log('ORDENES FECHA')
											console.log(orders_date_filter_custon.length)
											console.log('----------------')

											console.log('----------------')
											console.log('Hoy de la empresa')
											console.log(orders_empresa.length)
											console.log('----------------')

											console.log('----------------')
											console.log('Para el supervidor')
											console.log(orders_supervisor_here.length)
											console.log('----------------')

											console.log('Filtrado por contratista: ' + codigo_contratista)
											console.log(orders_empresa_select.length)

											console.log('Filtrado por service: ' + tipo_servicio)
											console.log(orders_type_service.length)	

											
											
											var new_orders_status_pendientes = []
											var new_orders_status_reprogramado = []
											var new_orders_status_no_asignado = []


											console.log('ANTES DE entrar')

											// Obteniendo datos de copy de la orden
											BuildWorkFilters(orders_status_pendientes, function (err, orders_status_pendientes1) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														error: err
													})
												}


												new_orders_status_pendientes = orders_status_pendientes1


												BuildWorkFilters(orders_status_reprogramado, function (err, orders_status_reprogramado1) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															error: err
														})
													}


													new_orders_status_reprogramado = orders_status_reprogramado1

													BuildWorkFilters(orders_status_no_asignado, function (err, orders_status_no_asignado1) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																error: err
															})
														}

														new_orders_status_no_asignado = orders_status_no_asignado1

														console.log('-----------------------')
														console.log('PENDIENTES new_')
														console.log(new_orders_status_pendientes.length)
														console.log('-----------------------')

														console.log('-----------------------')
														console.log('REPROGRAMADAS new_')
														console.log(new_orders_status_reprogramado.length)
														console.log('-----------------------')

														console.log('-----------------------')
														console.log('NO ASIGNADAS new_')
														console.log(new_orders_status_no_asignado.length)
														console.log('-----------------------')
														


														console.log('----------------')
														console.log('ORDENES NO PUBLICAS')
														console.log(orders_public.length)
														console.log('----------------')

														console.log('----------------')
														console.log('ORDENES FECHA')
														console.log(orders_date_filter_custon.length)
														console.log('----------------')

														console.log('----------------')
														console.log('Hoy de la empresa')
														console.log(orders_empresa.length)
														console.log('----------------')

														console.log('----------------')
														console.log('Para el supervidor')
														console.log(orders_supervisor_here.length)
														console.log('----------------')

														console.log('Filtrado por contratista: ' + codigo_contratista)
														console.log(orders_empresa_select.length)

														console.log('Filtrado por service: ' + tipo_servicio)
														console.log(orders_type_service.length)	
														
														// Enviando ordenes de trabajo filtradas
														res.status(200).json({
															status: 'ok',
															work_orders: {
																pendiente:     new_orders_status_pendientes,
																reprogramado:  new_orders_status_reprogramado,
																no_asignado:   new_orders_status_no_asignado
															}
														})

													})

												})

											})

										} else if (tipo_servicio === 'all') {

											var orders_type_service = orders_empresa_select
											// Filtrando por estado de la orden

											// Pendientes 
											var orders_status_pendientes = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.pendiente
											})

											// 	Reprogramadas
											var orders_status_reprogramado = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.reprogramado
											})

											// No Asignadas
											var orders_status_no_asignado = orders_type_service.filter(function (element) {
												return element.estado === work_order_status.no_asignado
											})

											console.log('-----------------------')
											console.log('PENDIENTES')
											console.log(orders_status_pendientes.length)
											console.log('-----------------------')

											console.log('-----------------------')
											console.log('PENDIENTES')
											console.log(orders_status_reprogramado.length)
											console.log('-----------------------')

											console.log('-----------------------')
											console.log('PENDIENTES')
											console.log(orders_status_no_asignado.length)
											console.log('-----------------------')
											


											console.log('----------------')
											console.log('ORDENES NO PUBLICAS')
											console.log(orders_public.length)
											console.log('----------------')

											console.log('----------------')
											console.log('ORDENES FECHA')
											console.log(orders_date_filter_custon.length)
											console.log('----------------')

											console.log('----------------')
											console.log('Hoy de la empresa')
											console.log(orders_empresa.length)
											console.log('----------------')

											console.log('----------------')
											console.log('Para el supervidor')
											console.log(orders_supervisor_here.length)
											console.log('----------------')

											console.log('Filtrado por contratista: ' + codigo_contratista)
											console.log(orders_empresa_select.length)

											console.log('Filtrado por service: ' + tipo_servicio)
											console.log(orders_type_service.length)	

											var new_orders_status_pendientes = []
											var new_orders_status_reprogramado = []
											var new_orders_status_no_asignado = []


											console.log('ANTES DE entrar')

											// Obteniendo datos de copy de la orden
											BuildWorkFilters(orders_status_pendientes, function (err, orders_status_pendientes1) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														error: err
													})
												}


												new_orders_status_pendientes = orders_status_pendientes1


												BuildWorkFilters(orders_status_reprogramado, function (err, orders_status_reprogramado1) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															error: err
														})
													}


													new_orders_status_reprogramado = orders_status_reprogramado1

													BuildWorkFilters(orders_status_no_asignado, function (err, orders_status_no_asignado1) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																error: err
															})
														}

														new_orders_status_no_asignado = orders_status_no_asignado1

														console.log('-----------------------')
														console.log('PENDIENTES new_')
														console.log(new_orders_status_pendientes.length)
														console.log('-----------------------')

														console.log('-----------------------')
														console.log('REPROGRAMADAS new_')
														console.log(new_orders_status_reprogramado.length)
														console.log('-----------------------')

														console.log('-----------------------')
														console.log('NO ASIGNADAS new_')
														console.log(new_orders_status_no_asignado.length)
														console.log('-----------------------')
														


														console.log('----------------')
														console.log('ORDENES NO PUBLICAS')
														console.log(orders_public.length)
														console.log('----------------')

														console.log('----------------')
														console.log('ORDENES FECHA')
														console.log(orders_date_filter_custon.length)
														console.log('----------------')

														console.log('----------------')
														console.log('Hoy de la empresa')
														console.log(orders_empresa.length)
														console.log('----------------')

														console.log('----------------')
														console.log('Para el supervidor')
														console.log(orders_supervisor_here.length)
														console.log('----------------')

														console.log('Filtrado por contratista: ' + codigo_contratista)
														console.log(orders_empresa_select.length)

														console.log('Filtrado por service: ' + tipo_servicio)
														console.log(orders_type_service.length)	

														// Enviando ordenes de trabajo filtradas
														res.status(200).json({
															status: 'ok',
															work_orders: {
																pendiente:     new_orders_status_pendientes,
																reprogramado:  new_orders_status_reprogramado,
																no_asignado:   new_orders_status_no_asignado
															}
														})

													})

												})

											})

										} else {
											res.status(200).json({
												status: 'error',
												message: 'El servicio, solo puede ser tipo_servicio_P o tipo_servicio_C'
											})

										}

									} else {
										res.status(200).json({
											status: 'error',
											message: 'El campo, codigo de contratista no es correcto'
										})

									}

								} else {
									res.status(200).json({
										status: 'not_found',
										message: 'No hay ordenes de trabajo del día'
									})
								}

							} else {

								res.status(200).json({
									status: 'error',
									message: 'Los parametros de fecha, de A y B no han sido enviados'
								})

							}

						}

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
	})

	// >> Elemento type orden de trabajo

	// API: CREATE - Poste o cliente item a una orden de trabajo
	app.post('/dashboard/ordenes_trabajo/:work_order_id/add-item/:type_service', isLoggedIn, function (req, res){
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
			
			var work_order_id = req.params.work_order_id
			var type_service = req.params.type_service

			if(type_service === 'poste' ||
			   type_service === 'cliente') {

				Work_Order.findById({'_id': work_order_id}, function (err, work_order) {
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Error al encontrar la orden de trabajo en la base de datos',
						  error: err
						})
					}

					if(work_order) {

						// Insertando nuevo elemento
						if(work_order.tipo_servicio === 'tipo_servicio_P') {
							// Insertando nuevo poste al array de postes
							// Creando nuevo poste
							var new_poste_item = new Poste({
								codigo_poste: 		  '',
								codigo_orden_trabajo: work_order.codigo_orden,
								type_poste: 		  '',
								altura_poste: 		  '',
								type_material: 		  '',
								type_pastoral: 		  '',
								type_luminaria: 	  '',
								type_lampara: 	      '',
								coordenada_X: 		  '',
								coordenada_Y:    	  '',
								observaciones: 		  '',
								estado_poste: 	   	  '',
								estado_pastoral:      '',
								estado_luminaria: 	  '',
								estado_lampara:  	  ''
							})

							// Agregando imagen por defecto en el elemento
							new_poste_item.imagen_poste.push({
								path: '/images/elemento_defaul.png',
								mimetype: 'default',
								position: new_poste_item.imagen_poste.length + 1
							})

							new_poste_item.save(function (err) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error al guardar nuevo poste',
									  error: err
									})
								}

								// Obteniendo numero de orden en el arreglo
					   			var num_order_element11 = work_order.elementos.length + 1

								work_order.elementos.push({
									_id: new_poste_item._id,
									image_element: { 
										path: new_poste_item.imagen_poste[0].path
									},
									type: 'poste',
									position: num_order_element11
								})

								// Guardando en la orden de trabajo
								work_order.save(function (err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar nuevo elemento en la orden de trabajo',
										  error: err
										})
									}

									console.log('Elemento integrado en la orden de trabajo')
									var service = new_poste_item

									console.log(new_poste_item)

									// Render de del contenido de la orden de trabajo
									//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/poste_form/index.jade', {
									//	status: 'ok',
									//	message: 'Orden de trabajo actualizada: nuevo item incluido',
								   	//	user: req.user,
								   	//	work_order: work_order,
									//	type_service: type_service,
									//	service: service,
									//	codigo_work_order: service.codigo_orden_trabajo
									//})

									res.status(200).json({
										status: 'ok',
										message: 'Orden de trabajo actualizada: nuevo item incluido',
								   		user: req.user,
								   		work_order: work_order,
										type_service: type_service,
										service: service,
										codigo_work_order: service.codigo_orden_trabajo
									})

	 							})
							
							})

						} else if(work_order.tipo_servicio === 'tipo_servicio_C') {
							// Insertando nuevo cliente al array de clientes
							// Creado nuevo cliente
							var new_cliente_item = new Cliente({
								cliente_id:  			 '',
								codigo_orden_trabajo:    work_order.codigo_orden,
								numero_cliente: 		 '',
								codigo_via: 	   		 '',  // nombre vida
								distrito: 				 '',  // distrito
								urbanizacion: 			 '', 
								numero_puerta: 			 '',
								numero_interior: 		 '',
								manzana: 				 '',
								lote: 					 '',
								nombre_de_cliente: 		 '',
								type_residencial:  		 '',
								is_maximetro_bt: 		 '',
								suministro_derecha:  	 {
									coordX: '',
									coordY: '',
									value:  ''
								},
								suministro_izquierda:    {
									coordX: '',
									coordY: '',
									value:  ''
								},
								poste_cercano:           {
									coordX: '',
									coordY: '',
									value:  ''
								},
								medidor_derecha:    	 '',
								medidor_izquierda:  	 '',
								type_conexion: 			 '',
								type_acometida: 		 '',
								type_cable_acometida:    '',
								calibre_cable_acometida: '',
								calibre_cable_matriz:    '',
								observaciones: 			 '',
								fecha_ejecucion: 		 '',
								croquis: 				 '',
								coordenada_X: 			 '',
								coordenada_Y: 			 ''
							})

							// Agregando imagen por defecto en el elemento
							new_cliente_item.imagen_cliente.push({
								path: '/images/elemento_defaul.png',
								mimetype: 'default',
								position: new_cliente_item.imagen_cliente.length + 1
							})

							new_cliente_item.save(function (err) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error al guardar nuevo cliente',
									  error: err
									})
								}
								
								// Obteniendo numero de orden en el arreglo
					   			var num_order_element22 = work_order.elementos.length + 1

								// Alcenando nuevo elemento dentro de la orden de tabajo
								work_order.elementos.push({
									_id: new_cliente_item._id,
									image_element: { 
										path: new_cliente_item.imagen_cliente[0].path
									},
									type: 'cliente',
									position: num_order_element22
								})

								// Guardando en la orden de trabajo
								work_order.save(function (err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar nuevo elemento en la orden de trabajo',
										  error: err
										})
									}

									console.log('Elemento integrado en la orden de trabajo')
									var service = new_cliente_item

									console.log(service)

									//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/poste_form/index.jade',{
									//	status: 'ok',
									//	message: 'Orden de trabajo actualizada: nuevo item incluido',
								   	//	user: req.user,
								   	//	work_order: work_order,
									//	type_service: type_service,
									//	service: service,
									//	codigo_work_order: service.codigo_orden_trabajo
									//})

									// Render de la orden de trabajo
									res.status(200).json({
									    status: 'ok',
										message: 'Orden de trabajo actualizada: nuevo item incluido',
								   		user: req.user,
								   		work_order: work_order,
										type_service: type_service,
										service: service,
										codigo_work_order: service.codigo_orden_trabajo
									})

	 							})

							})						
							
						} else {
							console.log('Error, el tipo de parametro en work_order no es correcto')

							res.status(200).json({
								status: 'not_found',
								message: 'Error, el tipo de parametro tipo_servicio, en la orden de trabajo no es correcto'
							})

						}

					} else {

						console.log('La orden de trabajo no fue encontrada')
						res.status(200).json({
							status: 'not_found',
							message: 'Error, La orden de trabajo no fue encontrada'
						})

					}

				})

			} else {
				res.status(200).json({
					status: 'not_found',
					message: 'Error al pasar parametros del usuario'
				})
			}
			
		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// API - UPDATE - item work order Actualizando datos del servicio: poste o cliente
	app.put('/dashboard/ordenes_trabajo/:work_order_id/item/:type_service/:service_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
			
			var type_service = req.params.type_service
			var service_id = req.params.service_id
			var work_order_id = req.params.work_order_id

			// Obteniendo datos de la orden de trabajo
			Work_Order.findById({'_id': work_order_id }, function (err, work_order_item) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar la orden de trabajo en la base de datos',
					  error: err
					})
				}

				var encontrado = false
				var type_element = ''

				console.log('Orden de trabajo encontrada')
				console.log(work_order_item)

				// Verificando si el id de elemento poste o cliente existe en la orden de trabajo
				for(var t = 0; t <= work_order_item.elementos.length - 1; t++) {
					var elemento = work_order_item.elementos[t]
					
					console.log(elemento)

					var element_a = JSON.stringify(elemento._id)
					element_a = JSON.parse(element_a)

					//validando coincidencia
					if(element_a === service_id) {
						encontrado = true
						type_element = elemento.type

						break
					} 

				}

				// Validando si el elemento de la orden, buscado por id pasado fue encontrado
				if(encontrado === true) {
					
					if(type_service === 'poste' && type_element === 'poste') {
						console.log('El tipo de servicio es poste')
						// actualizar data del poste
						
						Poste.findById({'_id': service_id}, function (err, poste_find1){
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al encontrar un poste',
								  error: err
								})
							}
							
							var data_1 = {
								codigo_poste: 		  req.body.codigo_poste || poste_find1.codigo_poste,
								type_poste: 		  req.body.type_poste || poste_find1.type_poste,
								altura_poste: 		  req.body.altura_poste || poste_find1.altura_poste,
								type_material: 		  req.body.type_material || poste_find1.type_material,
								type_pastoral: 		  req.body.type_pastoral || poste_find1.type_pastoral,
								type_luminaria: 	  req.body.type_luminaria || poste_find1.type_luminaria,
								type_lampara: 	      req.body.type_lampara || poste_find1.type_lampara,
								coordenada_X: 		  req.body.coordenada_X || poste_find1.coordenada_X,
								coordenada_Y:    	  req.body.coordenada_Y || poste_find1.coordenada_Y,
								observaciones: 		  req.body.observaciones || poste_find1.observaciones,
								estado_poste: 	   	  req.body.estado_poste || poste_find1.estado_poste,
								estado_pastoral:      req.body.estado_pastoral || poste_find1.estado_pastoral,
								estado_luminaria: 	  req.body.estado_luminaria || poste_find1.estado_luminaria,
								estado_lampara:  	  req.body.estado_lampara || poste_find1.estado_lampara
							}

							// Actualizando multimedia dentro del elemento
							if(req.files.hasOwnProperty('new_file_upload')) {
								// Actualizando los datos del psote. Con Archivos multimedia
								console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
								
								// Validando path uploads ----
								var FilesCover = req.files.new_file_upload

								console.log(FilesCover)

								var path_file = FilesCover.path
								console.log(path_file)
								
								// Buscando contenido multimedia actual
								Poste.findById({'_id': service_id}, function (err, poste_find){
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al encontrar un poste',
										  error: err
										})
									}

									// Armando array con contenido multimedia
									data_1.imagen_poste = poste_find.imagen_poste

									// Asignando position 
									FilesCover.position = data_1.imagen_poste.length + 1

									// path uploads iniciales
									var uploads_1 = 'uploads/'
									var uploads_2 = 'uploads\\'

									if(poste_find.imagen_poste[0].mimetype === 'default') {
										// Validando reemplazo del inicio del path uploads
										if (path_file.indexOf(uploads_1) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads/','/')

										    // Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste[0] = FilesCover

										} else if (path_file.indexOf(uploads_2) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste[0] = FilesCover
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file)
										
										}

									} else {
										// Validando reemplazo del inicio del path uploads
										if (path_file.indexOf(uploads_1) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads/','/')

										    // Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste.push(FilesCover)

										} else if (path_file.indexOf(uploads_2) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste.push(FilesCover)
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file)
										
										}

									}

									console.log('---------------')

									console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
									console.log(FilesCover)

									console.log('---------------')

									// Validando Si es video
									if(FilesCover.extension === 'mp4') {

										ffmpeg(scope_path_system + '/uploads'+ FilesCover.path)
										  .screenshots({
										    timestamps: ['00:00.001'],
										    filename: FilesCover.name + '-%s-.png',
										    folder: scope_path_system + '/uploads/cover',
										    size: '320x240'
										  });

									}

									// Guardando datos multimedia
									Poste.update({'_id': service_id}, data_1, function (err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al actualizar data del poste',
											  error: err
											})
										}
										
										console.log('poste actualizado')

										// Buscando datos del elemento actualizado
										Poste.findById({'_id': service_id}, function (err, service_element) {
											if(err) {
												return res.status(500).json({
												  status: 'error_server',
												  message: 'Error al encontrar poste',
												  error: err
												})
											}

											console.log('Elemento actualizado')
											console.log(service_element)

											// Render del elemento con los datos guardado
											//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
										   	//	user: req.user,
										   	//	work_order: work_order_item,
											//	type_service: type_service,
											//	service: service_element,
											//	codigo_work_order: service_element.codigo_orden_trabajo
											//})

											res.status(200).json({
								   		   		user: req.user,
								   		   		work_order: work_order_item,
								   				type_service: type_service,
								   				service: service_element,
								   				codigo_work_order: service_element.codigo_orden_trabajo
											})

										})
										
									})

								})

							} else if (req.files.hasOwnProperty('new_file_upload_360')) {

								// Actualizando los datos del psote. Con Archivos multimedia
								console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
								
								// Validando path uploads ----
								var FilesCover = req.files.new_file_upload_360

								console.log(FilesCover)

								var path_file = FilesCover.path
								console.log(path_file)
								
								// Almacenando Galeria de fotos 360
								FilesCover.mimetype = 'image_360'

								// Buscando contenido multimedia actual
								Poste.findById({'_id': service_id}, function (err, poste_find){
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al encontrar un poste',
										  error: err
										})
									}

									// Armando array con contenido multimedia
									data_1.imagen_poste = poste_find.imagen_poste

									// Asignando position 
									FilesCover.position = data_1.imagen_poste.length + 1

									// path uploads iniciales
									var uploads_1 = 'uploads/'
									var uploads_2 = 'uploads\\'

									if(poste_find.imagen_poste[0].mimetype === 'default') {
										// Validando reemplazo del inicio del path uploads
										if (path_file.indexOf(uploads_1) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads/','/')

										    // Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste[0] = FilesCover

										} else if (path_file.indexOf(uploads_2) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste[0] = FilesCover
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file)
										
										}

									} else {
										// Validando reemplazo del inicio del path uploads
										if (path_file.indexOf(uploads_1) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads/','/')

										    // Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste.push(FilesCover)

										} else if (path_file.indexOf(uploads_2) != -1) {
										    FilesCover.path = FilesCover.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_1.imagen_poste.push(FilesCover)
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file)
										
										}

									}

									console.log('---------------')

									console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
									console.log(FilesCover)

									console.log('---------------')

									// Validando Si es video
									if(FilesCover.extension === 'mp4') {

										ffmpeg(scope_path_system + '/uploads'+ FilesCover.path)
										  .screenshots({
										    timestamps: ['00:00.001'],
										    filename: FilesCover.name + '-%s-.png',
										    folder: scope_path_system + '/uploads/cover',
										    size: '320x240'
										  });

									}

									// Guardando datos multimedia
									Poste.update({'_id': service_id}, data_1, function (err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al actualizar data del poste',
											  error: err
											})
										}
										
										console.log('poste actualizado')

										// Buscando datos del elemento actualizado
										Poste.findById({'_id': service_id}, function (err, service_element) {
											if(err) {
												return res.status(500).json({
												  status: 'error_server',
												  message: 'Error al encontrar poste',
												  error: err
												})
											}

											console.log('Elemento actualizado')
											console.log(service_element)

											// Render del elemento con los datos guardado
											//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
										   	//	user: req.user,
										   	//	work_order: work_order_item,
											//	type_service: type_service,
											//	service: service_element,
											//	codigo_work_order: service_element.codigo_orden_trabajo
											//})

											res.status(200).json({
								   		   		user: req.user,
								   		   		work_order: work_order_item,
								   				type_service: type_service,
								   				service: service_element,
								   				codigo_work_order: service_element.codigo_orden_trabajo
											})

										})
										
									})

								})	

							} else {
								// Actualizando los datos del poste. Sin Archivos multimedia
								console.log('Actualizando datos del POSTE. Efectuado con exito')

								// Guardando cambios sin datos multimedia
								Poste.update({'_id': service_id}, data_1, function (err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al actualizar data del poste',
										  error: err
										})
									}
									
									console.log('poste actualizado')

									// Buscando datos del elemento actualizado
									Poste.findById({'_id': service_id}, function (err, service_element) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al encontrar poste',
											  error: err
											})
										}

										console.log('Elemento actualizado')
										console.log(service_element)

										// Render del elemento con los datos guardado
										//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
									   	//	user: req.user,
									   	//	work_order: work_order_item,
										//	type_service: type_service,
										//	service: service_element,
										//	codigo_work_order: service_element.codigo_orden_trabajo
										//})

										res.status(200).json({
							   		   		user: req.user,
							   		   		work_order: work_order_item,
							   				type_service: type_service,
							   				service: service_element,
							   				codigo_work_order: service_element.codigo_orden_trabajo
										})

									})
									
								})

							}

						})

					} else if(type_service === 'cliente' && type_element === 'cliente'){

						Cliente.findById({'_id': service_id}, function (err, client_find1){
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al encontrar poste',
								  error: err
								})
							}
						
							// actualizar date del cliente
							var data_2 = {
								cliente_id:  			 req.body.cliente_id || client_find1.cliente_id,
								numero_cliente: 		 req.body.numero_cliente || client_find1.numero_cliente,
								codigo_via: 	   		 req.body.codigo_via || client_find1.codigo_via,
								distrito: 				 req.body.distrito || client_find1.distrito,
								urbanizacion: 			 req.body.urbanizacion || client_find1.urbanizacion, 
								numero_puerta: 			 req.body.numero_puerta || client_find1.numero_puerta,
								numero_interior: 		 req.body.numero_interior || client_find1.numero_interior,
								manzana: 				 req.body.manzana || client_find1.manzana,
								lote: 					 req.body.lote || client_find1.lote,
								nombre_de_cliente: 		 req.body.nombre_de_cliente || client_find1.nombre_de_cliente,
								type_residencial:  		 req.body.type_residencial || client_find1.type_residencial,
								is_maximetro_bt: 		 req.body.is_maximetro_bt || client_find1.is_maximetro_bt,
								suministro_derecha:  	 req.body.suministro_derecha || client_find1.suministro_derecha,
								suministro_izquierda:    req.body.suministro_izquierda || client_find1.suministro_izquierda,
								medidor_derecha:    	 req.body.medidor_derecha || client_find1.medidor_derecha,
								medidor_izquierda:  	 req.body.medidor_izquierda || client_find1.medidor_izquierda,
								poste_cercano:  		 req.body.poste_cercano || client_find1.poste_cercano,
								type_conexion: 			 req.body.type_conexion || client_find1.type_conexion,
								type_acometida: 		 req.body.type_acometida || client_find1.type_acometida,
								type_cable_acometida:    req.body.type_cable_acometida || client_find1.type_cable_acometida,
								calibre_cable_acometida: req.body.calibre_cable_acometida || client_find1.calibre_cable_acometida,
								calibre_cable_matriz:    req.body.calibre_cable_matriz || client_find1.calibre_cable_matriz,
								observaciones: 			 req.body.observaciones || client_find1.observaciones,
								fecha_ejecucion: 		 req.body.fecha_ejecucion || client_find1.fecha_ejecucion,
								coordenada_X: 			 req.body.coordenada_X || client_find1.coordenada_X,
								coordenada_Y: 			 req.body.coordenada_Y || client_find1.coordenada_Y
							}

							// Actualizando multimedia dentro del elemento
							if(req.files.hasOwnProperty('new_file_upload')) {
								// Actualizando los datos del cliente. Con Archivos multimedia
								console.log('Actualizando datos del CLIENTE. Con Archivo multimedia subido')

								// Validando path uploads ----
								var FilesCover2 = req.files.new_file_upload
								console.log(FilesCover2)

								var path_file2 = FilesCover2.path
								console.log(path_file2)
								
								Cliente.findById({'_id': service_id}, function (err, client_find){
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al encontrar cliente',
										  error: err
										})
									}

									// Armando arreglo con los archivos multimedia
									data_2.imagen_cliente = client_find.imagen_cliente

									// Asignando position 
									FilesCover2.position = data_2.imagen_cliente.length + 1

									// path uploads iniciales
									var uploads_11 = 'uploads/'
									var uploads_22 = 'uploads\\'

									if(client_find.imagen_cliente[0].mimetype === 'default') {
										// Validando reemplazo del inicio del path uploads
										if (path_file2.indexOf(uploads_11) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads/','/')

										   // Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente[0] = FilesCover2

										} else if (path_file2.indexOf(uploads_22) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente[0] = FilesCover2
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file2)
										
										}

									} else {
										// Validando reemplazo del inicio del path uploads
										if (path_file2.indexOf(uploads_11) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads/','/')

										   // Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente.push(FilesCover2)

										} else if (path_file2.indexOf(uploads_22) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente.push(FilesCover2)
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file2)
										
										}

									}
									
									console.log('---------------')

									console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
									console.log(FilesCover2)

									console.log('---------------')

									// Validando Si es video
									if(FilesCover2.extension === 'mp4') {

										ffmpeg(scope_path_system + '/uploads'+ FilesCover2.path)
										  .screenshots({
										    timestamps: ['00:00.001'],
										    filename: FilesCover2.name + '-%s-.png',
										    folder: scope_path_system + '/uploads/cover',
										    size: '320x240'
										  });
										
									}

									Cliente.update({'_id': service_id}, data_2, function (err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al encontrar cliente ne la base de datos',
											  error: err
											})
										}
										console.log('Se actualizo data del cliente en la base de datos')
										

										// Buscando datos del elemento actualizado
										Cliente.findById({'_id': service_id}, function (err, service_element) {
											if(err) {
												return res.status(500).json({
												  status: 'error_server',
												  message: 'Error al encontrar poste',
												  error: err
												})
											}
											
											console.log('Elemento actualizado')
											console.log(service_element)

											// Render del elemento con los datos guardados
											//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
										   	//	user: req.user,
										   	//	work_order: work_order_item,
											//	type_service: type_service,
											//	service: service_element,
											//	codigo_work_order: service_element.codigo_orden_trabajo
											//})

											res.status(200).json({
								   		   		user: req.user,
								   		   		work_order: work_order_item,
								   				type_service: type_service,
								   				service: service_element,
								   				codigo_work_order: service_element.codigo_orden_trabajo
											})

										})

									})

								})

							} else if (req.files.hasOwnProperty('new_file_upload_360')) {

								// Actualizando los datos del cliente. Con Archivos multimedia
								console.log('Actualizando datos del CLIENTE. Con Archivo multimedia subido')

								// Validando path uploads ----
								var FilesCover2 = req.files.new_file_upload_360
								console.log(FilesCover2)

								var path_file2 = FilesCover2.path
								console.log(path_file2)
								
								// Almacenando Galeria de fotos 360
								FilesCover2.mimetype = 'image_360'
								
								Cliente.findById({'_id': service_id}, function (err, client_find){
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al encontrar cliente',
										  error: err
										})
									}

									// Armando arreglo con los archivos multimedia
									data_2.imagen_cliente = client_find.imagen_cliente

									// Asignando position 
									FilesCover2.position = data_2.imagen_cliente.length + 1

									// path uploads iniciales
									var uploads_11 = 'uploads/'
									var uploads_22 = 'uploads\\'

									if(client_find.imagen_cliente[0].mimetype === 'default') {
										// Validando reemplazo del inicio del path uploads
										if (path_file2.indexOf(uploads_11) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads/','/')

										   // Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente[0] = FilesCover2

										} else if (path_file2.indexOf(uploads_22) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente[0] = FilesCover2
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file2)
										
										}

									} else {
										// Validando reemplazo del inicio del path uploads
										if (path_file2.indexOf(uploads_11) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads/','/')

										   // Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente.push(FilesCover2)

										} else if (path_file2.indexOf(uploads_22) != -1) {
										    FilesCover2.path = FilesCover2.path.replace('uploads\\','/')

											// Agregando nuevo contenido multimedia al elemento
											data_2.imagen_cliente.push(FilesCover2)
										
										} else {
										    console.log('Ocurrió un error con el path')
										    console.log(path_file2)
										
										}

									}
									
									console.log('---------------')

									console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
									console.log(FilesCover2)

									console.log('---------------')

									// Validando Si es video
									if(FilesCover2.extension === 'mp4') {

										ffmpeg(scope_path_system + '/uploads'+ FilesCover2.path)
										  .screenshots({
										    timestamps: ['00:00.001'],
										    filename: FilesCover2.name + '-%s-.png',
										    folder: scope_path_system + '/uploads/cover',
										    size: '320x240'
										  });
										
									}

									Cliente.update({'_id': service_id}, data_2, function (err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al encontrar cliente ne la base de datos',
											  error: err
											})
										}
										console.log('Se actualizo data del cliente en la base de datos')
										

										// Buscando datos del elemento actualizado
										Cliente.findById({'_id': service_id}, function (err, service_element) {
											if(err) {
												return res.status(500).json({
												  status: 'error_server',
												  message: 'Error al encontrar poste',
												  error: err
												})
											}
											
											console.log('Elemento actualizado')
											console.log(service_element)

											// Render del elemento con los datos guardados
											//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
										   	//	user: req.user,
										   	//	work_order: work_order_item,
											//	type_service: type_service,
											//	service: service_element,
											//	codigo_work_order: service_element.codigo_orden_trabajo
											//})

											res.status(200).json({
								   		   		user: req.user,
								   		   		work_order: work_order_item,
								   				type_service: type_service,
								   				service: service_element,
								   				codigo_work_order: service_element.codigo_orden_trabajo
											})

										})

									})

								})

							} else {
								// Actualizando los datos del cliente. Sin archivo multimedia
								console.log('Actualizando datos del CLIENTE. Efectuado sin archivo multimedia')

								Cliente.update({'_id': service_id}, data_2, function (err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al encontrar cliente ne la base de datos',
										  error: err
										})
									}
									console.log('Se actualizo data del cliente en la base de datos')				

									// Buscando datos del elemento actualizado
									Cliente.findById({'_id': service_id}, function (err, service_element) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al encontrar poste',
											  error: err
											})
										}
										
										console.log('Elemento actualizado')
										console.log(service_element)

										// Render del elemento con los datos guardados
										//res.render('./admin/dashboard/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
									   	//	user: req.user,
									   	//	work_order: work_order_item,
										//	type_service: type_service,
										//	service: service_element,
										//	codigo_work_order: service_element.codigo_orden_trabajo
										//})

										res.status(200).json({
							   		   		user: req.user,
							   		   		work_order: work_order_item,
							   				type_service: type_service,
							   				service: service_element,
							   				codigo_work_order: service_element.codigo_orden_trabajo
										})

									})

								})

							}

						})
					
					} else {

						// El parametro de type_service no es correcto
						console.log('Error: el parametro type_service, no es correcto')
						res.status(200).json({
							status: 'not_found',
							message: 'Error: el parametro type_service, no es correcto',
					   		user: req.user,
							work_order: work_order_item
						})
					}

				} else {
					// el elemento buscado no fue encontrado dentro de esta orden de trabajo

					// Render de la orden de trabajo
					//res.render('/admin/dashboard/ordenes_trabajo/work_order_item/index.jade', {
		   			//	status: 'not_found',
		   			//	message: 'El elemento no fue encontrado dentro de la orden de trabajo'
		   		   	//	user: req.user,
		   			//	work_order: work_order_item
					//})

					res.status(200).json({
						status: 'not_found',
						message: 'El elemento no fue encontrado dentro de la orden de trabajo',
				   		user: req.user,
						work_order: work_order_item
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
	})

	// API: DELETE - Eliminando servicio dentro de la orden de trabajo por id
	app.delete('/dashboard/ordenes_trabajo/:work_order_id/delete/:type_service/:service_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
		   
		   var type_service = req.params.type_service
		   var service_id = req.params.service_id
		   var work_order_id = req.params.work_order_id

		   if(type_service === 'poste' ||
		      type_service === 'cliente') {

		   		Work_Order.findById({'_id': work_order_id}, function (err, work_order_2) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar la orden de trabajo en la base de datos',
		   				  error: err
		   				})
		   			}

		   			if(work_order_2) {
					   	// Buscando en postes
					   	var encontrado_to_delete = false
					   	var position = ''

					   	console.log('Orden de trabajo elementos')

					   	console.log(work_order_2.elementos)
					   	console.log(encontrado_to_delete)

					   	// Recorriendo los elemento dentro de la orden de trabajo
					   	for(var t = 0; t <= work_order_2.elementos.length - 1; t++) {
					   		var el_item =  work_order_2.elementos[t]

					   		var new_el_item = JSON.stringify(el_item._id)
					   		new_el_item = JSON.parse(new_el_item)

					   		if( new_el_item=== service_id) {
					   			console.log('Elemento encontrado')
					   			console.log(service_id)

					   			encontrado_to_delete = true
					   			position = t
					   			break
					   		}
					   	}

					   	// Validando para eliminar
					   	if(encontrado_to_delete === true) {
					   		// Eliminando elemento de la orden de trabajo
					   		work_order_2.elementos.splice(position,1)

					   		console.log('La orden de trabjao fue eliminada')
					   		
					   		work_order_2.save(function (err) {
					   			if(err) {
					   				return res.status(500).json({
					   				  status: 'error_server',
					   				  message: 'Error al eliminar la orden de trabajo',
					   				  error: err
					   				})
					   			}
					   			console.log('Se guardaron los nuevos cambios en la orden de trabajo')

					   		})

					   		res.status(200).json({
					   			status: 'ok',
					   			message: 'Elemento eliminado',
					   			user: req.user
					   		})

					   	} else if(encontrado_to_delete === false){
					   		// El elemento no fue encontrado. No se elimino el elemento solicitado
					   		res.status(200).json({
					   			status: 'not_found',
					   			message: 'El elemento solicitado a eliminar de la orden de trabajo no se encontro. No eliminado',
					   			user: req.user
					   		})

					   	} else {
					   		// El elemento no fue encontrado. No se elimino el elemento solicitado
					   		res.status(200).json({
					   			status: 'not_found',
					   			message: 'El elemento solicitado a eliminar de la orden de trabajo no se encontro. No eliminado',
					   			user: req.user
					   		})

					   	}

		   			} else {
		   				console.log('La orden de trabajo no fue encontrada')
		   				res.status(200).json({
		   					status: 'not_found',
		   					message: 'Error, La orden de trabajo no fue encontrada'
		   				})
		   			}
		   		})
		   
		   } else {
			   	res.status(200).json({
			   		status: 'not_found',
			   		message: 'Error al pasar parametros del usuario'
			   	})
		   }
		  
		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// API: DELETE - Eliminando contenido multimedia de un elemento, de orden de trabajo
	app.delete('/dashboard/ordenes_trabajo/:work_order_id/delete/:type_service/:service_id/item/:position', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
		   
		   var type_service = req.params.type_service
		   var service_id = req.params.service_id
		   var work_order_id = req.params.work_order_id
		   var position_to_delete = req.params.position

		   position_to_delete = Number(position_to_delete) - 1

		   if(type_service === 'poste' ||
		      type_service === 'cliente') {

		   		Work_Order.findById({'_id': work_order_id}, function (err, work_order_3) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar la orden de trabajo en la base de datos',
		   				  error: err
		   				})
		   			}

		   			if(work_order_3) {
		   				// Valiando el tipo de elemento en la orden de trabajo
		   				if(type_service === 'poste') {
		   					// El tipo de servicio es poste
		   					Poste.findById({'_id': service_id}, function (err, poste_find_now) {
		   						if(err) {
		   							return res.status(500).json({
		   							  status: 'error_server',
		   							  message: 'Error al encontrar poste en la base de datos',
		   							  error: err
		   							})
		   						}

		   						// Buscando elemento multimedia para eliminar, por posicion
		   						poste_find_now.imagen_poste.splice(position_to_delete,1)

		   						// Guardando el cambio
		   						poste_find_now.save(function (err) {
		   							if(err) {
		   								return res.status(500).json({
		   								  status: 'error_server',
		   								  message: 'Error al guardar cambios en los datos del poste',
		   								  error: err
		   								})
		   							}

		   							// Estado de respuesta
		   							res.status(200).json({
		   								status: 'ok',
		   								message: 'Elemento multimedia, eliminado del poste',
		   								user: req.user,
		   								work_order: work_order_3,
		   								service: poste_find_now
		   							})

		   						})

		   					})

		   				} else {
		   					// El tipo de servicio es cliente
		   					Cliente.findById({'_id': service_id}, function (err, cliente_find_now) {
		   						if(err) {
		   							return res.status(500).json({
		   							  status: 'error_server',
		   							  message: 'Error al encontrar cliente en la base de datos',
		   							  error: err
		   							})
		   						}

		   						// Buscando elemento multimedia para eliminar, por posicion
		   						cliente_find_now.imagen_cliente.splice(position_to_delete,1)

		   						cliente_find_now.save(function (err) {
		   							if(err) {
		   								return res.status(500).json({
		   								  status: 'error_server',
		   								  message: 'Error al encontrar cliente en la base de datos',
		   								  error: err
		   								})
		   							}

		   							// Estado de respuesta
		   							res.status(200).json({
		   								status: 'ok',
		   								message: 'Elemento multimedia, eliminado del cliente',
		   								user: req.user,
		   								work_order: work_order_3,
		   								service: cliente_find_now
		   							})

		   						})

		   					})

		   				}

		   			} else {
		   				console.log('La orden de trabajo no fue encontrada')
		   				res.status(200).json({
		   					status: 'not_found',
		   					message: 'Error, La orden de trabajo no fue encontrada'
		   				})
		   			}

		   		})
		   
		   } else {
			   	res.status(200).json({
			   		status: 'not_found',
			   		message: 'Error al pasar parametros del usuario'
			   	})
		   }

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// Buscando todos los elementos (Poste o cliente) dentro de una orden de trabajo. Modo Lectura por codigo de orden
	app.post('/dashboard/ordenes_trabajo/buscar/:type_service', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
			
			var type_service = req.params.type_service
			var code_work_order = req.body.code_work_order

			console.log('tipo de servicio')
			console.log(type_service)

			console.log('code server')
			console.log(code_work_order)

			if(type_service === 'poste') {
				// Buscando en postes
				Poste.findOne({'codigo_orden_trabajo': code_work_order}, function (err, poste){
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Poste no fue encontrado en la base de datos',
						  error: err
						})
					}

					if(poste !== null) {
						 
						console.log('poste encontrado: ')
						console.log(poste)
						res.status(200).json({
							user: req.user,
							status: 'ok',
							type: 'poste',
							message: 'poste encontrado',
							service: poste
						})
					} else {
						res.status(200).json({
					   		user: req.user,
							status: 'not_found',
							message: 'poste no encontrado'
						})
					}

				})

			} else if (type_service === 'cliente'){
				// Buscandoe en clientes

				Cliente.findOne({'codigo_orden_trabajo': code_work_order}, function (err, cliente) {
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Cliente no fue encontrado en la base de datos',
						  error: err
						})
					}
					if(cliente !== null) {

						console.log('cliente encontrado: ')
						console.log(cliente)
						res.status(200).json({
					   		user: req.user,
							status: 'ok',
							type: 'cliente',
							message: 'cliente encontrado',
							service: cliente
						})
					} else {
						console.log('cliente no encontrado')
						res.status(200).json({
					   		user: req.user,
							status: 'not_found',
							message: 'cliente no encontrado'
						})
					}

				})
			} else {
				console.log('Error del parametro type_service solicitado') 
			}


		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// Buscando elementos (poste o cliente), por existencia de servicio: poste o cliente
	app.post('/dashboard/ordenes_trabajo/:type_service', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers) {
			
			var type_service = req.params.type_service
			var code_service = req.body.code_service

			console.log('tipo de servicio')
			console.log(type_service)

			console.log('code server')
			console.log(code_service)

			if(type_service === 'poste') {
				// Buscando en postes
				Poste.findOne({'codigo_poste': code_service}, function (err, poste){
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Poste no fue encontrado en la base de datos',
						  error: err
						})
					}

					if(poste !== null) {
						 
						console.log('poste encontrado: ')
						console.log(poste)
						res.status(200).json({
							user: req.user,
							status: 'ok',
							message: 'poste encontrado',
							poste: poste
						})
					} else {
						res.status(200).json({
					   		user: req.user,
							status: 'not_found',
							message: 'poste no encontrado'
						})
					}

				})

			} else if (type_service === 'cliente'){
				// Buscandoe en clientes

				Cliente.findOne({'cliente_id': code_service}, function (err, cliente) {
					if(err) {
						return res.status(500).json({
						  status: 'error_server',
						  message: 'Cliente no fue encontrado en la base de datos',
						  error: err
						})
					}
					if(cliente !== null) {

						console.log('cliente encontrado: ')
						console.log(cliente)
						res.status(200).json({
					   		user: req.user,
							status: 'ok',
							message: 'cliente encontrado',
							cliente: cliente
						})
					} else {
						console.log('cliente no encontrado')
						res.status(200).json({
					   		user: req.user,
							status: 'not_found',
							message: 'cliente no encontrado'
						})
					}

				})
			} else {
				console.log('Error del parametro type_service solicitado') 
			}

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})

		}
	})

	// Render - read - element type work order
	app.post('/dashboard/ordenes_trabajo/:work_order_id/read/:type_service/:service_id', isLoggedIn , function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins || 
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {
		   
		   var type_service = req.params.type_service
		   var service_id = req.params.service_id
		   var work_order_id = req.params.work_order_id
		   
		   // Validando el tipo de elemento a renderear
		   if(type_service === 'poste') {
		   		// Obteniendo poste por service_id
		   		Poste.findById({'_id': service_id}, function (err, poste) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar poste en la base de datos',
		   				  error: err
		   				})
		   			}

		   			// Reordenando, arreglo de contenido multimedia en el elemento
		   			for(var r = 0; r <= poste.imagen_poste.length - 1; r++) {
		   				poste.imagen_poste[r].position = r + 1
		   			}

		   			poste.save(function(err) {
		   				if(err) {
		   					return res.status(500).json({
		   					  status: 'error_server',
		   					  message: 'Error al guardar cambios en el poste, reordenar multimedia',
		   					  error: err
		   					})
		   				}

		   				// Armando nuevo arreglo
			   			var poste_render = {
			   				_id: 				  poste._id,
			   				codigo_poste: 		  poste.codigo_poste,
			   				codigo_orden_trabajo: poste.codigo_orden_trabajo,
			   				type_poste: 		  poste.type_poste,
			   				altura_poste: 		  poste.altura_poste,
			   				type_material: 		  poste.type_material,
			   				type_pastoral: 		  poste.type_pastoral,
			   				type_luminaria: 	  poste.type_luminaria,
			   				type_lampara: 	      poste.type_lampara,
			   				coordenada_X: 		  poste.coordenada_X,
			   				coordenada_Y:    	  poste.coordenada_Y,
			   				imagen_poste: 		  poste.imagen_poste,
			   				imagen_poste_galeria: {
				   				fotos: 		[],
				   				videos: 	[],
				   				videos_360: []
				   			},
			   				observaciones: 		  poste.observaciones,
			   				estado_poste: 	   	  poste.estado_poste,
			   				estado_pastoral:      poste.estado_pastoral,
			   				estado_luminaria: 	  poste.estado_luminaria,
			   				estado_lampara:  	  poste.estado_lampara,
			   				fecha_creada: 		  poste.fecha_creada
			   			}

			   			// Seleccionando fotos
			   			for(var n = 0; n <= poste_render.imagen_poste.length - 1; n++) {
			   				var el_poste_item_render = poste_render.imagen_poste[n]

			   				console.log(el_poste_item_render)

			   				// Filtrando Files subidos para la galeria
			   				if(el_poste_item_render.extension === 'jpg' && el_poste_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					poste_render.imagen_poste_galeria.videos_360.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'jpeg' && el_poste_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					poste_render.imagen_poste_galeria.videos_360.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'jpg' && el_poste_item_render.size < 3000000) {
			   					
			   					// Almacenando Galeria de Fotos
			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'png' && el_poste_item_render.size < 3000000) {

			   					// Almacenando Galeria de Fotos
			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'mp4') {

			   					el_poste_item_render.cover_preview = '/cover/' + el_poste_item_render.name + '-0.001-.png'

			   					// Validando Galeria de videos
			   					poste_render.imagen_poste_galeria.videos.push(el_poste_item_render)

			   				} else {

			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)
			   					console.log('Multimedia: NUEVO Archivo no legible')

			   				}

			   			}

			   			console.log('FOTOS')
			   			console.log(poste_render.imagen_poste_galeria.fotos)
			   			
			   			console.log('VIDEOS')
			   			console.log(poste_render.imagen_poste_galeria.videos)

			   			console.log('360')
			   			console.log(poste_render.imagen_poste_galeria.videos_360)

		   				// Render formulario edit
		   				// res.render('./admin/dashboard/ordenes_trabajo/form_service_read/read_poste/index.jade', {
		   				// 	user: req.user,
		   				// 	type_service: 'poste',
		   				// 	work_order_id: work_order_id,
		   				// 	service: poste_render
		   				// })

		   				res.status(200).json({
		   					user: req.user,
		   					type_service: 'poste',
		   					work_order_id: work_order_id,
		   					service: poste_render
		   				})

		   			})

		   		})

		   } else if(type_service === 'cliente'){
		   		// Cliente
		   		Cliente.findById({'_id': service_id}, function (err, cliente) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar cliente, en la base de datos',
		   				  error: err
		   				})
		   			} 

		   			// Reordenando, arreglo de contenido multimedia en el elemento
		   			for(var m = 0; m <= cliente.imagen_cliente.length - 1; m++) {
		   				cliente.imagen_cliente[m].position = m + 1
		   			}

		   			cliente.save(function(err) {
		   				if (err) {
		   					return res.status(500).json({
		   					  status: 'error_server',
		   					  message: 'Error al guardar los cambios del cliente, reordenar multimedia',
		   					  error: err
		   					})
		   				}
		   				
		   				// Armando nuevo arreglo
			   			var cliente_render = {
			   				_id: 				     cliente._id,
			   				cliente_id:  			 cliente.cliente_id,
			   				codigo_orden_trabajo:    cliente.codigo_orden_trabajo,
			   				numero_cliente: 		 cliente.numero_cliente,
			   				codigo_via: 	   		 cliente.codigo_via,
			   				distrito: 				 cliente.distrito,
			   				urbanizacion: 			 cliente.urbanizacion, 
			   				numero_puerta: 			 cliente.numero_puerta,
			   				numero_interior: 		 cliente.numero_interior,
			   				manzana: 				 cliente.manzana,
			   				lote: 					 cliente.lote,
			   				nombre_de_cliente: 		 cliente.nombre_de_cliente,
			   				type_residencial:  		 cliente.type_residencial,
			   				is_maximetro_bt: 		 cliente.is_maximetro_bt,
			   				suministro_derecha:  	 cliente.suministro_derecha,
			   				suministro_izquierda:    cliente.suministro_izquierda,
			   				medidor_derecha:    	 cliente.medidor_derecha,
			   				medidor_izquierda:  	 cliente.medidor_izquierda,
			   				poste_cercano:  		 cliente.poste_cercano,
			   				type_conexion: 			 cliente.type_conexion,
			   				type_acometida: 		 cliente.type_acometida,
			   				type_cable_acometida:    cliente.type_cable_acometida,
			   				calibre_cable_acometida: cliente.calibre_cable_acometida,
			   				calibre_cable_matriz:    cliente.calibre_cable_matriz,
			   				observaciones: 			 cliente.observaciones,
			   				fecha_ejecucion: 		 cliente.fecha_ejecucion,
			   				imagen_cliente: 		 cliente.imagen_cliente,
			   				imagen_cliente_galeria: {
				   				fotos: 		[],
				   				videos: 	[],
				   				videos_360: []
				   			},
			   				croquis: 				 cliente.croquis,
			   				coordenada_X: 			 cliente.coordenada_X,
			   				coordenada_Y: 			 cliente.coordenada_Y,
			   				fecha_creada: 		  	 cliente.fecha_creada
			   			}

			   			// Seleccionando fotos
			   			for(var n = 0; n <= cliente_render.imagen_cliente.length - 1; n++) {
			   				var el_cliente_item_render = cliente_render.imagen_cliente[n]

			   				console.log(el_cliente_item_render)

			   				// Filtrando Files subidos para la galeria
			   				if(el_cliente_item_render.extension === 'jpg' && el_cliente_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					cliente_render.imagen_cliente_galeria.videos_360.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'jpeg' && el_cliente_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					cliente_render.imagen_cliente_galeria.videos_360.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'jpg' && el_cliente_item_render.size < 3000000) {
			   					
			   					// Almacenando Galeria de Fotos
			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'png' && el_cliente_item_render.size < 3000000) {

			   					// Almacenando Galeria de Fotos
			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'mp4') {

			   					el_cliente_item_render.cover_preview = '/cover/' + el_cliente_item_render.name + '-0.001-.png'

			   					// Validando Galeria de videos
			   					cliente_render.imagen_cliente_galeria.videos.push(el_cliente_item_render)

			   				} else {

			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)
			   					console.log('Multimedia: NUEVO Archivo no legible')

			   				}

			   			}

			   			console.log('FOTOS')
			   			console.log(cliente_render.imagen_cliente_galeria.fotos)

			   			console.log('VIDEOS')
			   			console.log(cliente_render.imagen_cliente_galeria.videos)

			   			console.log('360')
			   			console.log(cliente_render.imagen_cliente_galeria.videos_360)

		   				// res.render('./admin/dashboard/ordenes_trabajo/form_service_read/read_cliente/index.jade',{
		   				// 	user: req.user,
		   				// 	type_service: 'cliente',
		   				// 	work_order_id: work_order_id,
		   				// 	service: cliente_render
		   				// })

		   				res.status(200).json({
		   					user: req.user,
		   					type_service: 'cliente',
		   					work_order_id: work_order_id,
		   					service: cliente_render
		   				})

		   			})

		   		})

		   } else {
		   		console.log('Error, los campos del tipo de servicio no es valido')
		   
		   }

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// Render - edit- element type work order
	app.post('/dashboard/ordenes_trabajo/:work_order_id/edit/:type_service/:service_id', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins || 
		   req.user.permiso === users_type.officers ||
		   req.user.permiso === users_type.viewer) {
		   
		   var type_service = req.params.type_service
		   var service_id = req.params.service_id
		   var work_order_id = req.params.work_order_id
		   
		   // Validando el tipo de elemento a renderear
		   if(type_service === 'poste') {
		   		// Obteniendo poste por service_id
		   		Poste.findById({'_id': service_id}, function (err, poste) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar poste en la base de datos',
		   				  error: err
		   				})
		   			}

		   			// Reordenando, arreglo de contenido multimedia en el elemento
		   			for(var r = 0; r <= poste.imagen_poste.length - 1; r++) {
		   				poste.imagen_poste[r].position = r + 1
		   			}

		   			poste.save(function(err) {
		   				if(err) {
		   					return res.status(500).json({
		   					  status: 'error_server',
		   					  message: 'Error al guardar cambios en el poste, reordenar multimedia',
		   					  error: err
		   					})
		   				}

		   				// Armando nuevo arreglo
			   			var poste_render = {
			   				_id: 				  poste._id,
			   				codigo_poste: 		  poste.codigo_poste,
			   				codigo_orden_trabajo: poste.codigo_orden_trabajo,
			   				type_poste: 		  poste.type_poste,
			   				altura_poste: 		  poste.altura_poste,
			   				type_material: 		  poste.type_material,
			   				type_pastoral: 		  poste.type_pastoral,
			   				type_luminaria: 	  poste.type_luminaria,
			   				type_lampara: 	      poste.type_lampara,
			   				coordenada_X: 		  poste.coordenada_X,
			   				coordenada_Y:    	  poste.coordenada_Y,
			   				imagen_poste: 		  poste.imagen_poste,
			   				imagen_poste_galeria: {
				   				fotos: 		[],
				   				videos: 	[],
				   				videos_360: []
				   			},
			   				observaciones: 		  poste.observaciones,
			   				estado_poste: 	   	  poste.estado_poste,
			   				estado_pastoral:      poste.estado_pastoral,
			   				estado_luminaria: 	  poste.estado_luminaria,
			   				estado_lampara:  	  poste.estado_lampara,
			   				fecha_creada: 		  poste.fecha_creada
			   			}

			   			// Seleccionando fotos
			   			for(var n = 0; n <= poste_render.imagen_poste.length - 1; n++) {
			   				var el_poste_item_render = poste_render.imagen_poste[n]

			   				console.log(el_poste_item_render)

			   				// Filtrando Files subidos para la galeria
			   				if(el_poste_item_render.extension === 'jpg' && el_poste_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					poste_render.imagen_poste_galeria.videos_360.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'jpeg' && el_poste_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					poste_render.imagen_poste_galeria.videos_360.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'jpg' && el_poste_item_render.size < 3000000) {
			   					
			   					// Almacenando Galeria de Fotos
			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'png' && el_poste_item_render.size < 3000000) {

			   					// Almacenando Galeria de Fotos
			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)

			   				} else if(el_poste_item_render.extension === 'mp4') {

			   					el_poste_item_render.cover_preview = '/cover/' + el_poste_item_render.name + '-0.001-.png'

			   					// Validando Galeria de videos
			   					poste_render.imagen_poste_galeria.videos.push(el_poste_item_render)

			   				} else {

			   					poste_render.imagen_poste_galeria.fotos.push(el_poste_item_render)
			   					console.log('Multimedia: NUEVO Archivo no legible')

			   				}

			   			}

			   			console.log('FOTOS')
			   			console.log(poste_render.imagen_poste_galeria.fotos)
			   			
			   			console.log('VIDEOS')
			   			console.log(poste_render.imagen_poste_galeria.videos)

			   			console.log('360')
			   			console.log(poste_render.imagen_poste_galeria.videos_360)

		   				// Render formulario edit
		   				// res.render('./admin/dashboard/ordenes_trabajo/form_service_edit/edit_poste/index.jade', {
		   				// 	user: req.user,
		   				// 	type_service: 'poste',
		   				// 	work_order_id: work_order_id,
		   				// 	service: poste_render
		   				// })

		   				res.status(200).json({
		   					user: req.user,
		   					type_service: 'poste',
		   					work_order_id: work_order_id,
		   					service: poste_render
		   				})
		   			})

		   		})

		   } else if(type_service === 'cliente'){
		   		// Cliente
		   		Cliente.findById({'_id': service_id}, function (err, cliente) {
		   			if(err) {
		   				return res.status(500).json({
		   				  status: 'error_server',
		   				  message: 'Error al encontrar cliente, en la base de datos',
		   				  error: err
		   				})
		   			} 

		   			// Reordenando, arreglo de contenido multimedia en el elemento
		   			for(var m = 0; m <= cliente.imagen_cliente.length - 1; m++) {
		   				cliente.imagen_cliente[m].position = m + 1
		   			}

		   			cliente.save(function(err) {
		   				if (err) {
		   					return res.status(500).json({
		   					  status: 'error_server',
		   					  message: 'Error al guardar los cambios del cliente, reordenar multimedia',
		   					  error: err
		   					})
		   				}
		   				
		   				// Armando nuevo arreglo
			   			var cliente_render = {
			   				_id: 				     cliente._id,
			   				cliente_id:  			 cliente.cliente_id,
			   				codigo_orden_trabajo:    cliente.codigo_orden_trabajo,
			   				numero_cliente: 		 cliente.numero_cliente,
			   				codigo_via: 	   		 cliente.codigo_via,
			   				distrito: 				 cliente.distrito,
			   				urbanizacion: 			 cliente.urbanizacion,
			   				numero_puerta: 			 cliente.numero_puerta,
			   				numero_interior: 		 cliente.numero_interior,
			   				manzana: 				 cliente.manzana,
			   				lote: 					 cliente.lote,
			   				nombre_de_cliente: 		 cliente.nombre_de_cliente,
			   				type_residencial:  		 cliente.type_residencial,
			   				is_maximetro_bt: 		 cliente.is_maximetro_bt,
			   				suministro_derecha:  	 cliente.suministro_derecha,
			   				suministro_izquierda:    cliente.suministro_izquierda,
			   				medidor_derecha:    	 cliente.medidor_derecha,
			   				medidor_izquierda:  	 cliente.medidor_izquierda,
			   				poste_cercano:  		 cliente.poste_cercano,
			   				type_conexion: 			 cliente.type_conexion,
			   				type_acometida: 		 cliente.type_acometida,
			   				type_cable_acometida:    cliente.type_cable_acometida,
			   				calibre_cable_acometida: cliente.calibre_cable_acometida,
			   				calibre_cable_matriz:    cliente.calibre_cable_matriz,
			   				observaciones: 			 cliente.observaciones,
			   				fecha_ejecucion: 		 cliente.fecha_ejecucion,
			   				imagen_cliente: 		 cliente.imagen_cliente,
			   				imagen_cliente_galeria: {
				   				fotos: 		[],
				   				videos: 	[],
				   				videos_360: []
				   			},
			   				croquis: 				 cliente.croquis,
			   				coordenada_X: 			 cliente.coordenada_X,
			   				coordenada_Y: 			 cliente.coordenada_Y,
			   				fecha_creada: 		  	 cliente.fecha_creada
			   			}

			   			// Seleccionando fotos
			   			for(var n = 0; n <= cliente_render.imagen_cliente.length - 1; n++) {
			   				var el_cliente_item_render = cliente_render.imagen_cliente[n]

			   				console.log(el_cliente_item_render)

			   				// Filtrando Files subidos para la galeria
			   				if(el_cliente_item_render.extension === 'jpg' && el_cliente_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					cliente_render.imagen_cliente_galeria.videos_360.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'jpeg' && el_cliente_item_render.mimetype === 'image_360') {
			   					
			   					// Almacenando Galeria de fotos 360
			   					cliente_render.imagen_cliente_galeria.videos_360.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'jpg' && el_cliente_item_render.size < 3000000) {
			   					
			   					// Almacenando Galeria de Fotos
			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'png' && el_cliente_item_render.size < 3000000) {

			   					// Almacenando Galeria de Fotos
			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)

			   				} else if(el_cliente_item_render.extension === 'mp4') {

			   					el_cliente_item_render.cover_preview = '/cover/' + el_cliente_item_render.name + '-0.001-.png'

			   					// Validando Galeria de videos
			   					cliente_render.imagen_cliente_galeria.videos.push(el_cliente_item_render)

			   				} else {

			   					cliente_render.imagen_cliente_galeria.fotos.push(el_cliente_item_render)
			   					console.log('Multimedia: NUEVO Archivo no legible')

			   				}

			   			}

			   			console.log('FOTOS')
			   			console.log(cliente_render.imagen_cliente_galeria.fotos)

			   			console.log('VIDEOS')
			   			console.log(cliente_render.imagen_cliente_galeria.videos)

			   			console.log('360')
			   			console.log(cliente_render.imagen_cliente_galeria.videos_360)

		   				// res.render('./admin/dashboard/ordenes_trabajo/form_service_edit/edit_cliente/index.jade',{
		   				// 	user: req.user,
		   				// 	type_service: 'cliente',
		   				// 	work_order_id: work_order_id,
		   				// 	service: cliente_render
		   				// })

		   				res.status(200).json({
		   					user: req.user,
		   					type_service: 'cliente',
		   					work_order_id: work_order_id,
		   					service: cliente_render
		   				})

		   			})
		   			
		   		})

		   } else {
		   		console.log('Error, los campos del tipo de servicio no es valido')
		   
		   }

		} else {
			console.log('El usuario no esta autentificado. Requiere logearse')
			res.status(403).json({
				status: 'not_access',
				message: 'El usuario no esta autentificado. Requiere logearse'
			})
		}
	})

	// URI: Cambiar estado
	app.post('/dashboard/ordenes_trabajo/:work_order_id/change-status/:type_status', isLoggedIn, function (req, res) {
		if(req.user.permiso === users_type.onwers || 
		   req.user.permiso === users_type.admins ||
		   req.user.permiso === users_type.officers || 
		   req.user.permiso === users_type.users_campo ||
		   req.user.permiso === users_type.viewer) {
		   
		   var work_order_id = req.params.work_order_id
		   var type_status = req.params.type_status 

		   console.log('Llamada realizada REPORTES')
		   console.log(type_status)

			Work_Order.findById({'_id': work_order_id}, function (err, work_order_here) {
				if(err) {
					return res.status(500).json({
					  status: 'error_server',
					  message: 'Error al encontrar la orden de trabajo en la base de datos',
					  error: err
					})
				}

				console.log('id de la orden de trabajo')
				console.log(work_order_id)

				console.log(work_order_here)

				console.log('Info de la orden de trabajo dentro')

				if (type_status === work_order_status.reprogramado) {

					// Validando respuesta de reporte
					if(req.body.report_accept === 'si') {

						console.log('Reporte como SI')
						// El reporte fue aceptado
						Notificaciones.findOne({'work_order_id': work_order_id}, function (err, noti_to_new) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al encontrar notificaciones',
								  error: err
								})
							}
							
							console.log('Notificaicon encontrada')

							console.log('DATOS DE LA ORDEN')

							// Cambiando el estado de la orden de trabajo: 'reprogramado', Al aceptar el reporte 
							work_order_here.estado = work_order_status.reprogramado
							work_order_here.public = false

							// Guardando cambios
							work_order_here.save(function (err, work_order_saved) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error al guardar cambios',
									  error: err
									})
								}
								
								console.log('Nueva orden de trabajo creado salvada')

								// Creando nueva orden de trabajo, a partir de la otra
								var new_work_orden1  = new Work_Order({
									codigo_orden: 			 'NWO_00' + (Number(work_order_here.codigo_orden.split('NWO_00')[1]) + 1),
									codigo_supervisor:       work_order_here.codigo_supervisor,
									codigo_contratista:      work_order_here.codigo_contratista,
									empresa_admin:   		 work_order_here.empresa_admin,
									contratista:             work_order_here.contratista,
									tipo_servicio:           work_order_here.tipo_servicio,
									detalle_servicio:        work_order_here.detalle_servicio,
									tipo_urgencia:  	     work_order_here.tipo_urgencia,
									cover_image: 			 {
																path: '/images/elemento_defaul.png'
									},
									coordenada_X:  		     work_order_here.coordenada_X,
									coordenada_Y:  		     work_order_here.coordenada_Y,
									direccion:               work_order_here.direccion,
									descripcion:             work_order_here.descripcion,
									public:                  false,
									estado:                  'reprogramado',
									conclusiones:            work_order_here.conclusiones,
									fecha_publicado: 		 work_order_here.fecha_publicado,
									fecha_visita_esperada:   work_order_here.fecha_visita_esperada,
									fecha_trabajo_realizado: work_order_here.fecha_trabajo_realizado,
									reprogramado_de: 		 work_order_here.codigo_orden,
									elementos: 				 work_order_here.elementos
								})

								new_work_orden1.save(function(err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar orden de trabajo, al ser reprogramada',
										  error: err
										})
									}

									// Eliminando anterior orden de trabajo que se esta reprogramando
									Work_Order.remove({'_id': work_order_here}, function (err) {
										if(err) {
											return res.status(500).json({
												status: 'error_server',
												error: err
											})
										}

										res.status(200).json({
											status: 'ok',
											message: 'Orden de trabajo eliminado'
										})
										
									})

									console.log('Orden de trabajo reprograma, guardada en la base de datos')

									// Actualizando estado de lectura de la notificacion
									noti_to_new.status_lectura = config.card_status.read

									// Guardando cambios en la base de datos, para notifiaciones
									noti_to_new.save(function (err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al guardar datos de la notificaciones',
											  error: err
											})
										}

										var user_id = JSON.stringify(req.user._id)
										user_id = JSON.parse(user_id)

										var tipo_servicio_name = ''
										// Validando variable de tipo de servicio
										if(work_order_here.tipo_servicio === 'tipo_servicio_C') {
											
											tipo_servicio_name = 'Cliente' 

										} else {

											tipo_servicio_name = 'Poste'

										}

										// Enviando respuesta positiva de notificacion: Para el usuario de campo
										var noti2 = new Notificaciones({
											work_order_id:      work_order_here._id,
											codigo_orden:       work_order_here.codigo_orden,
											users: {
												user_emiter:    user_id,
												user_receptor:  work_order_here.codigo_contratista
											},
											type_notification:  config.notification_type.reporte,
											type_service:       tipo_servicio_name,
											type_answer:  		config.notification_type.type_answer.reporte.aceptada,
											content:   {
												title:      'Orden de Trabajo - Aceptada',
												detalle:    'Esta orden de trabajo fue reportada. El reporte fue aceptado por el supervisor', 
												multimedia: { path: '/images/elemento_defaul.png' }
											},
											message_copy: {
												detalle: `Tu reporte de la orden de trabajo ${work_order_here.codigo_orden} ha sido aceptado.`
											},
											status_lectura:     config.card_status.no_read
										})

										noti2.save(function (err) {
											if(err) {
												return res.status(500).json({
												  status: 'error_server',
												  message: 'Error al guardar notificacion',
												  error: err
												})
											}
											
											// Enviando notificacion: Reporte Aceptado 
											notis_alert.notificar(noti2.users.user_receptor, noti2)

											console.log('Notificacion send SI - guardada')
											
											// Mostrando resultados
											res.status(200).json({
												status: 'ok',
												message: 'La Orden de trabajo - estado : Reprogramado',
												work_order: new_work_orden1,
												user: req.user
											})


										})

									})


								})

							})

						})

					} else if(req.body.report_accept === 'no'){

						console.log('Reporte como NO')

						// El reporte fue rechazado
						Notificaciones.findOne({'work_order_id': work_order_id}, function (err, noti_to_new) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al encontrar notificaciones',
								  error: err
								})
							}

							work_order_here.estado = work_order_status.pendiente
							work_order_here.public = true

							// Guardando cambios
							work_order_here.save(function (err, work_order_saved) {
								if(err) {
									return res.status(500).json({
									  status: 'error_server',
									  message: 'Error al guardar cambios',
									  error: err
									})
								}

								// Actualizando estado de lectura de la notificacion
								noti_to_new.status_lectura = config.card_status.read
								
								// Guardando cambios en la base de datos, para notifiaciones
								noti_to_new.save(function (err) {
									if(err) {
										return res.status(500).json({
										  status: 'error_server',
										  message: 'Error al guardar datos de la notificaciones',
										  error: err
										})
									}
									
									var user_id = JSON.stringify(req.user._id)
									user_id = JSON.parse(user_id)

									var tipo_servicio_name = ''
									// Validando variable de tipo de servicio
									if(work_order_here.tipo_servicio === 'tipo_servicio_C') {
										
										tipo_servicio_name = 'Cliente' 

									} else {

										tipo_servicio_name = 'Poste'

									}

									// Enviando respuesta positiva de notificacion: Para el usuario de campo
									var noti = new Notificaciones({
										work_order_id:      work_order_here._id,
										codigo_orden:       work_order_here.codigo_orden,
										users: {
											user_emiter:    user_id,
											user_receptor:  work_order_here.codigo_contratista
										},
										type_notification:  config.notification_type.reporte,
										type_service:       tipo_servicio_name,
										type_answer:  		config.notification_type.type_answer.reporte.rechazada,
										content:   {
											title:      'Orden de Trabajo - Rechazada',
											detalle:    'Esta orden de trabajo fue reportada. El reporte fue rechazada por el supervisor',
											multimedia: { path: '/images/elemento_defaul.png' }
										},
										message_copy: {
											datalle: `Tu reporte de la orden de trabajo ${work_order_here.codigo_orden} ha sido rechazada`
										},
										status_lectura:     config.card_status.no_read
									})

									noti.save(function(err) {
										if(err) {
											return res.status(500).json({
											  status: 'error_server',
											  message: 'Error al guardar notificaion en la base de datos',
											  error: err
											})
										}

										// Enviando notificacion: Reporte Rechazado
										notis_alert.notificar(noti.users.user_receptor, noti)

										console.log('Notificaicon send No - guardada')
										// Mostrando resultados
										res.status(200).json({
											status: 'ok',
											message: 'La Orden de trabajo - estado : Pendiente',
											work_order: work_order_saved,
											user: req.user
										})

									})

								})
									
							})
						})

					} else {

						console.log('Error, parametro de reporte no es ni si o no')
						// Mostrando resultados
						res.status(200).json({
							status: 'error',
							message: 'Error al pasar el parametro en el reporte',
							user: req.user
						})

					}
					
				} else if (type_status === work_order_status.cancelado) {
					// Cambiando el estado de la orden de trabajo: 'reportado'
					work_order_here.estado = work_order_status.cancelado
					work_order_here.public = true
					
					// Guardando cambios
					work_order_here.save(function (err, work_order_saved) {
						if(err) {
							return res.status(500).json({
							  status: 'error_server',
							  message: 'Error al guardar cambios de la orden de trabajo',
							  error: err
							})
						}
						console.log('Estado de la orden de trabajo cambiado')

						var user_id = JSON.stringify(req.user._id)
						user_id = JSON.parse(user_id)

						var tipo_servicio_name = ''
						// Validando variable de tipo de servicio
						if(work_order_here.tipo_servicio === 'tipo_servicio_C') {
							
							tipo_servicio_name = 'Cliente' 

						} else {

							tipo_servicio_name = 'Poste'

						}

						// Notificaion para el usuario: status changed - cancelado
						var noti = new Notificaciones({
							work_order_id:      work_order_here._id,
							codigo_orden:       work_order_here.codigo_orden,
							users: {
								user_emiter:    user_id,
								user_receptor:  work_order_here.codigo_contratista
							},
							type_notification:  config.notification_type.change_status,
							type_service:       tipo_servicio_name,
							type_answer: 		config.notification_type.type_answer.change_status.cancelada,
							message_copy: {
								datalle: `Tu orden de trabajo ${work_order_here.codigo_orden} ha sido cancelada`
							},
							status_lectura:     config.card_status.no_read
						})

						noti.save(function(err) {
							if(err) {
								return res.status(500).json({
								  status: 'error_server',
								  message: 'Error al guardar notificaion en la base de datos',
								  error: err
								})
							}

							// Enviando notificacion: Orden de trabajo Cancelado
							notis_alert.notificar(noti.users.user_receptor, noti)

							console.log('Notificacion guardada en la base de datos')

							// Mostrando resultados
							res.status(200).json({
								status: 'ok',
								message: 'La Orden de trabajo - estado : En Cancelado',
								work_order: work_order_saved,
								user: req.user
							})

						})
							
					})

				} else {
					// Generando respuesta amigable, de error de parametro pasado
					res.status(200).json({
						status: 'not_found',
						message: 'No se Proceso, parametro type_status no correcta',
						work_order: work_order_saved,
						user: req.user
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

	})

}

module.exports = FormWorkOrder


