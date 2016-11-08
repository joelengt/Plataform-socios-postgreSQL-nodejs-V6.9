var express = require('express')
var app = express.Router()

var Usuarios = require('../../models/usuarios')
var Contratista = require('../../models/usuarios/contratistas/index.js')

var config = require('../../config.js')

var users_type = config.users_access

var work_order_status = config.status

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

app.get('/', ensureAuthorized, function (req, res) {
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
				
			   // res.render('./plataforma/ordenes_trabajo/index.jade',{
			   // 	user: usuario_token
			   // })

				res.status(200).json({
					user: usuario_token
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

// When login is success get first info here
app.get('/success', function (req, res) {
	console.log('Data success: ')
	console.log(req.user)
	
	if(req.user) {
		res.status(200).json({
			user: req.user,
			token_auth: req.user.token_auth
		})

	} else {
		// El usuario no se encuentra
		res.status(200).json({
			status: 'El usuario No esta autentificado y no tiene permiso'
		})
	}
})

module.exports = app
