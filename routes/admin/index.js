var express = require('express')
var app = express.Router()

// archivo config
var config = require('../../config')

// DataBase
var Users = require('../../models/usuarios')

// Dashboard Plataforma Admin
// Permiso de acceso usuario

var config = require('../../config')
var permiso = config.users_access

// Login access - user admin 
// app.get('/login', function (req, res) {
// 	res.render('./admin/login', {
// 		msg: 'Necesitas Logearte Primero'
// 	})
// })

app.get('/', function (req, res) {

	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		// res.render('./admin/dashboard', {
		// 	user: req.user
		// })

		res.status(200).json({
			status: 'ok'
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

module.exports = app
