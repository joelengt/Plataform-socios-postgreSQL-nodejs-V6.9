var express = require('express')
var app = express.Router()

var config = require('../../../../config.js')
var users_type = config.users_access

app.get('/list', function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.users_campo) {

		console.log('HAA')

	   	res.render('./plataforma/usuarios/tracking_user/index.jade',{
	   		user: req.user
	   	})

	   	// res.status(200).json({
	   	// 	user: req.user
	   	// })

	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
		 res.status(403).json({
		    status: 'not_access',
		    message: 'El usuario no esta autentificado. Requiere logearse'
		 })
	}
})

module.exports = app
