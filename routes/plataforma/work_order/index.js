var ffmpeg = require('fluent-ffmpeg')

var Work_Order = require('../../../models/orden_trabajo')
var Cliente = require('../../../models/orden_trabajo/cliente')
var Poste = require('../../../models/orden_trabajo/poste')
var Usuarios = require('../../../models/usuarios')
var Contratista = require('../../../models/usuarios/contratistas/index.js')

var Notificacion = require('../../../models/notificaciones/index.js')

var Noti_Send_Messages = require('../../../controllers/notificaciones/index.js').time

var config = require('../../../config.js')

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

function FormPlataformWorkOrder(app, io) {

	// Ejecutar funcion de enviar notificacion 
	var notis_alert = new Noti_Send_Messages(io)

	notis_alert.connect()

	// >> Order de Trabajo

	// API: READ - work_order - obteniendo todas las ordenes de tabajo
	app.get('/plataforma/work-order/list', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {

					console.log('Heello todas las ordenes')
					Work_Order.find(function (err, work_orders) {
						if(err) {
							return res.status(500).json({
								status: 'error_server',
								message: 'Error al encontrar ordenes de trabajo',
								error: err
							})
						}

						work_orders.reverse()

						console.log('Ordenesd de trabajo')
						console.log(work_orders)

					   res.status(200).json({
					   		user: usuario_token,
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

			}

		})	
	})

	// API: READ - Obtener detalles por orden de Trabajo
	app.get('/plataforma/work-order/:work_order_id', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {

					var work_order_id = req.params.work_order_id
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

						// Obteniendo datos del supervisor

						// Obteniendo datos del elemento para la orden de trabajo
						var type_service_re2 

						if(work_order.tipo_servicio === 'tipo_servicio_P') {
							type_service_re2 = 'postes'

						} else if (work_order.tipo_servicio === 'tipo_servicio_C') {
							type_service_re2 = 'clientes'

						} else {
							type_service_re2 = 'not_found'

						}

						console.log('Orden de trabajo encontrado')
						res.status(200).json({
					   		user: usuario_token,
					   		type_service_name: type_service_re2,
							work_order: new_work_orden_model
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

	// API: UPDATE - Orden de trabajo actualizar
	app.put('/plataforma/work-order/:work_order_id', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
				   
					var work_order_id = req.params.work_order_id
					
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
							tipo_servicio:           req.body.tipo_servicio || work_order_first.tipo_servicio,
							detalle_servicio:        req.body.detalle_servicio || work_order_first.detalle_servicio,
							tipo_urgencia:  	     req.body.tipo_urgencia || work_order_first.tipo_urgencia,
							coordenada_X:  		     req.body.coordenada_X || work_order_first.coordenada_X,
							coordenada_Y:  		     req.body.coordenada_Y || work_order_first.coordenada_Y,
							direccion:               req.body.direccion || work_order_first.direccion,
							descripcion:             req.body.descripcion || work_order_first.descripcion,
							public:                  req.body.public || work_order_first.public,
							estado:                  req.body.estado || work_order_first.estado,
							conclusiones:            req.body.conclusiones || work_order_first.conclusiones,
							fecha_visita_esperada:   req.body.fecha_visita_esperada || work_order_first.fecha_visita_esperada,
							reprogramado_de: 		 req.body.reprogramado_de || work_order_first.reprogramado_de		 
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
								
								var tipo_servicio_name = ''
								// Validando variable de tipo de servicio
								if(work_order_find.tipo_servicio === 'tipo_servicio_C') {
									
									tipo_servicio_name = 'Cliente' 

								} else {

									tipo_servicio_name = 'Poste'

								}

								// Generando notificacion en tiempo real
								var noti = new Notificacion({
									work_order_id:      work_order_find._id,
									codigo_orden:       work_order_find.codigo_orden,
									users: {
										user_emiter:    usuario_token._id,
										user_receptor:  work_order_find.codigo_supervisor
									},
									type_notification:  config.notification_type.change_status,
									type_service:       tipo_servicio_name,
									type_answer:  		config.notification_type.type_answer.change_status.actualizada,
									message_copy: {
										detalle: `Las Conclusiones de la orden de trabajo ${work_order_find.codigo_orden} Actualizanda`
									},
									status_lectura: config.card_status.no_read
								})

								noti.save(function(err) {
									if(err) {
										return res.status(500).json({
											status: 'error_server',
											message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
											error: err
										})
									}

									// Enviando notificacion: Asignando nueva orden de trabajo - poste
									notis_alert.notificar(noti.users.user_receptor, noti)
								
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
							   				return element.empresa_admin === usuario_token.empresa_admin
							   			})

							   			// Filtrando a los officers que pertenecen a la contratista del usuario que crea
							   			var officer_contratista_filter = officer_empresa_filter.filter(function (element) {
							   				return element.contratista === usuario_token.contratista
							   			})

							   			// - Usuarios de campo

							   			// Filtrando a todos los usuarios de campo
							   			var user_campo_filter = usuarios.filter(function (element) {
							   				return element.permiso === users_type.users_campo
							   			})

							   			// Filtrando a los usuarios de campo que pertenecen a la empresa del usuario que crea
							   			var user_campo_empresa_filter = user_campo_filter.filter(function (element) {
							   				return element.empresa_admin === usuario_token.empresa_admin
							   			})

							   			// Filtrando a los usuarios de campo que pertenecen a la contratista del usuario que crea
							   			var user_campo_contratista_filter = user_campo_empresa_filter.filter(function (element) {
							   				return element.contratista === usuario_token.contratista
							   			})

							   			console.log('Proceso de editar')

							   			// Render de formulario editable
							   			// res.render('./plataforma/ordenes_trabajo/form_edit/index.jade', {
							   			// 	user: usuario_token,
							   			// 	officers: officer_contratista_filter,
							   			// 	user_campos: user_campo_contratista_filter,
							   			// 	work_order: work_order_find
							   			// })

							   			res.status(200).json({
								   			user: usuario_token,
								   			officers: officer_contratista_filter,
								   			user_campos: user_campo_contratista_filter,
								   			work_order: work_order_find
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

			}

		})
	})

	// Render form to Edit Orden de Trabajo
	app.post('/plataforma/work-order/edit/:work_order_id', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
					
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
				   				return element.empresa_admin === usuario_token.empresa_admin
				   			})

				   			// Filtrando a los officers que pertenecen a la contratista del usuario que crea
				   			var officer_contratista_filter = officer_empresa_filter.filter(function (element) {
				   				return element.contratista === usuario_token.contratista
				   			})

				   			// - Usuarios de campo

				   			// Filtrando a todos los usuarios de campo
				   			var user_campo_filter = usuarios.filter(function (element) {
				   				return element.permiso === users_type.users_campo
				   			})

				   			// Filtrando a los usuarios de campo que pertenecen a la empresa del usuario que crea
				   			var user_campo_empresa_filter = user_campo_filter.filter(function (element) {
				   				return element.empresa_admin === usuario_token.empresa_admin
				   			})

				   			// Filtrando a los usuarios de campo que pertenecen a la contratista del usuario que crea
				   			var user_campo_contratista_filter = user_campo_empresa_filter.filter(function (element) {
				   				return element.contratista === usuario_token.contratista
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
				   			// res.render('./plataforma/ordenes_trabajo/form_edit/index.jade', {
				   			// 	user: usuario_token,
				   			// 	officers: officer_contratista_filter,
				   			// 	type_service_re: type_service_re,
				   			// 	user_campos: user_campo_contratista_filter,
				   			// 	work_order: work_order_find
				   			// })

				   			res.status(200).json({
					   			user: usuario_token,
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

			}
		})
	})

	// >> Orden de Trabajos - Filtro validation
	app.post('/plataforma/work-order/dynamic-filter/:tipo_servicio', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
			if(err) {
		        return res.status(500).json({
		        	status: 'error_server',
		        	message: 'Usuario No encontrado en la base de datos',
		        	error: err
		        })

			} else {
				console.log('Antes de entrar')
				console.log(usuario_token)
				if(usuario_token.permiso === users_type.onwers || 
				   usuario_token.permiso === users_type.admins ||
				   usuario_token.permiso === users_type.officers ||
				   usuario_token.permiso === users_type.users_campo) {
					
					console.log('Dentro')

					var tipo_servicio = req.params.tipo_servicio

					// Parametro de filtro - id de usuario en orden de trabajo 
					var codigo_contratista = JSON.stringify(usuario_token._id)
					codigo_contratista = JSON.parse(codigo_contratista)

					// El en cliente front - se coloca un uri de llamado por default y sus parametros cambian a corde a la modificaciones, pero nunca se queda sin ninguno
					// /dynamic-filter/tipo_servicio_P

					Work_Order.find(function (err, work_orders) {
						if(err) {
							return res.status(500).json({
								status: 'error_server',
								message: 'Error al obtener las ordenes de trabajo',
								error: err
							})
						}

						// Filtrando por public === true
						var orders_public = work_orders.filter(function (element) {
							return element.public === true
						})

						// Filtrando por fecha de hoy 

						var orders_today = []

						// Comparando con fecha del dia de hoy 
						var today = new Date()
						var today_day = today.getDate()
						var today_month = today.getMonth() + 1
						var today_year = today.getFullYear() 

						for(var f = 0; f <= orders_public.length - 1; f++) {

							var el_order_filter_date = orders_public[f]

							// Comparando con fecha de publicado de la orden
							var RTime = new Date(el_order_filter_date.fecha_publicado)
							var month = RTime.getMonth() + 1   // 0 - 11 *
							var day = RTime.getDate()          // 1- 31  *
							var year = RTime.getFullYear()     // año   *

							// Validando si es hoy y en menos de 24h
							if( Number(day) === Number(today_day) && 
							    Number(month) === Number(today_month)  &&
							    Number(year) === Number(today_year) ) {

								// añadiendo elemento si coincide con la fecha del dia
								orders_today.push(el_order_filter_date)

							} 

						}

						console.log('ORDENES DEL DIA POR FECHA')
						console.log(orders_today)

						if(orders_today.length !== 0 ) { 

							// Filtrando por id de contratista
							if(codigo_contratista !== '' &&
							   codigo_contratista !== undefined) {

								// Filtrando por id de usuario en la orden de trabajo
								var orders_contratistas = orders_today.filter(function (element) {
									return element.codigo_contratista === codigo_contratista
								})

								// Filtrando por tipo de servicio
								if(tipo_servicio === 'tipo_servicio_P' ||
								   tipo_servicio === 'tipo_servicio_C') {

									var orders_type_service = orders_contratistas.filter(function (element) {
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

									// Enviando ordenes de trabajo filtradas
									res.status(200).json({
										status: 'ok',
										work_orders: {
											pendiente:    orders_status_pendientes,
											en_curso:     orders_status_en_curso,
											resuelto:     orders_status_resueltas,
											no_resuelto:  orders_status_no_resueltas,
											cancelado:    orders_status_cancelado,
											reportado:    orders_status_reportado
										}
									})

								} else if (tipo_servicio === 'tipo_all') {

									// Filtrando por estado de la orden

									// Pendientes 
									var orders_status_pendientes = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.pendiente
									})

									// En curso
									var orders_status_en_curso = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.en_proceso
									})

									// Resueltas
									var orders_status_resueltas = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.resuelto
									})

									// No resueltas
									var orders_status_no_resueltas = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.no_resuelto
									})

									// Cancelado
									var orders_status_cancelado = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.cancelado
									})

									// Reportadas
									var orders_status_reportado = orders_contratistas.filter(function (element) {
										return element.estado === work_order_status.reportado
									})

									// Enviando ordenes de trabajo filtradas
									res.status(200).json({
										status: 'ok',
										work_orders: {
											pendiente:    orders_status_pendientes,
											en_curso:     orders_status_en_curso,
											resuelto:     orders_status_resueltas,
											no_resuelto:  orders_status_no_resueltas,
											cancelado:    orders_status_cancelado,
											reportado:    orders_status_reportado
										}
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

	// >> Elemento type orden de trabajo

	// API: CREATE - Poste o cliente item a una orden de trabajo
	app.post('/plataforma/work-order/:work_order_id/add-item/:type_service', ensureAuthorized, function (req, res){
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
					
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
										path: '/images/elemento_defaul.svg',
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
											// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/poste_form/index.jade', {
											// 	status: 'ok',
											// 	message: 'Orden de trabajo actualizada: nuevo item incluido',
										 	//   	user: usuario_token,
										 	//   	work_order: work_order,
											// 	type_service: type_service,
											// 	service: service,
											// 	codigo_work_order: service.codigo_orden_trabajo
											// })

											res.status(200).json({
												status: 'ok',
												message: 'Orden de trabajo actualizada: nuevo item incluido',
										   		user: usuario_token,
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
										codigo_via: 	   		 '',
										distrito: 				 '',
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
										path: '/images/elemento_defaul.svg',
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

											// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/poste_form/index.jade',{
											// 	status: 'ok',
											// 	message: 'Orden de trabajo actualizada: nuevo item incluido',
										 	//   	user: usuario_token,
										 	//   	work_order: work_order,
											// 	type_service: type_service,
											// 	service: service,
											// 	codigo_work_order: service.codigo_orden_trabajo
											// })

											// Render de la orden de trabajo
											res.status(200).json({
											    status: 'ok',
												message: 'Orden de trabajo actualizada: nuevo item incluido',
										   		user: usuario_token,
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

			}
		})
	})

	// API - UPDATE - item work order Actualizando datos del servicio: poste o cliente
	app.put('/plataforma/work-order/:work_order_id/item/:type_service/:service_id', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
					
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
						var elementos_length = work_order_item.elementos.length

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
								Poste.findById({'_id': service_id}, function (err, poste_find2){
									if(err) {
										return res.status(500).json({
											status: 'error_server',
											message: 'Error al encontrar un poste',
											error: err
										})
									}
								
									var data_1 = {
										codigo_poste: 		  req.body.codigo_poste || poste_find2.codigo_poste,
										type_poste: 		  req.body.type_poste || poste_find2.type_poste,
										altura_poste: 		  req.body.altura_poste || poste_find2.altura_poste,
										type_material: 		  req.body.type_material || poste_find2.type_material,
										type_pastoral: 		  req.body.type_pastoral || poste_find2.type_pastoral,
										type_luminaria: 	  req.body.type_luminaria || poste_find2.type_luminaria,
										type_lampara: 	      req.body.type_lampara || poste_find2.type_lampara,
										coordenada_X: 		  req.body.coordenada_X || poste_find2.coordenada_X,
										coordenada_Y:    	  req.body.coordenada_Y || poste_find2.coordenada_Y,
										observaciones: 		  req.body.observaciones || poste_find2.observaciones,
										estado_poste: 	   	  req.body.estado_poste || poste_find2.estado_poste,
										estado_pastoral:      req.body.estado_pastoral || poste_find2.estado_pastoral,
										estado_luminaria: 	  req.body.estado_luminaria || poste_find2.estado_luminaria,
										estado_lampara:  	  req.body.estado_lampara || poste_find2.estado_lampara
									}

									// Actualizando multimedia dentro del elemento
									if(req.files.hasOwnProperty('new_file_upload')) {
										// Actualizando los datos del psote. Con Archivos multimedia
										console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
										
										// Validando path uploads ----
										var FilesCover = req.files.new_file_upload

										console.log('---------------')

										console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
										console.log(FilesCover)

										console.log('---------------')

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

											if(poste_find.imagen_poste.length === 0) {

												console.log('NOY HA ARCHIVOS MULTIMEDIA')
												
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

												// Si el primer elemento es default. 
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

											}


											console.log('---------------')

											console.log('VIDEO LISTO PARA SACAR COVER')

											console.log(FilesCover)

											// Validando Si es video
											if(FilesCover.extension === 'mp4') {
												
												console.log('El archivo multimedia es un video mp4')

												ffmpeg(scope_path_system + '/uploads'+ FilesCover.path)
												  .screenshots({
												    timestamps: ['00:00.001'],
												    filename: FilesCover.name + '-%s-.png',
												    folder: scope_path_system + '/uploads/cover',
												    size: '320x240'
												  });

											}

											console.log('---------------')

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

												// Incrementando progreso en +1
												work_order_item.progress_to_complete += 1

												console.log('PROGREESS TO COMPLETE!!')

												// Asignando estado: No Resuelto por defecto al enviar
												work_order_item.estado = work_order_status.no_resuelto

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente' 

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.actualizada,
													message_copy: {
														detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

												// Validando cambio de estado: Resuelto ?
												if(work_order_item.progress_to_complete >= elementos_length) {

													// Cambiando estado : Resuelto
													work_order_item.estado = work_order_status.resuelto

													// Asignando fecha de trabajo terminado
													work_order_item.fecha_trabajo_realizado = new Date()

													var tipo_servicio_name = ''
													// Validando variable de tipo de servicio
													if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
														
														tipo_servicio_name = 'Cliente' 

													} else {

														tipo_servicio_name = 'Poste'

													}

													// Generando notificacion en tiempo real
													var noti = new Notificacion({
														work_order_id:      work_order_item._id,
														codigo_orden:       work_order_item.codigo_orden,
														users: {
															user_emiter:    usuario_token._id,
															user_receptor:  work_order_item.codigo_supervisor
														},
														type_notification:  config.notification_type.change_status,
														type_service:       tipo_servicio_name,
														type_answer:  		config.notification_type.type_answer.change_status.resuelta,
														message_copy: {
															detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
														},
														status_lectura: config.card_status.no_read
													})

													noti.save(function(err) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
																error: err
															})
														}

														// Enviando notificacion: Asignando nueva orden de trabajo - poste
														notis_alert.notificar(noti.users.user_receptor, noti)


													})

												}
												// Actualizando portada de imagen de la orden de trabajo por elemento actualizado

												if(FilesCover.extension === 'jpg') {

													var pot = 0
													var img_here = ''

													console.log('PROCESO START!!!')
													// Buscando en los elemento de la orden
													for(var t = 0; t <= work_order_item.elementos.length - 1; t++) {
														var el_work_order_item_id = JSON.stringify(work_order_item.elementos[t]._id)
														el_work_order_item_id = JSON.parse(el_work_order_item_id)

														console.log(work_order_item.elementos[t]._id)
														console.log(typeof(work_order_item.elementos[t]._id))

														console.log(service_id)
														console.log(typeof(service_id))

														// Obteniendo por _id
														if(el_work_order_item_id === service_id) {
															console.log('ENCONTRADO ELEMENTO!!!!!!! <<<<<')

															console.log('Elemento de proceso en camino!!!!! ------>>>')
															pot = t
															img_here = data_1.imagen_poste[data_1.imagen_poste.length - 1].path

															break
														}
													}

													work_order_item.elementos[pot].image_element.path = img_here

													console.log('ELEMENTO CARGADO 2222')

													var work_order_items_ = work_order_item.elementos

													work_order_items_[pot] = work_order_item.elementos[pot]

													work_order_item.elementos = []

													work_order_item.elementos = work_order_items_

												}

												// Guardando progreso de lista en la orden de trabajo
												work_order_item.save(function (err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al actualizar campo en la orden de trabajo',
															error: err
														})
													}

													console.log('Guardo +1 la orden de trabajo')

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
														// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
													 	// 		user: usuario_token,
													 	//  	work_order: work_order_item,
														// 		type_service: type_service,
														// 		service: service_element,
														// 		codigo_work_order: service_element.codigo_orden_trabajo
														// })

														res.status(200).json({
														    user: usuario_token,
														    work_order: work_order_item,
														   	type_service: type_service,
														    service: service_element,
														   	codigo_work_order: service_element.codigo_orden_trabajo
														})

													})

												})
												
											})

										})

									} else if (req.files.hasOwnProperty('new_file_upload_360')) {

										// Actualizando los datos del psote. Con Archivos multimedia
										console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
										
										// Validando path uploads ----
										var FilesCover = req.files.new_file_upload_360

										console.log('---------------')

										console.log('SUBIENDO NUEVO MULTIMEDIA - POSTE')
										console.log(FilesCover)

										console.log('---------------')

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

											if(poste_find.imagen_poste.length === 0) {

												console.log('NOY HA ARCHIVOS MULTIMEDIA')
												
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

												// Si el primer elemento es default. 
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

											}


											console.log('---------------')

											console.log('VIDEO LISTO PARA SACAR COVER')

											console.log(FilesCover)

											// Validando Si es video
											if(FilesCover.extension === 'mp4') {
												
												console.log('El archivo multimedia es un video mp4')

												ffmpeg(scope_path_system + '/uploads'+ FilesCover.path)
												  .screenshots({
												    timestamps: ['00:00.001'],
												    filename: FilesCover.name + '-%s-.png',
												    folder: scope_path_system + '/uploads/cover',
												    size: '320x240'
												  });

											}

											console.log('---------------')

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

												// Incrementando progreso en +1
												work_order_item.progress_to_complete += 1

												console.log('PROGREESS TO COMPLETE!!')

												// Asignando estado: No Resuelto por defecto al enviar
												work_order_item.estado = work_order_status.no_resuelto

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente' 

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.actualizada,
													message_copy: {
														detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

												// Validando cambio de estado: Resuelto ?
												if(work_order_item.progress_to_complete >= elementos_length) {

													// Cambiando estado : Resuelto
													work_order_item.estado = work_order_status.resuelto

													// Asignando fecha de trabajo terminado
													work_order_item.fecha_trabajo_realizado = new Date()

													var tipo_servicio_name = ''
													// Validando variable de tipo de servicio
													if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
														
														tipo_servicio_name = 'Cliente' 

													} else {

														tipo_servicio_name = 'Poste'

													}

													// Generando notificacion en tiempo real
													var noti = new Notificacion({
														work_order_id:      work_order_item._id,
														codigo_orden:       work_order_item.codigo_orden,
														users: {
															user_emiter:    usuario_token._id,
															user_receptor:  work_order_item.codigo_supervisor
														},
														type_notification:  config.notification_type.change_status,
														type_service:       tipo_servicio_name,
														type_answer:  		config.notification_type.type_answer.change_status.resuelta,
														message_copy: {
															detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
														},
														status_lectura: config.card_status.no_read
													})

													noti.save(function(err) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
																error: err
															})
														}

														// Enviando notificacion: Asignando nueva orden de trabajo - poste
														notis_alert.notificar(noti.users.user_receptor, noti)


													})

												}
												// Actualizando portada de imagen de la orden de trabajo por elemento actualizado

												if(FilesCover.extension === 'jpg') {

													var pot = 0
													var img_here = ''

													console.log('PROCESO START!!!')
													// Buscando en los elemento de la orden
													for(var t = 0; t <= work_order_item.elementos.length - 1; t++) {
														var el_work_order_item_id = JSON.stringify(work_order_item.elementos[t]._id)
														el_work_order_item_id = JSON.parse(el_work_order_item_id)

														console.log(work_order_item.elementos[t]._id)
														console.log(typeof(work_order_item.elementos[t]._id))

														console.log(service_id)
														console.log(typeof(service_id))

														// Obteniendo por _id
														if(el_work_order_item_id === service_id) {
															console.log('ENCONTRADO ELEMENTO!!!!!!! <<<<<')

															console.log('Elemento de proceso en camino!!!!! ------>>>')
															pot = t
															img_here = data_1.imagen_poste[data_1.imagen_poste.length - 1].path

															break
														}
													}

													work_order_item.elementos[pot].image_element.path = img_here

													console.log('ELEMENTO CARGADO 2222')

													var work_order_items_ = work_order_item.elementos

													work_order_items_[pot] = work_order_item.elementos[pot]

													work_order_item.elementos = []

													work_order_item.elementos = work_order_items_

												}

												// Guardando progreso de lista en la orden de trabajo
												work_order_item.save(function (err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al actualizar campo en la orden de trabajo',
															error: err
														})
													}

													console.log('Guardo +1 la orden de trabajo')

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
														// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
													 	// 		user: usuario_token,
													 	//  	work_order: work_order_item,
														// 		type_service: type_service,
														// 		service: service_element,
														// 		codigo_work_order: service_element.codigo_orden_trabajo
														// })

														res.status(200).json({
														    user: usuario_token,
														    work_order: work_order_item,
														   	type_service: type_service,
														    service: service_element,
														   	codigo_work_order: service_element.codigo_orden_trabajo
														})

													})

												})
												
											})

										})

									} else {
										// Actualizando los datos del poste. Sin Archivos multimedia
										console.log('Actualizando datos del POSTE. Efectuado con exito sin Imagen')

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

											// Incrementando progreso en +1
											work_order_item.progress_to_complete += 1

											console.log('PROGREESS TO COMPLETE!!')

											// Asignando estado: No Resuelto por defecto al enviar
											work_order_item.estado = work_order_status.no_resuelto

											var tipo_servicio_name = ''
												
											// Validando variable de tipo de servicio
											if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
												
												tipo_servicio_name = 'Cliente' 

											} else {

												tipo_servicio_name = 'Poste'

											}

											// Generando notificacion en tiempo real
											var noti = new Notificacion({
												work_order_id:      work_order_item._id,
												codigo_orden:       work_order_item.codigo_orden,
												users: {
													user_emiter:    usuario_token._id,
													user_receptor:  work_order_item.codigo_supervisor
												},
												type_notification:  config.notification_type.change_status,
												type_service:       tipo_servicio_name,
												type_answer:  		config.notification_type.type_answer.change_status.actualizada,
												message_copy: {
													detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
												},
												status_lectura: config.card_status.no_read
											})

											noti.save(function(err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
														error: err
													})
												}

												// Enviando notificacion: Asignando nueva orden de trabajo - poste
												notis_alert.notificar(noti.users.user_receptor, noti)


											})

											// Validando cambio de estado: Resuelto ?
											if(work_order_item.progress_to_complete >= elementos_length) {

												// Cambiando estado : Resuelto
												work_order_item.estado = work_order_status.resuelto

												// Asignando fecha de trabajo terminado
												work_order_item.fecha_trabajo_realizado = new Date()

												var tipo_servicio_name = ''
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente' 

												} else {

													tipo_servicio_name = 'Poste'

												}
												// 22222
												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.resuelta,
													message_copy: {
														detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)

												})

											}

											// Guardando progreso de lista en la orden de trabajo
											work_order_item.save(function (err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al actualizar campo en la orden de trabajo',
														error: err
													})
												}

												console.log('Guardo +1 la orden de trabajo')

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
													// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
												 //   		user: usuario_token,
												 //   		work_order: work_order_item,
													// 	type_service: type_service,
													// 	service: service_element,
													// 	codigo_work_order: service_element.codigo_orden_trabajo
													// })

													res.status(200).json({
										   		   		user: usuario_token,
										   		   		work_order: work_order_item,
										   				type_service: type_service,
										   				service: service_element,
										   				codigo_work_order: service_element.codigo_orden_trabajo
													})

												})

											})
											
										})

									}

								})

							} else if(type_service === 'cliente' && type_element === 'cliente'){
								Cliente.findById({'_id': service_id}, function (err, client_find22){
									if(err) {
										return res.status(500).json({
											status: 'error_server',
											message: 'Error al encontrar cliente',
											error: err
										})
									}
									
									// actualizar date del cliente
									var data_2 = {
										cliente_id:  			 req.body.cliente_id || client_find22.cliente_id,
										numero_cliente: 		 req.body.numero_cliente || client_find22.numero_cliente,
										codigo_via: 	   		 req.body.codigo_via || client_find22.codigo_via,
										distrito: 				 req.body.distrito || client_find22.distrito,
										urbanizacion: 			 req.body.urbanizacion || client_find22.urbanizacion, 
										numero_puerta: 			 req.body.numero_puerta || client_find22.numero_puerta,
										numero_interior: 		 req.body.numero_interior || client_find22.numero_interior,
										manzana: 				 req.body.manzana || client_find22.manzana,
										lote: 					 req.body.lote || client_find22.lote,
										nombre_de_cliente: 		 req.body.nombre_de_cliente || client_find22.nombre_de_cliente,
										type_residencial:  		 req.body.type_residencial || client_find22.type_residencial,
										is_maximetro_bt: 		 req.body.is_maximetro_bt || client_find22.is_maximetro_bt,
										type_conexion: 			 req.body.type_conexion || client_find22.type_conexion,
										type_acometida: 		 req.body.type_acometida || client_find22.type_acometida,
										type_cable_acometida:    req.body.type_cable_acometida || client_find22.type_cable_acometida,
										calibre_cable_acometida: req.body.calibre_cable_acometida || client_find22.calibre_cable_acometida,
										calibre_cable_matriz:    req.body.calibre_cable_matriz || client_find22.calibre_cable_matriz,
										observaciones: 			 req.body.observaciones || client_find22.observaciones,
										fecha_ejecucion: 		 req.body.fecha_ejecucion || client_find22.fecha_ejecucion,
										coordenada_X: 			 req.body.coordenada_X || client_find22.coordenada_X,
										coordenada_Y: 			 req.body.coordenada_Y || client_find22.coordenada_Y
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

											if(client_find.imagen_cliente.length === 0) {

												console.log('NOY HA ARCHIVOS MULTIMEDIA')

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

											}
											

											console.log('---------------')

											console.log('VIDEO LISTO PARA SACAR COVER')

											console.log(FilesCover2)

											// Validando Si es video
											if(FilesCover2.extension === 'mp4') {

												console.log('El archivo multimedia es un video mp4')

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
												
												// Incrementando progreso en +1
												work_order_item.progress_to_complete += 1

												console.log('PROGREESS TO COMPLETE!!')

												// Asignando estado: No Resuelto por defecto al enviar
												work_order_item.estado = work_order_status.no_resuelto

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente' 

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.actualizada,
													message_copy: {
														detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

												// Validando cambio de estado: Resuelto ?
												if(work_order_item.progress_to_complete >= elementos_length) {

													// Cambiando estado : Resuelto
													work_order_item.estado = work_order_status.resuelto

													// Asignando fecha de trabajo terminado
													work_order_item.fecha_trabajo_realizado = new Date()

													var tipo_servicio_name = ''
													// Validando variable de tipo de servicio
													if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
														
														tipo_servicio_name = 'Cliente' 

													} else {

														tipo_servicio_name = 'Poste'

													}

													// Generando notificacion en tiempo real
													var noti = new Notificacion({
														work_order_id:      work_order_item._id,
														codigo_orden:       work_order_item.codigo_orden,
														users: {
															user_emiter:    usuario_token._id,
															user_receptor:  work_order_item.codigo_supervisor
														},
														type_notification:  config.notification_type.change_status,
														type_service:       tipo_servicio_name,
														type_answer:  		config.notification_type.type_answer.change_status.resuelta,
														message_copy: {
															detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
														},
														status_lectura: config.card_status.no_read
													})

													noti.save(function(err) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
																error: err
															})
														}

														// Enviando notificacion: Asignando nueva orden de trabajo - poste
														notis_alert.notificar(noti.users.user_receptor, noti)


													})

												}

												// Actualizando portada de imagen de la orden de trabajo por elemento actualizado
												if(FilesCover2.extension === 'jpg') {
												
													var pot = 0
													var img_here = ''

													console.log('PROCESO START!!!')
													// Buscando en los elemento de la orden
													for(var x = 0; x <= work_order_item.elementos.length - 1; x++) {
														var el_work_order_item_id = JSON.stringify(work_order_item.elementos[x]._id)
														el_work_order_item_id = JSON.parse(el_work_order_item_id)

														console.log(work_order_item.elementos[x]._id)
														console.log(typeof(work_order_item.elementos[x]._id))

														console.log(service_id)
														console.log(typeof(service_id))

														// Obteniendo por _id
														if(el_work_order_item_id === service_id) {
															console.log('ENCONTRADO ELEMENTO!!!!!!! <<<<<')

															console.log('Elemento de proceso en camino!!!!! ------>>>')
															pot = x
															img_here = data_2.imagen_cliente[data_2.imagen_cliente.length - 1].path

															break
														}
													}

													work_order_item.elementos[pot].image_element.path = img_here

													console.log('ELEMENTO CARGADO 2222')

													var work_order_items_2 = work_order_item.elementos

													work_order_items_2[pot] = work_order_item.elementos[pot]

													work_order_item.elementos = []

													work_order_item.elementos = work_order_items_2
													
												}

												// Guardando progreso de lista en la orden de trabajo
												work_order_item.save(function (err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al actualizar campo en la orden de trabajo',
															error: err
														})
													}

													console.log('Guardo +1 la orden de trabajo')
												
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
														// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
													    // 		user: usuario_token,
													    //  	work_order: work_order_item,
														// 		type_service: type_service,
														// 		service: service_element,
														// 		codigo_work_order: service_element.codigo_orden_trabajo
														// })													

														res.status(200).json({
											   		   		user: usuario_token,
											   		   		work_order: work_order_item,
											   				type_service: type_service,
											   				service: service_element,
											   				codigo_work_order: service_element.codigo_orden_trabajo
														})

													})
												})

											})

										})

									} else if(req.files.hasOwnProperty('new_file_upload_360')) { 

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

											if(client_find.imagen_cliente.length === 0) {

												console.log('NOY HA ARCHIVOS MULTIMEDIA')

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

											}
											

											console.log('---------------')

											console.log('VIDEO LISTO PARA SACAR COVER')

											console.log(FilesCover2)

											// Validando Si es video
											if(FilesCover2.extension === 'mp4') {

												console.log('El archivo multimedia es un video mp4')

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
												
												// Incrementando progreso en +1
												work_order_item.progress_to_complete += 1

												console.log('PROGREESS TO COMPLETE!!')

												// Asignando estado: No Resuelto por defecto al enviar
												work_order_item.estado = work_order_status.no_resuelto

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente' 

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.actualizada,
													message_copy: {
														detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

												// Validando cambio de estado: Resuelto ?
												if(work_order_item.progress_to_complete >= elementos_length) {

													// Cambiando estado : Resuelto
													work_order_item.estado = work_order_status.resuelto

													// Asignando fecha de trabajo terminado
													work_order_item.fecha_trabajo_realizado = new Date()

													var tipo_servicio_name = ''
													// Validando variable de tipo de servicio
													if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
														
														tipo_servicio_name = 'Cliente' 

													} else {

														tipo_servicio_name = 'Poste'

													}

													// Generando notificacion en tiempo real
													var noti = new Notificacion({
														work_order_id:      work_order_item._id,
														codigo_orden:       work_order_item.codigo_orden,
														users: {
															user_emiter:    usuario_token._id,
															user_receptor:  work_order_item.codigo_supervisor
														},
														type_notification:  config.notification_type.change_status,
														type_service:       tipo_servicio_name,
														type_answer:  		config.notification_type.type_answer.change_status.resuelta,
														message_copy: {
															detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
														},
														status_lectura: config.card_status.no_read
													})

													noti.save(function(err) {
														if(err) {
															return res.status(500).json({
																status: 'error_server',
																message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
																error: err
															})
														}

														// Enviando notificacion: Asignando nueva orden de trabajo - poste
														notis_alert.notificar(noti.users.user_receptor, noti)


													})

												}

												// Actualizando portada de imagen de la orden de trabajo por elemento actualizado
												if(FilesCover2.extension === 'jpg') {
												
													var pot = 0
													var img_here = ''

													console.log('PROCESO START!!!')
													// Buscando en los elemento de la orden
													for(var x = 0; x <= work_order_item.elementos.length - 1; x++) {
														var el_work_order_item_id = JSON.stringify(work_order_item.elementos[x]._id)
														el_work_order_item_id = JSON.parse(el_work_order_item_id)

														console.log(work_order_item.elementos[x]._id)
														console.log(typeof(work_order_item.elementos[x]._id))

														console.log(service_id)
														console.log(typeof(service_id))

														// Obteniendo por _id
														if(el_work_order_item_id === service_id) {
															console.log('ENCONTRADO ELEMENTO!!!!!!! <<<<<')

															console.log('Elemento de proceso en camino!!!!! ------>>>')
															pot = x
															img_here = data_2.imagen_cliente[data_2.imagen_cliente.length - 1].path

															break
														}
													}

													work_order_item.elementos[pot].image_element.path = img_here

													console.log('ELEMENTO CARGADO 2222')

													var work_order_items_2 = work_order_item.elementos

													work_order_items_2[pot] = work_order_item.elementos[pot]

													work_order_item.elementos = []

													work_order_item.elementos = work_order_items_2
													
												}

												// Guardando progreso de lista en la orden de trabajo
												work_order_item.save(function (err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al actualizar campo en la orden de trabajo',
															error: err
														})
													}

													console.log('Guardo +1 la orden de trabajo')
												
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
														// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
													    // 		user: usuario_token,
													    //  	work_order: work_order_item,
														// 		type_service: type_service,
														// 		service: service_element,
														// 		codigo_work_order: service_element.codigo_orden_trabajo
														// })													

														res.status(200).json({
											   		   		user: usuario_token,
											   		   		work_order: work_order_item,
											   				type_service: type_service,
											   				service: service_element,
											   				codigo_work_order: service_element.codigo_orden_trabajo
														})

													})
												})

											})

										})

									} else if(req.body.suministro_derecha ||
										      req.body.suministro_izquierda ||
										      req.body.poste_cercano ||
										      req.body.medidor_derecha ||
										      req.body.medidor_izquierda) {

										console.log('CAMBIANDO SUMINISTRO')

										data_2 = {
											suministro_derecha:  	 req.body.suministro_derecha || '',
											suministro_izquierda:    req.body.suministro_izquierda || '',
											poste_cercano:  		 req.body.poste_cercano || '',
											medidor_derecha:    	 req.body.medidor_derecha || '',
											medidor_izquierda:  	 req.body.medidor_izquierda || ''
										}

										console.log('DATOS QUE VIENEN DEL ANDROID')
										console.log(data_2)


										// Suministro derecha
										data_2.suministro_derecha = JSON.parse(data_2.suministro_derecha)
										
										if(data_2.suministro_derecha.value === null) {

											console.log('El value el null')
											console.log(data_2.suministro_derecha)

											data_2.suministro_derecha = {
												coordX: data_2.suministro_derecha.coordX,
												coordY: data_2.suministro_derecha.coordY,
												value:  ""
											}

										} else if (data_2.suministro_derecha.coordX === null ||
											      data_2.suministro_derecha.coordY === null) {
											
											console.log('X o Y null')
											console.log(data_2.suministro_derecha)

											data_2.suministro_derecha = {
												coordX: "",
												coordY: "",
												value:  ""
											}

										} else {

											console.log('LIMPIO')
											console.log(data_2.suministro_derecha)

											data_2.suministro_derecha = {
												coordX: data_2.suministro_derecha.coordX,
												coordY: data_2.suministro_derecha.coordY,
												value:  data_2.suministro_derecha.value
											}

										}
										

										// Suministro izquierda
										data_2.suministro_izquierda = JSON.parse(data_2.suministro_izquierda)

										if(data_2.suministro_izquierda.value === null) {

											console.log('El value el null')
											console.log(data_2.suministro_izquierda)

											data_2.suministro_izquierda = {
												coordX: data_2.suministro_izquierda.coordX,
												coordY: data_2.suministro_izquierda.coordY,
												value:  ""
											}

										} else if (data_2.suministro_izquierda.coordX === null ||
											      data_2.suministro_izquierda.coordY === null) {
											
											console.log('X o Y null')
											console.log(data_2.suministro_izquierda)

											data_2.suministro_izquierda = {
												coordX: "",
												coordY: "",
												value:  ""
											}

										} else {

											console.log('LIMPIO')
											console.log(data_2.suministro_izquierda)

											data_2.suministro_izquierda = {
												coordX: data_2.suministro_izquierda.coordX,
												coordY: data_2.suministro_izquierda.coordY,
												value:  data_2.suministro_izquierda.value
											}

										}

										// Poste Cercano
										data_2.poste_cercano = JSON.parse(data_2.poste_cercano)

										if(data_2.poste_cercano.value === null) {

											console.log('El value el null')
											console.log(data_2.poste_cercano)

											data_2.poste_cercano = {
												coordX: data_2.poste_cercano.coordX,
												coordY: data_2.poste_cercano.coordY,
												value:  ""
											}

										} else if (data_2.poste_cercano.coordX === null ||
											      data_2.poste_cercano.coordY === null) {
											
											console.log('X o Y null')
											console.log(data_2.poste_cercano)

											data_2.poste_cercano = {
												coordX: "",
												coordY: "",
												value:  ""
											}

										} else {

											console.log('LIMPIO')
											console.log(data_2.poste_cercano)

											data_2.poste_cercano = {
												coordX: data_2.poste_cercano.coordX,
												coordY: data_2.poste_cercano.coordY,
												value:  data_2.poste_cercano.value
											}

										}

										console.log('DATOS ANTES DE GUARDAR')

										
										console.log(data_2)

										// Actualizando los datos del cliente. Sin archivo multimedia
										console.log('Actualizando datos del CLIENTE. CROQUIS')

										Cliente.update({'_id': service_id}, data_2, function (err) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													message: 'Error al encontrar cliente ne la base de datos',
													error: err
												})
											}
											console.log('Se actualizo data del cliente en la base de datos')				

											// Incrementando progreso en +1
											work_order_item.progress_to_complete += 1

											console.log('PROGREESS TO COMPLETE!!')

											// Asignando estado: No Resuelto por defecto al enviar
											work_order_item.estado = work_order_status.no_resuelto

											var tipo_servicio_name = ''
												
											// Validando variable de tipo de servicio
											if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
												
												tipo_servicio_name = 'Cliente' 

											} else {

												tipo_servicio_name = 'Poste'

											}

											// Generando notificacion en tiempo real
											var noti = new Notificacion({
												work_order_id:      work_order_item._id,
												codigo_orden:       work_order_item.codigo_orden,
												users: {
													user_emiter:    usuario_token._id,
													user_receptor:  work_order_item.codigo_supervisor
												},
												type_notification:  config.notification_type.change_status,
												type_service:       tipo_servicio_name,
												type_answer:  		config.notification_type.type_answer.change_status.actualizada,
												message_copy: {
													detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
												},
												status_lectura: config.card_status.no_read
											})

											noti.save(function(err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
														error: err
													})
												}

												// Enviando notificacion: Asignando nueva orden de trabajo - poste
												notis_alert.notificar(noti.users.user_receptor, noti)


											})

											// Validando cambio de estado: Resuelto ?
											if(work_order_item.progress_to_complete >= elementos_length) {

												// Cambiando estado : Resuelto
												work_order_item.estado = work_order_status.resuelto

												// Asignando fecha de trabajo terminado
												work_order_item.fecha_trabajo_realizado = new Date()

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente'

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.resuelta,
													message_copy: {
														detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

											}

											// Guardando progreso de lista en la orden de trabajo
											work_order_item.save(function (err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al actualizar campo en la orden de trabajo',
														error: err
													})
												}

												console.log('Guardo +1 la orden de trabajo')

												// Buscando datos del elemento actualizado
												Cliente.findById({'_id': service_id}, function (err, service_element) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar poste',
															error: err
														})
													}
													
													console.log('Elemento actualizadOOOOOO')
													console.log(service_element)

													// Render del elemento con los datos guardados
													// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
												 	// 		user: usuario_token,
												 	//  	work_order: work_order_item,
													// 		type_service: type_service,
													// 		service: service_element,
													// 		codigo_work_order: service_element.codigo_orden_trabajo
													// })

													res.status(200).json({
										   		   		user: usuario_token,
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

											// Incrementando progreso en +1
											work_order_item.progress_to_complete += 1

											console.log('PROGREESS TO COMPLETE!!')

											// Asignando estado: No Resuelto por defecto al enviar
											work_order_item.estado = work_order_status.no_resuelto

											var tipo_servicio_name = ''
												
											// Validando variable de tipo de servicio
											if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
												
												tipo_servicio_name = 'Cliente' 

											} else {

												tipo_servicio_name = 'Poste'

											}

											// Generando notificacion en tiempo real
											var noti = new Notificacion({
												work_order_id:      work_order_item._id,
												codigo_orden:       work_order_item.codigo_orden,
												users: {
													user_emiter:    usuario_token._id,
													user_receptor:  work_order_item.codigo_supervisor
												},
												type_notification:  config.notification_type.change_status,
												type_service:       tipo_servicio_name,
												type_answer:  		config.notification_type.type_answer.change_status.actualizada,
												message_copy: {
													detalle: `Un elemento de la orden de trabajo ${work_order_item.codigo_orden} ha sido Actualizada`
												},
												status_lectura: config.card_status.no_read
											})

											noti.save(function(err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
														error: err
													})
												}

												// Enviando notificacion: Asignando nueva orden de trabajo - poste
												notis_alert.notificar(noti.users.user_receptor, noti)


											})

											// Validando cambio de estado: Resuelto ?
											if(work_order_item.progress_to_complete >= elementos_length) {

												// Cambiando estado : Resuelto
												work_order_item.estado = work_order_status.resuelto

												// Asignando fecha de trabajo terminado
												work_order_item.fecha_trabajo_realizado = new Date()

												var tipo_servicio_name = ''
												
												// Validando variable de tipo de servicio
												if(work_order_item.tipo_servicio === 'tipo_servicio_C') {
													
													tipo_servicio_name = 'Cliente'

												} else {

													tipo_servicio_name = 'Poste'

												}

												// Generando notificacion en tiempo real
												var noti = new Notificacion({
													work_order_id:      work_order_item._id,
													codigo_orden:       work_order_item.codigo_orden,
													users: {
														user_emiter:    usuario_token._id,
														user_receptor:  work_order_item.codigo_supervisor
													},
													type_notification:  config.notification_type.change_status,
													type_service:       tipo_servicio_name,
													type_answer:  		config.notification_type.type_answer.change_status.resuelta,
													message_copy: {
														detalle: `La orden de trabajo ${work_order_item.codigo_orden} ha sido Terminada`
													},
													status_lectura: config.card_status.no_read
												})

												noti.save(function(err) {
													if(err) {
														return res.status(500).json({
															status: 'error_server',
															message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
															error: err
														})
													}

													// Enviando notificacion: Asignando nueva orden de trabajo - poste
													notis_alert.notificar(noti.users.user_receptor, noti)


												})

											}

											// Guardando progreso de lista en la orden de trabajo
											work_order_item.save(function (err) {
												if(err) {
													return res.status(500).json({
														status: 'error_server',
														message: 'Error al actualizar campo en la orden de trabajo',
														error: err
													})
												}

												console.log('Guardo +1 la orden de trabajo')

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
													// res.render('./plataforma/ordenes_trabajo/form_new_order/Update_type_service_data/cliente_form/index.jade', {
												 	// 		user: usuario_token,
												 	//  	work_order: work_order_item,
													// 		type_service: type_service,
													// 		service: service_element,
													// 		codigo_work_order: service_element.codigo_orden_trabajo
													// })

													res.status(200).json({
										   		   		user: usuario_token,
										   		   		work_order: work_order_item,
										   				type_service: type_service,
										   				service: service_element,
										   				codigo_work_order: service_element.codigo_orden_trabajo
													})

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
							   		user: usuario_token,
									work_order: work_order_item
								})
							}

						} else {
							// el elemento buscado no fue encontrado dentro de esta orden de trabajo

							// Render de la orden de trabajo
							// res.render('/plataforma/ordenes_trabajo/work_order_item/index.jade', {
				   			// 		status: 'not_found',
				   			// 		message: 'El elemento no fue encontrado dentro de la orden de trabajo',
				   			// 		user: usuario_token,
				   			// 		work_order: work_order_item
							// })

							res.status(200).json({
								status: 'not_found',
								message: 'El elemento no fue encontrado dentro de la orden de trabajo',
						   		user: usuario_token,
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

			}
		})
	})

	// API: DELETE - Eliminando contenido multimedia de un elemento, de orden de trabajo
	app.delete('/plataforma/work-order/:work_order_id/delete/:type_service/:service_id/item/:position', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
				   
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
				   								user: usuario_token,
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
				   								user: usuario_token,
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

			}
		})
	})

	// Buscando todos los elementos (Poste o cliente) dentro de una orden de trabajo. Modo Lectura por codigo de orden
	app.post('/plataforma/work-order/buscar/:type_service', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
					
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
									user: usuario_token,
									status: 'ok',
									type: 'poste',
									message: 'poste encontrado',
									service: poste
								})
							} else {
								res.status(200).json({
							   		user: usuario_token,
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
							   		user: usuario_token,
									status: 'ok',
									type: 'cliente',
									message: 'cliente encontrado',
									service: cliente
								})
							} else {
								console.log('cliente no encontrado')
								res.status(200).json({
							   		user: usuario_token,
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

			}
		})
	})

	// Buscando elementos (poste o cliente), por existencia de servicio: poste o cliente
	app.post('/plataforma/work-order/:type_service', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
					
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
									user: usuario_token,
									status: 'ok',
									message: 'poste encontrado',
									poste: poste
								})
							} else {
								res.status(200).json({
							   		user: usuario_token,
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
							   		user: usuario_token,
									status: 'ok',
									message: 'cliente encontrado',
									cliente: cliente
								})
							} else {
								console.log('cliente no encontrado')
								res.status(200).json({
							   		user: usuario_token,
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

			}
		})
	})

	// Render - read - element type work order
	app.post('/plataforma/work-order/:work_order_id/read/:type_service/:service_id',ensureAuthorized , function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
				   
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

					   			poste_render.imagen_poste.reverse()

					   			// Volteando el array de fotos
					   			poste_render.imagen_poste_galeria.fotos.reverse()
					   			poste_render.imagen_poste_galeria.videos.reverse()
					   			poste_render.imagen_poste_galeria.videos_360.reverse()

					   			console.log('FOTOS')
					   			console.log(poste_render.imagen_poste_galeria.fotos)

					   			console.log('VIDEOS')
					   			console.log(poste_render.imagen_poste_galeria.videos)

					   			console.log('360')
					   			console.log(poste_render.imagen_poste_galeria.videos_360)

				   				res.status(200).json({
				   					user: usuario_token,
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
	   				   				codigo_localidad: 		 cliente.codigo_localidad,
	   				   				manzana: 				 cliente.manzana,
	   				   				lote: 					 cliente.lote,
	   				   				nombre_de_cliente: 		 cliente.nombre_de_cliente,
	   				   				type_residencial:  		 cliente.type_residencial,
	   				   				is_maximetro_bt: 		 cliente.is_maximetro_bt,
	   				   				suministro_derecha:  	 cliente.suministro_derecha,
	   				   				suministro_izquierda:    cliente.suministro_izquierda,
	   				   				poste_cercano: 			 cliente.poste_cercano,
	   				   				medidor_derecha:    	 cliente.medidor_derecha,
	   				   				medidor_izquierda:  	 cliente.medidor_izquierda,
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

	   				   			// Volteando el arreglo, de los mas recientes
	   				   			cliente_render.imagen_cliente.reverse()
	   				   			
	   				   			cliente_render.imagen_cliente_galeria.fotos.reverse()
	   				   			cliente_render.imagen_cliente_galeria.videos.reverse()
	   				   			cliente_render.imagen_cliente_galeria.videos_360.reverse()

	   				   			console.log('FOTOS')
	   				   			console.log(cliente_render.imagen_cliente_galeria.fotos)

	   				   			console.log('VIDEOS')
	   				   			console.log(cliente_render.imagen_cliente_galeria.videos)

	   				   			console.log('360')
	   				   			console.log(cliente_render.imagen_cliente_galeria.videos_360)

	   			   				res.status(200).json({
	   			   					user: usuario_token,
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

			}
		})
	})

	// // Render - edit- element type work order
	app.post('/plataforma/work-order/:work_order_id/edit/:type_service/:service_id', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
				   
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

				   				res.status(200).json({
				   					user: usuario_token,
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
	   				   				poste_cercano: 			 cliente.poste_cercano,
					   				medidor_derecha:    	 cliente.medidor_derecha,
					   				medidor_izquierda:  	 cliente.medidor_izquierda,
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

					   			// Volteando el arreglo, de los mas recientes
					   			cliente_render.imagen_cliente.reverse()
					   			
					   			cliente_render.imagen_cliente_galeria.fotos.reverse()
					   			cliente_render.imagen_cliente_galeria.videos.reverse()
					   			cliente_render.imagen_cliente_galeria.videos_360.reverse()

					   			console.log('FOTOS')
					   			console.log(cliente_render.imagen_cliente_galeria.fotos)

					   			console.log('VIDEOS')
					   			console.log(cliente_render.imagen_cliente_galeria.videos)

					   			console.log('360')
					   			console.log(cliente_render.imagen_cliente_galeria.videos_360)

				   				res.status(200).json({
				   					user: usuario_token,
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

			}
		})
	})
	
	app.post('/plataforma/work-order/:work_order_id/change-status/:type_status', ensureAuthorized, function (req, res) {
		Usuarios.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
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
				   usuario_token.permiso === users_type.users_campo) {
				   
				   var work_order_id = req.params.work_order_id
				   var type_status = req.params.type_status 

					Work_Order.findById({'_id': work_order_id}, function (err, work_order_here) {
						if(err) {
							return res.status(500).json({
								status: 'error_server',
								message: 'Error al encontrar la orden de trabajo en la base de datos',
								error: err
							})
							
						} else {

							if(type_status === work_order_status.en_proceso) {
								if(req.body.route_make === true) {

									// Cambiando el estado de la orden de trabajo: 'En Proceso'
									work_order_here.estado = work_order_status.en_proceso

									// Guardando cambios
									work_order_here.save(function (err, work_order_saved) {
										if(err) {
											return res.status(500).json({
												status: 'error_server',
												message: 'Error al guardar cambios',
												error: err
											})
										}
										console.log('Estado de la orden de trabajo cambiado')

										var tipo_servicio_name = ''
										// Validando variable de tipo de servicio
										if(work_order_here.tipo_servicio === 'tipo_servicio_C') {
											
											tipo_servicio_name = 'Cliente' 

										} else {

											tipo_servicio_name = 'Poste'

										}

										// Generando notificacion en tiempo real
										var noti = new Notificacion({
											work_order_id:      work_order_here._id,
											codigo_orden:       work_order_here.codigo_orden,
											users: {
												user_emiter:    usuario_token._id,
												user_receptor:  work_order_here.codigo_supervisor
											},
											type_notification:  config.notification_type.change_status,
											type_service:       tipo_servicio_name,
											type_answer:  		config.notification_type.type_answer.change_status.progreso,
											message_copy: {
												detalle: `La orden trabajo ${work_order_here.codigo_orden} esta en progreso`
											},
											status_lectura: config.card_status.no_read
										})

										noti.save(function(err) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													message: 'Error al guardar notificacion en la base de datos',
													error: err
												})
											}

											console.log('Notificacion guardada en la base de datos')

											// Mostrando resultados
											res.status(200).json({
												status: 'ok',
												message: 'La Orden de trabajo - estado : En Proceso',
												work_order: work_order_saved,
												user: usuario_token
											})

										})

									})
									
								}

							} else if (type_status === work_order_status.reportado) {

								// Cambiando el estado de la orden de trabajo: 'reportado'
								work_order_here.estado = work_order_status.reportado
								
								var multimedia_collections = []

								console.log('Evento reportado!!')

								console.log('FILESSSS')
								console.log(req.files)

								// Enviando notificación para aceptar al back office
						   		if(req.files.hasOwnProperty('reporte_multimedia')) {

						   			console.log('ENTRO A LA VISTA MULTIMEDIA PARA REPORTE')

						   			var data_imagenes

									// Validando path uploads ----
									var FilesCover = req.files.reporte_multimedia

									console.log('MULTIMEDIA D SUBIDA')
									console.log(req.files.reporte_multimedia)

									var path_file = FilesCover.path
						            console.log(path_file)

						            // path uploads iniciales
						            var uploads_1 = 'uploads/'
						            var uploads_2 = 'uploads\\'

						            // Validando reemplazo del inicio del path uploads
						            if (path_file.indexOf(uploads_1) != -1) {
						                FilesCover.path = FilesCover.path.replace('uploads/','/')
						                data_imagenes = FilesCover

						            } else if (path_file.indexOf(uploads_2) != -1) {
						                FilesCover.path = FilesCover.path.replace('uploads\\','/')
						                data_imagenes = FilesCover
						            
						            } else {
						                console.log('Ocurrió un error con el path')
						                console.log(path_file)
						            
						            }
						            
									multimedia_collections.push(data_imagenes)

									var tipo_servicio_name = ''
									// Validando variable de tipo de servicio
									if(work_order_here.tipo_servicio === 'tipo_servicio_C') {
										
										tipo_servicio_name = 'Cliente' 

									} else {

										tipo_servicio_name = 'Poste'

									}
									console.log('antes de crear notificacion')

									console.log('Datos de la orden de trabajo')
									console.log(work_order_here)


									// Generando notificacion en tiempo real
									var noti = new Notificacion({
										work_order_id:      work_order_here._id,
										codigo_orden:       work_order_here.codigo_orden,
										users: {
											user_emiter:    usuario_token._id,
											user_receptor:  work_order_here.codigo_supervisor
										},
										type_notification:  config.notification_type.reporte,
										type_service:       tipo_servicio_name,
										type_answer: 		'',
										content:   {
											title:      req.body.reporte_title || 'Orden de Trabajo Reportada',
											detalle:    req.body.reporte_detalle || 'Esta orden de trabajo no, se pudo realizar, debido a un problema. Contactar por chat para detalles', 
											multimedia: multimedia_collections || { path: '/images/elemento_defaul.png' }
										},
										message_copy: {
											detalle: `El usuario ${usuario_token._id} Reporto la orden de trabajo ${work_order_here.codigo_orden}`
										},
										status_lectura: config.card_status.no_read
									})

									console.log('Notificacion creada')
									console.log(noti)

									console.log('Notificacion creada')
									noti.save(function(err) {
										if(err) {
											return res.status(500).json({
												status: 'error_server',
												message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
												error: err
											})
										}

										console.log('DATOS DE LA ORDEN')
										console.log(work_order_here)

										console.log('Datos de la notificacion')
										console.log(noti)

										// Enviando notificacion: Asignando nueva orden de trabajo - poste
										notis_alert.notificar(noti.users.user_receptor, noti)

										console.log('La Notificaicon fue guardada')

										// Guardando cambios
										work_order_here.save(function (err, work_order_saved) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													message: 'Error al guardar cambios',
													error: err
												})
											}
											
											console.log('Estado de la orden de trabajo cambiado')

											// Mostrando resultados
											res.status(200).json({
												status: 'ok',
												message: 'La Orden de trabajo - estado : Reportado',
												work_order: work_order_saved,
												user: usuario_token
											})
												
										})

									})

								} else {

									console.log('No hay imagen')
									
									var noti = new Notificacion({
										work_order_id:      work_order_here._id,
										codigo_orden:       work_order_here.codigo_orden,
										users: {
											user_emiter:    usuario_token._id,
											user_receptor:  work_order_here.codigo_supervisor
										},
										type_notification:  config.notification_type.reporte,
										type_service:       tipo_servicio_name,
										type_answer: 		'',
										content:   {
											title:      req.body.reporte_title || 'Orden de Trabajo Reportada',
											detalle:    req.body.reporte_detalle || 'Esta orden de trabajo no, se pudo realizar, debido a un problema. Contactar por chat para detalles', 
											multimedia: { path: '/images/elemento_defaul.png' }
										},
										message_copy: {
											detalle: `El usuario ${usuario_token._id} Reporto la orden de trabajo ${work_order_here.codigo_orden}`
										},
										status_lectura: config.card_status.no_read
									})


									noti.save(function(err) {
										if(err) {
											return res.status(500).json({
												status: 'error_server',
												message: 'Error al encontrar guardar notificacion de reporte en la base de datos',
												error: err
											})
										}

										// Enviando notificacion: Asignando nueva orden de trabajo - poste
										notis_alert.notificar(noti.users.user_receptor, noti)

										console.log('La Notificaicon fue guardada')

										// Guardando cambios
										work_order_here.save(function (err, work_order_saved) {
											if(err) {
												return res.status(500).json({
													status: 'error_server',
													message: 'Error al guardar cambios',
													error: err
												})
											}
											
											console.log('Estado de la orden de trabajo cambiado')

											// Mostrando resultados
											res.status(200).json({
												status: 'ok',
												message: 'La Orden de trabajo - estado : Reportado',
												work_order: work_order_saved,
												user: usuario_token
											})
												
										})

									})
									
								}

							} else {
								// Generando respuesta amigable, de error de parametro pasado
								res.status(200).json({
									status: 'not_found',
									message: 'No se Proceso, parametro type_status no correcta',
									work_order: work_order_here,
									user: usuario_token
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

}

module.exports = FormPlataformWorkOrder

