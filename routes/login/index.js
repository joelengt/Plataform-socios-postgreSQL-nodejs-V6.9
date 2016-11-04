var express = require('express')
var app = express.Router()

// Login para usuarios de campo

// Cliente Web access fail
app.get('/dashboard/fail', function (req, res) {
	console.log('Fallo login')

	var flash_answer = req.flash('message')[0]
	console.log(flash_answer)

	// Respuesta json
	res.status(403).json({
		status: 'not_access',
		message: flash_answer
	})

})

// Cliente Mobile access fail
app.get('/plataforma/fail', function (req, res) {
	console.log('Fallo login!!')

	var flash_answer = req.flash('message')[0]
	console.log(flash_answer)

	res.status(403).json({
		status: 'not_access',
		message: 'El usuario o contraseña son incorrectas'
	})

	// Respuesta json
	/*res.status(403).json({
		status: 'not_access',
		message: flash_answer
	})*/

})


module.exports = app
