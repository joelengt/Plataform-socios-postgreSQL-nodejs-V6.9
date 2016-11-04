var express = require('express')
var app = express.Router()

var Users = require('../../../../models/usuarios/index.js')
var FindUserData = require('../../../../controllers/find_user_data/index.js')

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

// URI: Datos de perfil de usuario
app.get('/me', ensureAuthorized, function (req, res) {

	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
	        return res.status(500).json({
	        	status: 'error_server',
	        	message: 'Usuario No encontrado en la base de datos',
	        	error: err
	        })

		} else {
		
			if(req.user.permiso === users_type.onwers || 
			   req.user.permiso === users_type.admins ||
			   req.user.permiso === users_type.officers ||
			   req.user.permiso === users_type.users_campo) {
				
				var user_id = usuario_token._id
				// Buscando usuario por id de session en la base de datos
				FindUserData(user_id, function (err, user_found) {
					if(err) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Usuario No encontrado en la base de datos',
							error: err
						})

					}

					res.status(200).json({
						user: user_found
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

// API: Actualizar datos de perfil
app.put('/me/update', ensureAuthorized, function (req, res) {

	Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
		if(err) {
	        return res.status(500).json({
	        	status: 'error_server',
	        	message: 'Usuario No encontrado en la base de datos',
	        	error: err
	        })

		} else {
			
			if(req.user.permiso === users_type.onwers || 
			   req.user.permiso === users_type.admins ||
			   req.user.permiso === users_type.officers ||
			   req.user.permiso === users_type.users_campo) {
			   
			   var user_id = usuario_token._id

			   // Buscando datos exitentes del usuario en la base de datos
		   	   Users.findById({'_id': user_id}, function (err, user_found1) {
		   	   		if(err) {
		   	   			return res.status(500).json({
		   	   				status: 'error_server',
		   	   				message: 'Error encontrar usuario por id',
		   	   				error: err
		   	   			})
		   	   		}

		   	   		// Validando llenado de campos en la DB, del usuario
		   	   		var data = {
		  				empresa_admin: req.body.empresa_admin || user_found1.empresa_admin, 
		  				contratista:   req.body.contratista || user_found1.contratista,  
		  				names: 		   req.body.names || user_found1.names,
		  				last_names:    req.body.last_names || user_found1.last_names,
		  				full_name:     req.body.full_name || user_found1.full_name,
		  				dni:           req.body.dni || user_found1.dni,
		  				email:   	   req.body.email || user_found1.email,
		  				username:      req.body.username || user_found1.username,
		  				password:      req.body.password || user_found1.password,
		  				permiso:       req.body.permiso || user_found1.permiso
		   	   		}

		   	   		if(req.files.hasOwnProperty('avatar_perfil_me')) {

		   				// Validando path uploads ----
		   				var FilesCover = req.files.avatar_perfil

		   				var path_file = FilesCover.path
		   	            console.log(path_file)

		   	            // path uploads iniciales
		   	            var uploads_1 = 'uploads/'
		   	            var uploads_2 = 'uploads\\'

		   	            // Validando reemplazo del inicio del path uploads
		   	            if (path_file.indexOf(uploads_1) != -1) {
		   	                FilesCover.path = FilesCover.path.replace('uploads/','/')
		   	                data.photo = FilesCover

		   	            } else if (path_file.indexOf(uploads_2) != -1) {
		   	                FilesCover.path = FilesCover.path.replace('uploads\\','/')
		   	                data.photo = FilesCover
		   	            
		   	            } else {
		   	                console.log('Ocurrió un error con el path')
		   	                console.log(path_file)
		   	            
		   	            }

		   	            // Asignando nuevo contenido de imagen de imagen
		   				data.photo = FilesCover

		   				console.log('Data de usuario a actualizar')
		   				console.log(data)
		   	   						
		   	   			// Actualizando perfil de usuario con photo
		   		   		Users.update({'_id': user_id}, data, function (err) {
		   	   				if(err) {
		   	   					return res.status(500).json({
		   	   						status: 'error_server',
		   	   						message: 'Error al actualizar usuario',
		   	   						error: err
		   	   					})
		   	   				}

		   	   				FindUserData(user_id, function (err, user_found1) {
		   				   		if(err) {
		   				   			return res.status(500).json({
		   				   				status: 'error_server',
		   				   				message: 'Error encontrar usuario por id',
		   				   				error: err
		   				   			})
		   				   		}
		   				   		/*
		   				   		// Relogin session passport
		   						req.login(user_found1, function (err) {
		   							if(err) {
		   								return res.status(500).json({
			   				   				status: 'error_server',
			   				   				message: 'Error al encontrar relogear',
			   				   				error: err
			   				   			})
		   							}
		   						})*/

		   						res.status(200).json({
		   							status: 'uset_update',
		   							message: 'Datos de usuario actualizado',
		   							user_updated: user_found1,
		   							user: req.user
		   						})

		   				   	})

		   		   		})

		   	   		} else {
		   	   			// Actualizando perfil de usuario sin photo
		   		   		Users.update({'_id': user_id}, data, function (err) {
		   	   				if(err) {
		   	   					return res.status(500).json({
			   				   		status: 'error_server',
			   				   		message: 'Error al actualizar usuario',
			   				   		error: err
	   				   			})
		   	   				}

		   	   				FindUserData(user_id, function (err, user_found1) {
		   				   		if(err) {
		   				   			return res.status(500).json({
				   				   		status: 'error_server',
				   				   		message: 'Error encontrar usuario por id',
				   				   		error: err
		   				   			})
		   				   		}
		   				   		/*
		   				   		// Relogin session passport
		   						req.login(user_found1, function (err) {
		   							if(err) {
		   								return res.send('Error al encontrar relogear')
		   							}
		   						})*/

		   						res.status(200).json({
		   							status: 'uset_update',
		   							message: 'Datos de usuario actualizado',
		   							user_updated: user_found1,
		   							user: req.user
		   						})

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
			
		}
	})
})

module.exports = app
