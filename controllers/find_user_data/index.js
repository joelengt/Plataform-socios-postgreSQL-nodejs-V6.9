var Users = require('../../models/usuarios/index.js')
var Contratista = require('../../models/usuarios/contratistas/index.js')
var Empresas_Cliente = require('../../models/usuarios/empresas_clientes/index.js')

var config = require('../../config')

// Obteniendo nombre de empresa y empresa contratista del usario
function GetNameBeautifull (user_here, cb) {
	// console.log('dentro del callback')
	// Obteniendo copy de la empresa admin
	Empresas_Cliente.findById({'_id': user_here.empresa_admin}, function (err, empresa_admin) {
		if(err) {
			return cb(err)
		}

		var new_user_info = {
			_id:           user_here._id,
			empresa_admin: user_here.empresa_admin,  // Empresa admin a la que pertenece: Astrum, Edelnor, etc
			contratista:   user_here.contratista,  // Empresa contratada, a la que pertenece el usuario de campo
			names: 		   user_here.names,
			last_names:    user_here.last_names,
			full_name:     user_here.full_name,
			photo: 	       user_here.photo,
			dni:           user_here.dni,
			email:   	   user_here.email,
			username:      user_here.username,
			password:      user_here.password,
			permiso:       user_here.permiso,
			token_auth:    user_here.token_auth,
			fecha_creada:  user_here.fecha_creada
		}

		//  Asignando empresa con name al usuario
		new_user_info.empresa_admin = empresa_admin.name

		console.log('llegada parte')
		console.log(new_user_info)

		console.log('empresa contratista')
		console.log(user_here.contratista)

		// Obteniendo copy de la empresa contratista
		Contratista.findById({'_id': user_here.contratista}, function (err, empresa_contratista) {
			if(err) {
				return cb(err)
			}

			// Asignando nombre de la empresa contratista al usuario
			new_user_info.contratista = empresa_contratista.name

			// console.log('Datos legibles del nuevo usuario DENTRO DEL CALLBACK')
			// console.log(new_user_info)

			console.log('saliendo del callback')
			cb(err, new_user_info)

		})

	})

}

// Buscando datos del usuario en la base de datos
function FindUserData(user_id, cb) {
	Users.findById({'_id': user_id}, function (err, user_find) {
		if(err) {
			return cb(err)
		}

 		GetNameBeautifull(user_find, function(err, user_reponse) {
 			if(err) {
 				return cb(err)
 			}

			cb(err, user_reponse)

 		})

	})
}

module.exports = FindUserData
