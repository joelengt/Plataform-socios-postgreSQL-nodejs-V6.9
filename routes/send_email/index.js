var express = require('express')
var app = express.Router()

var Users = require('../../models/usuarios/index.js')

var handleSayHello = require('../../controllers/send_email/index.js')

function ValidarteGetUserData (user_data, callback) {
	console.log('Callback, llega del proceso')

	// Comprobar si la data del usurio ingresado es correcta
	Users.findOne({'email': user_data.email}, function (err, user_found) {
		if(err) {
			return callback(err)
		}

		console.log('Respuesta de la busqueda');
		console.log(user_found)

		if(user_found === null) {
			
			console.log('El elemento es null');
			console.log('El email, no es correcto');
			callback(err, { status: 'fail', message: 'El email ingresado no es correcto. Intenta nuevamente'})

		} else {

			if(user_found.email === user_data.email &&
			   user_found.dni === user_data.dni) {
				console.log('El usuario fue encontrado')

				callback(err, { status: 'ok', user_found: user_found, message: 'Te hemos enviado tu usuario y contraseña al correo electronico'})

			} else if (user_found.email !== user_data.email) {
				console.log('El email, solicitado no coincide');

				callback(err, { status: 'fail', message: 'El email ingresado no es correcto. Intenta nuevamente'})

			} else if (user_found.dni !== user_data.dni) {
				console.log('El dni solicitado, no coincide')
				callback(err, { status: 'fail', message: 'El dni ingresado no es correcto. Intenta nuevamente'})

			} else {
				console.log('Los datos ingresados no son validos')
				callback(err, { status: 'fail', message: 'Los datos ingresados son incorrectos. Intenta nuevamente'})
			}

		}

	})

}

app.post('/send', function (req, res) {

	var user_data = {
		email: req.body.email,
		dni:   req.body.dni
	}

	console.log('Datos obtenidos');
	console.log(user_data)

	if(user_data.email !== '' && user_data.email !== null && user_data.email !== undefined &&
	   user_data.dni !== '' && user_data.dni !== null && user_data.dni !== undefined) {

		console.log('Los datos son aceptables para entrar en el proces')
		ValidarteGetUserData(user_data, function (err, response) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					error: err
				})
			}

			console.log('Proceso del callback terminado')

			if(response.status === 'ok') {

				// Definiendo datos del usuario receptor
				var user_data_send = {
					name:  response.user_found.names,
					email: response.user_found.email,
					data: {
						username: response.user_found.username,
						password: response.user_found.password
					}
				}

				console.log('Datos del usuario a recibir')
				console.log(user_data_send)
				
				handleSayHello(user_data_send, function (err, result) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							error: err,
							message: 'Error al enviar email. Intente más tarde. Si el problema continua, contactar con soporte'
						})
					}

					console.log('RESULTADO DEL ENVIO EMAIL')
					console.log(result)
					
					res.status(200).json({
						status: 'ok',
						message: result.message
					})

				})

			} else {
				// La respuesta fue fallada

				res.status(200).json({
					status: response.status,
					message: response.message
				})

			}	

		})

	} else {
		console.log('Los datos recibidos no son aceptables para el proceso')

		res.status(200).json({
			status: 'fail',
			message: 'Los campos ingresados no son correctos'
		})

	}

})

module.exports = app