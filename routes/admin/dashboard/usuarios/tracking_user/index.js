var express = require('express')
var app = express.Router()

var Contratista = require('../../../../../models/usuarios/contratistas/index.js')
var Empresas_Cliente = require('../../../../../models/usuarios/empresas_clientes/index.js')

var FindUserData = require('../../../../../controllers/find_user_data/index.js')
var TrackingUsers = require('../../../../../models/usuarios/tracking_users/index.js')

var Users = require('../../../../../models/usuarios/index.js')

var config = require('../../../../../config.js')

var users_type = config.users_access

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

app.get('/list', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers ||
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		console.log('HAA')

		Users.find(function(err, usuarios) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar obtener todos los usuarios',
					error: err
				})
			}

			console.log('Lista de USUARIOS')
			console.log(usuarios)
			/*
			res.render('./admin/dashboard/usuarios/tracking_user/list/index.jade',{
				user: req.user,
				usuarios: usuarios
			})*/

			res.status(200).json({
				user: req.user,
			 	usuarios: usuarios
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

app.get('/:user_id/draw', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
	   	
	   	var user_id = req.params.user_id

		// Buscando info de tracking de usuario en la DB
		TrackingUsers.findOne({'user_id': user_id}, function (err, tracking_list) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar el tracking del usuario buscado',
					error: err
				})
			}

			console.log('Track de listaAAAAA ---- ')
			console.log(tracking_list)

			if(tracking_list === null || 
			   tracking_list === undefined || 
			   tracking_list.track_info.length === 0 ) {

				console.log('El usuario no tiene historial de tracking en la base de datos')

				tracking_list = {
					track_info: []
				}

				FindUserData(user_id, function(err, user_reponse) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al obtener datos legibles del usuario',
							error: err
						})
					}

					// res.render('./admin/dashboard/usuarios/tracking_user/index.jade', {
					// 		status: 'ok',
			 		// 		user: req.user,
			 		// 		tracking_list: tracking_list,
			 		// 		user_info: user_reponse
			 		// 	})

			 		console.log('LISTO PARA SALIR')
			 		console.log(user_reponse)

		 			res.status(200).json({
		 				status: 'ok',
		 	 			user: req.user,
		 	 			tracking_list: tracking_list,
		 	 			user_info: user_reponse
		 	 		})

				})

		 	} else {

		 		// Ordenando Reseñas cronologicamene
		 		var Articles_dates = []

		 		var tracking_list_ = tracking_list.track_info.reverse()

		 		tracking_list.track_info = []

		 		for(var k = 0; k <= 20; k++) {
		 			if(tracking_list_[k] === undefined) {
		 			            
		 			    break
		 			     
		 			} else {
		 			      
		 				tracking_list.track_info[k] = tracking_list_[k]

		 			}
		 		}

		 		// Ordenando por fecha
		 		for(var q = 0; q <= tracking_list.track_info.length - 1; q++) {
		 			var element = {
		 				data: tracking_list.track_info[q],
		 				date_number: 0
		 			}	

		 			console.log('TRACK INFO primerp nivel')
		 			console.log(element.data.date)

		 			// convirtiendo dato a numbero comparable
		 			var new_data = new Date(element.data.date).getTime()

		 			element.date_number = Number(new_data)
		 			tracking_list.track_info[q] = element

		 			// Llenando datos con fechas
		 			Articles_dates[q] = new_data
		 		}

		 		console.log('DATOS DE ORDEN DE FECHA NUMERicos')
		 		console.log(Articles_dates)

		 		console.log('------------------')

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
		 			for(var s = 0; s <= tracking_list.track_info.length - 1; s++) {
		 				var el_article = tracking_list.track_info[s]

		 				if(Articles_dates[c] === el_article.date_number) {
		 					console.log('Elemento date encontrado para este articulo')
		 					//tracking_list.track_info[c] = el_article.data
		 					Article_collections[c] = tracking_list.track_info[s].data
		 					
		 					break
		 				}
		 			
		 			}
		 		}

		 		// console.log('EL usuario tiene rastreo de tracking en la DB')

		 		var new_tracking_list = []

		 		for(var i = 0 ; i <= Article_collections.length - 1 ; i++) {

		 			var el_track = Article_collections[i]

		 			// console.log('Items del recorrido!')
		 			// console.log(el_track)
		 			// console.log(typeof(el_track))

		 			// Validando fecha en formato amigable

		 			console.log('Fecha del track buscado')

		 			var RTime = new Date(el_track.date)
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

		 			var new_item = {
		 				date:   date_template,
		 				coordX: el_track.coordX,
		 				coordY: el_track.coordY
		 			}

		 			new_tracking_list.push(new_item)

		 		}

		 		new_tracking_list.reverse()
		 		
		 		var tracking_list_Item = {
		 			user_id: user_id,
		 		 	track_info: new_tracking_list
		 		}	

		 		FindUserData(user_id, function(err, user_reponse) {
		 			if(err) {
		 				return res.status(500).json({
		 					status: 'error_server',
		 					message: 'Error al obtener datos legibles del usuario',
		 					error: err
		 				})
		 			}

		 			// Obteniendo Datos Legibles con copy del usuario


		 			console.log('Lista de TRACKING DEL USUARIO')
		 			console.log(tracking_list_Item)
		 			console.log('------- FIN')

		 			console.log('DATOS DEL USUARIO')
		 			console.log(user_reponse)

 					res.status(200).json({
 						status: 'ok',
 			 			user: req.user,
 			 			tracking_list: tracking_list_Item,
 			 			user_info: user_reponse
 			 		})


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

app.get('/:user_id/draw/more', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
	   	
	   	var user_id = req.params.user_id

		// Buscando info de tracking de usuario en la DB
		TrackingUsers.findOne({'user_id': user_id}, function (err, tracking_list) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar el tracking del usuario buscado',
					error: err
				})
			}

			console.log('Track de listaAAAAA ---- ')
			console.log(tracking_list)

			if(tracking_list === null || 
			   tracking_list === undefined || 
			   tracking_list.track_info.length === 0 ) {

				console.log('El usuario no tiene historial de tracking en la base de datos')

				tracking_list = {
					track_info: []
				}

				FindUserData(user_id, function(err, user_reponse) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al obtener datos legibles del usuario',
							error: err
						})
					}

					// res.render('./admin/dashboard/usuarios/tracking_user/index.jade', {
					// 		status: 'ok',
			 		// 		user: req.user,
			 		// 		tracking_list: tracking_list,
			 		// 		user_info: user_reponse
			 		// 	})

			 		console.log('LISTO PARA SALIR')
			 		console.log(user_reponse)

		 			res.status(200).json({
		 				status: 'ok',
		 	 			user: req.user,
		 	 			tracking_list: tracking_list,
		 	 			user_info: user_reponse
		 	 		})

				})

		 	} else {

		 		// Ordenando Reseñas cronologicamene
		 		var Articles_dates = []

		 		// Ordenando por fecha
		 		for(var q = 0; q <= tracking_list.track_info.length - 1; q++) {
		 			var element = {
		 				data: tracking_list.track_info[q],
		 				date_number: 0
		 			}	

		 			console.log('TRACK INFO primerp nivel')
		 			console.log(element.data.date)

		 			// convirtiendo dato a numbero comparable
		 			var new_data = new Date(element.data.date).getTime()

		 			element.date_number = Number(new_data)
		 			tracking_list.track_info[q] = element

		 			// Llenando datos con fechas
		 			Articles_dates[q] = new_data
		 		}

		 		console.log('DATOS DE ORDEN DE FECHA NUMERicos')
		 		console.log(Articles_dates)

		 		console.log('------------------')

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
		 			for(var s = 0; s <= tracking_list.track_info.length - 1; s++) {
		 				var el_article = tracking_list.track_info[s]

		 				if(Articles_dates[c] === el_article.date_number) {
		 					console.log('Elemento date encontrado para este articulo')
		 					//tracking_list.track_info[c] = el_article.data
		 					Article_collections[c] = tracking_list.track_info[s].data
		 					
		 					break
		 				}
		 			
		 			}
		 		}

		 		// console.log('EL usuario tiene rastreo de tracking en la DB')

		 		var new_tracking_list = []

		 		for(var i = 0 ; i <= Article_collections.length - 1 ; i++) {

		 			var el_track = Article_collections[i]

		 			// console.log('Items del recorrido!')
		 			// console.log(el_track)
		 			// console.log(typeof(el_track))

		 			// Validando fecha en formato amigable

		 			console.log('Fecha del track buscado')

		 			var RTime = new Date(el_track.date)
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

		 			var new_item = {
		 				date:   date_template,
		 				coordX: el_track.coordX,
		 				coordY: el_track.coordY
		 			}

		 			new_tracking_list.push(new_item)

		 		}

		 		new_tracking_list.reverse()
		 		
		 		var tracking_list_Item = {
		 			user_id: user_id,
		 		 	track_info: new_tracking_list
		 		}	

		 		FindUserData(user_id, function(err, user_reponse) {
		 			if(err) {
		 				return res.status(500).json({
		 					status: 'error_server',
		 					message: 'Error al obtener datos legibles del usuario',
		 					error: err
		 				})
		 			}

		 			// Obteniendo Datos Legibles con copy del usuario


		 			console.log('Lista de TRACKING DEL USUARIO')
		 			console.log(tracking_list_Item)
		 			console.log('------- FIN')

		 			console.log('DATOS DEL USUARIO')
		 			console.log(user_reponse)

 					res.status(200).json({
 						status: 'ok',
 			 			user: req.user,
 			 			tracking_list: tracking_list_Item,
 			 			user_info: user_reponse
 			 		})


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

module.exports = app
