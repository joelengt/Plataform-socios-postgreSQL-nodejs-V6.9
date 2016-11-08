
var express = require('express')
var jwt = require('jsonwebtoken')
var app = express.Router()

var Users = require('../../../../models/usuarios/index.js')

var Contratista = require('../../../../models/usuarios/contratistas/index.js')
var Empresas_Cliente = require('../../../../models/usuarios/empresas_clientes/index.js')

var FindUserData = require('../../../../controllers/find_user_data/index.js')

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

// API: READ Lista de usuarios segun el tipo pasado
app.get('/list/:type_user', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		var type_user = req.params.type_user

		if(type_user === config.users_access.onwers ||
		   type_user === config.users_access.admins ||
		   type_user === config.users_access.officers ||
		   type_user === config.users_access.users_campo ||
		   type_user === config.users_access.viewer) {

			// Lectura de base de datos segun el listo de usuario para la lista
			Users.find(function (err, users) {
				if(err) {
					return res.status(500).json({
						status: 'error_server',
						message: 'Error al encontrar usuarios en la base de datos',
						error: err
					})
				}

				// filtrando usuarios segun el parametro solicitado
				var usuarios_filter = users.filter(function (element) {
					return element.permiso === type_user
				})
				
				// Filtrando segun la empresa
				var usuarios_empresa = usuarios_filter.filter(function(element) {
					return element.empresa_admin === req.user.empresa_admin
				})			

				res.status(200).json({
			  		user: req.user,
					type_user: type_user,
					usuarios: usuarios_empresa
				})

			})

		} else {

			res.status(200).json({
				status: 'not_fount',
				message: 'El tipo de usuario solicitado no exite'
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

// API: CREATE - Registrando nuevo usuario
app.post('/:type_user/register', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	  req.user.permiso === users_type.admins ||
	  req.user.permiso === users_type.officers) {

		var type_user = req.params.type_user

		if( req.body.password === req.body.re_password ) {
			var contratista = ''
			var empresa_admin = ''
			var permiso = ''

			var new_user = new Users({
				names: 		  	req.body.names || '',
				last_names:   	req.body.last_names || '',
				full_name:    	req.body.names + ' ' + req.body.last_names,
				photo: { 
					path: 'images/avatar_default.png'
				},
				dni:          	req.body.dni || '',
				email:   	  	req.body.email || '',
				username:     	req.body.username || 'anonymous',
				password:     	req.body.password,
				empresa_admin: 	'',
				contratista: 	'',
				permiso: 		''
			})

			console.log('NIVEL DE OWNER NOMBRE PARA TODO')
			console.log(config.owner.name)
			
			// Validando pertenencia del usuario en el registro
			if(type_user === users_type.onwers) {
				console.log('El usuario creado se va para : ' + users_type.onwers)
				// El usuario es owner
				empresa_admin =  config.owner.name
				contratista =  	 '57eaacc4dcc91fb00aceae32'  // Owners
				permiso =      	 users_type.onwers

			} else if (type_user === users_type.admins) {
				console.log('El usuario creado se va para : ' + users_type.admins)

				// El usuario es admin
				empresa_admin =  req.body.empresa_admin
				contratista =  	 '57eaacc4dcc91fb00aceae32'  // Admins
				permiso =      	 users_type.admins

			} else if (type_user === users_type.officers) {
				console.log('El usuario creado se va para : ' + users_type.officers)

				// El usuario es de oficina
				empresa_admin =  req.user.empresa_admin
				contratista =  	 '57eaacc9dcc91fb00aceae33'  // Officers
				permiso =      	 users_type.officers

			} else if(type_user === users_type.viewer) {
				console.log('El usuario creado se va para : ' + users_type.viewer)

				// El usuario es de oficina
				empresa_admin =  req.user.empresa_admin
				contratista =  	 '57eaacd0dcc91fb00aceae34'  // Viewers
				permiso =      	 users_type.viewer

			} else {
				console.log('El usuario creado se va para : ' + users_type.users_campo)

				// El usuario es de campo
				empresa_admin =  req.user.empresa_admin 
				contratista =  	 req.body.contratista || '57eaacd4dcc91fb00aceae35'  // Campo
				permiso =      	 users_type.users_campo
			}

			// Asignando valores de seleccion
			new_user.empresa_admin = empresa_admin
			new_user.contratista = contratista
			new_user.permiso = permiso

			new_user.save(function (err, user_saved) {
				if(err) {
					return res.status(500).json({
						status: 'error_server',
						message: 'Error al guardar usuario en ' + type_user,
						error: err
					})
				}

				user_saved.token_auth = jwt.sign(user_saved, process.env.JWT_SECRET || "casita")

				user_saved.save(function (error, user_with_token) {
					if(error) {
						return res.status(500).json({
							status: 'error_server',
							message: 'Error al guardar el nuevo token: ' + error,
							error: err
						})
					}

                	console.log('Usuario guardado, nuevos datos de token dados: ')
                    console.log(user_with_token)
                   	
                    msg = 'Usuario registrado'

                    console.log(msg)
                    console.log(new_user)

                    if(type_user === users_type.onwers) {
                    	// Form para owner
                    	/*res.render('./admin/dashboard/usuarios/new_user/owner/index.jade', {
                       		user: req.user,
                    		type_user: type_user,
                    		new_user: new_user,
                    		msg: msg
                    	})*/

                		res.status(200).json({
                	   		user: req.user,
                			type_user: type_user,
                			new_user: new_user,
                			msg: msg
                		})

                    } else if(type_user === users_type.admins) {
                    	// Form para admin
                    	Empresas_Cliente.find(function (err, empresas) {
                    		/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
                    	   		user: req.user,
                    			type_user: type_user,
                    			empresas: empresas,
                    			new_user: new_user,
                    			msg: msg
                    		})*/

                    		res.status(200).json({
                    	   		user: req.user,
                    			type_user: type_user,
                    			empresas: empresas,
                    			new_user: new_user,
                    			msg: msg
                    		})
                    	})

                    } else if(type_user === users_type.officers || type_user === users_type.viewer) {
                    	// Form para officer
                    	Empresas_Cliente.find(function (err, empresas) {
                    		/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
                    	   		user: req.user,
                    			type_user: type_user,
                    			empresas: empresas,
                    			new_user: new_user,
                    			msg: msg
                    		})*/

                    		res.status(200).json({
                    	   		user: req.user,
                    			type_user: type_user,
                    			empresas: empresas,
                    			new_user: new_user,
                    			msg: msg
                    		})
                    	})

                    } else if (type_user === users_type.users_campo) {
                    	// Buscando lista de contratista en la base de datos
                    	Contratista.find(function (err, contratistas) {

                    		// Mostrando lista de nuevos contratistas
                    		/*res.render('./admin/dashboard/usuarios/new_user/campo/index.jade', {
                    	   		user: req.user,
                    			type_user: type_user,
                    			contratistas: contratistas,
                    			new_user: new_user,
                    			msg: msg
                    		})*/

                    		res.status(200).json({
                    	   		user: req.user,
                    			type_user: type_user,
                    			contratistas: contratistas,
                    			new_user: new_user,
                    			msg: msg
                    		})
                    	})		

                    } else {
                    	res.status(200).json({
                    		status: 'not_permition',
                    		msg: 'Error, al ingregrar, ud. no tiene permiso'
                    	})
                    	
                    }


				})

			})

		} else {

			msg = 'La contraseñas no coincide'

			if(type_user === users_type.onwers) {
				// Form para owner
				/*res.render('./admin/dashboard/usuarios/new_user/owner/index.jade', {
			   		user: req.user,
					type_user: type_user,
					msg: msg
				})*/

				res.status(200).json({
			   		user: req.user,
					type_user: type_user,
					msg: msg
				})

			} else if(type_user === users_type.admins) {
				// Form para admin
				Empresas_Cliente.find(function (err, empresas) {
					/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})*/

					res.status(200).json({
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})
				})

			} else if(type_user === users_type.officers) {
				// Form para officer
				Empresas_Cliente.find(function (err, empresas) {
					/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})*/

					res.status(200).json({
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})
				})

			} else if(type_user === users_type.viewer) {
				// Form para officer
				Empresas_Cliente.find(function (err, empresas) {
					/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})*/

					res.status(200).json({
				   		user: req.user,
						type_user: type_user,
						empresas: empresas,
						msg: msg
					})
				})

			} else if (type_user === users_type.users_campo) {
				// Buscando lista de contratista en la base de datos
				Contratista.find(function (err, contratistas) {

					// Mostrando lista de nuevos contratistas
					/*res.render('./admin/dashboard/usuarios/new_user/campo/index.jade', {
				   		user: req.user,
						type_user: type_user,
						contratistas: contratistas,
						msg: msg
					})*/

					res.status(200).json({
				   		user: req.user,
						type_user: type_user,
						contratistas: contratistas,
						msg: msg
					})
				})		

			} else {
				res.status(200).json({
					status: 'not_permition',
					msg: 'Error, al ingregrar, ud. no tiene permiso'
				})
				
			}
		
		}

	} else {
		
		console.log('El usuario no esta autentificado. Requiere logearse')
	     res.status(403).json({
	        status: 'not_access',
	        message: 'El usuario no esta autentificado. Requiere logearse'
	     })

	}
	
})

// API: READ - Obteniendo usuario por id
app.get('/:user_id', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		var user_id = req.params.user_id
		
		console.log('User id')
		console.log(user_id)

		console.log('Console Data user id')
		console.log('user_id: ' + user_id)

		FindUserData(user_id, function (err, usuario_found) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al obtener datos legibles del usuario',
					error: err
				})
			}

			console.log('Datos Llegada de respuesta')

			res.status(200).json({
				status: 'user_found',
				user: req.user,
				user_found: usuario_found
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

// API: DELETE - Eliminando usuario 
app.delete('/delete/:user_id', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers) {

	   var user_id = req.params.user_id

	   // Eliminando usuario de la base de datos
	   Users.remove({'_id': user_id}, function (err) {
	   		if(err) {
	   			return res.status(500).json({
	   				status: 'error_server',
	   				message: 'Error al eliminar usuario de la base de datos',
	   				error: err
	   			})
	   		}

	   		res.status(200).json({
	   			status: 'user_removed',
	   			message: 'usuario eliminado de la base de dataos',
	   			user: req.user
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

// API: UPDATE - Edit usuario
app.put('/edit/:user_id', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers) {

	   var user_id = req.params.user_id

	   Users.findById({'_id': user_id }, function (err, user_found1) {
	   		if(err) {
	   			return res.status(500).json({
	   				status: 'error_server',
	   				message: 'Error encontrar usuario por id',
	   				error: err
	   			})
	   		}

	   		var data = {
   				empresa_admin: req.body.empresa_admin || user_found1.empresa_admin, 
   				contratista:   req.body.contratista || user_found1.contratista,  
   				names: 		   req.body.names || user_found1.names,
   				last_names:    req.body.last_names || user_found1.last_names,
   				full_name:     req.body.names + ' ' + req.body.last_names || user_found1.full_name,
   				dni:           req.body.dni || user_found1.dni,
   				email:   	   req.body.email || user_found1.email,
   				username:      req.body.username || user_found1.username,
   				password:      req.body.password || user_found1.password,
   				permiso:       req.body.permiso || user_found1.permiso
	   		}

	   		if(req.files.hasOwnProperty('avatar_perfil')) {

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

	   				Users.findById({'_id': user_id}, function (err, user_found1) {
				   		if(err) {
				   			return res.status(500).json({
				   				status: 'error_server',
				   				message: 'Error encontrar usuario por id',
				   				error: err
				   			})
				   		}

				   		// Relogin session passport
						/*
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

	   				console.log('Usuario se actualizo')

	   				Users.findById({'_id': user_id}, function (err, user_found1) {
				   		if(err) {
				   			return res.status(500).json({
				   				status: 'error_server',
				   				message: 'Error encontrar usuario por id',
				   				error: err
				   			})
				   		}
				   		console.log('Usuario a punto de realogear')

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
							console.log('Usuario relogeado')
						})*/

						console.log('Usuario data de entrega')

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
})

// Render select de opciones y todos los usuarios
app.get('/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
	   
	   // obteniendo lista de todos los usuarios
		Users.find(function (err, usuarios) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al encontrar lista de usuarios',
					error: err
				})
			}
			
			console.log('Lista de usuarios encontrados')

			console.log(usuarios)
			/*
			res.render('./admin/dashboard/usuarios/index.jade', {
				user: req.user,
				list_usuarios: usuarios
			})*/

			res.status(200).json({
				user: req.user,
				list_usuarios: usuarios
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

// Render nuevo formulario, con lista de contratista
app.get('/:type_user/new', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	  req.user.permiso === users_type.admins ||
	  req.user.permiso === users_type.officers ||
	  req.user.permiso === users_type.viewer) {

		console.log('YOU CALL ME')
		var type_user = req.params.type_user

		if(type_user === users_type.onwers) {
			// Form para owner
			/*res.render('./admin/dashboard/usuarios/new_user/owner/index.jade', {
		   		user: req.user,
				type_user: type_user
			})*/

			res.status(200).json({
		   		user: req.user,
				type_user: type_user
			})

		} else if(type_user === users_type.admins) {
			// Form para admin
			Empresas_Cliente.find(function (err, empresas) {
				/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
			   		user: req.user,
					type_user: type_user,
					empresas: empresas
				})*/

				res.status(200).json({
			   		user: req.user,
					type_user: type_user,
					empresas: empresas
				})
			})

		} else if(type_user === users_type.officers ||
			      type_user === users_type.viewer) {

			// Form para officer
			Empresas_Cliente.find(function (err, empresas) {
	   			/*res.render('./admin/dashboard/usuarios/new_user/admin/index.jade', {
	   		   		user: req.user,
	   				type_user: type_user,
	   				empresas: empresas
	   			})*/

	   			res.status(200).json({
	   		   		user: req.user,
	   				type_user: type_user,
	   				empresas: empresas
	   			})
			})

		} else if (type_user === users_type.users_campo) {
			// Buscando lista de contratista en la base de datos
			Contratista.find(function (err, contratistas) {
				// Mostrando lista de nuevos contratistas
				
				/*res.render('./admin/dashboard/usuarios/new_user/campo/index.jade', {
			   		user: req.user,
					type_user: type_user,
					contratistas: contratistas
				})*/

				var new_contratistas = []

				// Validando envio. Filtrando:
				for(var m = 0; m <= contratistas.length - 1; m++) {
					var element_contratista = contratistas[m]

					if(element_contratista.name === 'Owners' ||
					   element_contratista.name === 'Officers' ||
					   element_contratista.name === 'Viewers' ||
					   element_contratista.name === 'Campo') {

						continue;

					} else {

						new_contratistas.push(element_contratista)

					}

				}
				
				console.log('CONTRATISTA')
				console.log(new_contratistas)

				res.status(200).json({
			   		user: req.user,
					type_user: type_user,
					contratistas: new_contratistas
				})
			})
			

		} else {
			res.status(200).json({
				status: 'not_permition',
				message: 'Error, al ingregrar, ud. no tiene permiso'
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

// API: CREATE - Agregando nuevo contratista
app.post('/contratista-name/add', isLoggedIn , function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers) {
		
		// Obteniendo datos de la creación
		var data = {
			contratista: req.body.contratista
		}

		// Almacenando al nuevo contratista
		var new_contratista = new Contratista({
			name: data.contratista  || '',
			empresa: req.user.empresa_admin ||  ''
		})

		console.log('Nueva empresa contratista agregando')
		console.log(new_contratista)
		
		// Guardando al nuevo contratista en la base de datos
		new_contratista.save(function (err) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al almancenar nuevo contratista',
					error: err
				})
			}
			console.log('EL nuevo contratista se guardo en la base de datos')
			// Respuesta nombre contratista
			res.status(200).json({
		   		user: req.user,
				contratista: new_contratista
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

// API: CREATE - Agregando nuevo contratista
app.post('/empresa-cliente-name/add', isLoggedIn , function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	  req.user.permiso === users_type.admins ||
	  req.user.permiso === users_type.officers) {
		
		// Obteniendo datos de la creación
		var data = {
			empresa: req.body.empresa || ''
		}

		// Almacenando al nuevo contratista
		var new_empresa_client = new Empresas_Cliente({
			name: data.empresa
		})

		// Guardando al nuevo contratista en la base de datos
		new_empresa_client.save(function (err) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al almancenar nuevo contratista',
					error: err
				})
			}
			console.log('EL nuevo contratista se guardo en la base de datos')
			// Respuesta nombre contratista
			res.status(200).json({
		   		user: req.user,
				empresa: new_empresa_client
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

//  Filtro: Busqueda dinamica
app.get('/dynamic-filter/:user_type/:estado', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	  req.user.permiso === users_type.admins ||
	  req.user.permiso === users_type.officers) {
		
		// estado  -> todos, activos, inactivos
		// user type -> todos, officers, officer-viewer, users-campo

		var estado = req.params.estado
		var user_type = req.params.user_type
				
		Users.find(function (err, usuarios_find1) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al obtener usuarios de la base de datos',
					error: err
				})
			}

			var new_users_with_copy = []

			if(usuarios_find1.length === 0) {
				// NO hay uuarios en la base de datos

				res.status(200).json({
					status: 'ok',
					message: 'No hay usuarios en la base de datos',
					usuarios_found: new_users_with_copy
				})

			} else {

				// FIltrand por empresa
				var usuarios_empresa_filter = usuarios_find1.filter(function (element) {
					return element.empresa_admin === req.user.empresa_admin
				})

				var usuarios_nivel_access = []

				// Si es admin : Permitir obtener todos los usuarios y clasificarlos
				if(req.user.permiso === users_type.onwers || 
			  	   req.user.permiso === users_type.admins ||
			  	   req.user.permiso === users_type.officers) {

					// Si el parametro es user campo
					if(user_type === users_type.users_campo) {
						console.log('Usuarios campo')
						// FIltro por Nivel defeco de permiso
						usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
							return element.permiso === users_type.users_campo
						})

					// Si el parametro es officers
					} else if(user_type === users_type.officers){
						console.log('Usuarios officer')

						// FIltro por Nivel defeco de permiso
						usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
							return element.permiso === users_type.officers
						})

					// Si el parametro es de viewer
					} else if(user_type === users_type.viewer) {
						console.log('Usuarios viewers')

						// FIltro por Nivel defeco de permiso
						usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
							return element.permiso === users_type.viewer
						})

					} else if(user_type === 'todos'){
						console.log('Todos')
						// FIltro por Nivel defeco de permiso  ''Todos''
						usuarios_nivel_access = usuarios_empresa_filter

					} else {
						console.log('El parametro de seleccion de usuario no es correcto')
						usuarios_nivel_access = []

					}

				// Si no es admin: Permitir obtener todos los usuarios, solo de su nivel par abajo
				} else {

					console.log('TODOS SON USUARIOS de CAMPO')
					// FIltro por Nivel defeco de permiso: user campo
					usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
						return element.permiso === users_type.users_campo
					})
				
				}

				if(usuarios_nivel_access.length === 0) {
					// No hay usuarios

					res.status(200).json({
						status: 'not_found',
						message: 'No se encontro usuarios',
						usuarios_found: usuarios_nivel_access
					})

				} else {

					var new_users_with_copy = []

					// Validando usuarios activos, inactivos o todos
					//estado = 'todos'
					var user_activity = []

					// Filtrando referencia de estado de actividad

					if(estado === 'todos') {
						//console.log('Todos los usuarios')
						user_activity = usuarios_nivel_access

					} else if(estado === 'activos') {
						//console.log('Usuarios Activos')
						user_activity = usuarios_nivel_access.filter(function (element) {
							return element.status_connect === true
						})

					} else if (estado === 'inactivos') {
						//console.log('Usuarios Inactivos')
						user_activity = usuarios_nivel_access.filter(function (element) {
							return element.status_connect === false
						})

					} else {
						//console.log('Error, parametro pasado incorrecto')
						user_activity = usuarios_nivel_access
						
					}

					if(user_activity.length === 0) {

						res.status(200).json({
							status: 'not_found',
							message: 'No se encontro usuarios',
							usuarios_found: user_activity
						})
						
					} else {

						var el_user_acti

						// Render de datos legibles
						for(var d = 0; d <= user_activity.length - 1; d++) {
							console.log('Iteracion de empresa: ' + d)
							
							el_user_acti = user_activity[d]

							FindUserData(el_user_acti._id, function (err, get_new_data_user) {
								if(err) {
									return res.status(500).json({
										status: 'error_server',
										message: 'Error al obtener datos legibles del usuario',
										error: err
									})
								}

								new_users_with_copy.push(get_new_data_user)

								if(new_users_with_copy.length === user_activity.length) {
									
									console.log('TERMINO!!!')
									console.log('Lista de usuarios con COPY')
									console.log(new_users_with_copy)

									res.status(200).json({
										status: 'ok',
										usuarios_found: new_users_with_copy
									})

								}

							})

						}

					}

				}

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


