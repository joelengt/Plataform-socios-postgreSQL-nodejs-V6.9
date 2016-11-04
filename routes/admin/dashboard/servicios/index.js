var express = require('express')
var app = express.Router()

var Work_Order = require('../../../../models/orden_trabajo')
var Cliente = require('../../../../models/orden_trabajo/cliente')
var Poste = require('../../../../models/orden_trabajo/poste')

var config = require('../../../../config.js')

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

// Render vista select servicios
app.get('/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		// Render lista select - tipo de servicio
		// res.render('./admin/dashboard/servicios/index.jade', {
		// 	user: req.user
		// })

		res.status(200).json({
			user: req.user
		})

	 } else {
	 	  console.log('El usuario no esta autentificado. Requiere logearse')
	      res.status(403).json({
	        status: 'not_access',
	        message: 'El usuario no esta autentificado. Requiere logearse'
	      })
	 }
})

app.get('/:type_service/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		var type_service = req.params.type_service

		if(type_service === 'poste') {
			// Lista de postes
			Poste.find(function (err, postes) {
				if(err) {
					return res.status(500).json({
						status: 'error_server',
						message: 'Error al encontrar lista de postes en la base de datos',
						error: err
					})
				}

				// Render array de lista postes
				res.status(200).json({
					user: req.user,
					services: postes
				})
			})


		} else if(type_service === 'cliente'){
			// Lista de cientes 
			Cliente.find(function (err, clientes) {
				if(err) {
					return res.status(500).json({
						status: 'error_server',
						message: 'Error al encontrar lsita de clientes en la base de datos',
						error: err
					})
				}
				// Render array de lista postes
				res.status(200).json({
					user: req.user,
					services: clientes
				})
			})

		} else {
			res.status(404).json({
				status:'not_found',
				message: 'El parametro consultado no fue encontrado'
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

module.exports = app
