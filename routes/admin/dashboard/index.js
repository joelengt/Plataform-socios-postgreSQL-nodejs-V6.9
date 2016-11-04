var express = require('express')
var app = express.Router()

var config = require('../../../config.js')

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

app.get('/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		console.log('El usuario tiene acceso a la plataforma')
		// res.render('./admin/dashboard/index.jade', {
		// 	   user: req.user
		// })

		res.status(200).json({
			status: 'ok',
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
