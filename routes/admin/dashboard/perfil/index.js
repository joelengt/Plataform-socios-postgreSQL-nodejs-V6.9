var express = require('express')
var app = express.Router()

var Contratista = require('../../../../models/usuarios/contratistas/index.js')
var Empresas_Cliente = require('../../../../models/usuarios/empresas_clientes/index.js')

var Users = require('../../../../models/usuarios/index.js')
var FindUserData = require('../../../../controllers/find_user_data/index.js')

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

// URI: Datos de perfil de usuario
app.get('/me', isLoggedIn, function (req, res) {
  if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
     req.user.permiso === users_type.viewer) {
		
		  var user_id = req.user._id
		  // Buscando usuario por id de session en la base de datos
        FindUserData(user_id, function(err, user_reponse) {
            if(err) {
              return res.status(500).json({
                status: 'error_server',
                message: 'Error al obtener datos legibles del usuario',
                error: err
              })
          }

          res.status(200).json({
            status: 'user_found',
            user: user_reponse
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

// API: Actualizar datos de perfil
app.put('/me/update', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
     req.user.permiso === users_type.viewer) {
	   
	   var user_id = req.user._id

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

                  FindUserData(user_id, function(err, user_reponse) {
                    if(err) {
                      return res.status(500).json({
                        status: 'error_server',
                        message: 'Error al obtener datos legibles del usuario',
                        error: err
                      })
                    }

                    /*
         				   	// Relogin session passport
         						req.login(user_reponse, function (err) {
         							if(err) {
                        return res.status(500).json({
                          status: 'error_server',
                          message: 'Error al encontrar relogear',
                          error: err
                        })
         							}
         						})*/

         						res.status(200).json({
         							status: 'user_update',
         							message: 'Datos de usuario actualizado',
         							user_updated: user_reponse,
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

    			         FindUserData(user_id, function(err, user_reponse) {
                      if(err) {
                        return res.status(500).json({
                          status: 'error_server',
                          message: 'Error al obtener datos legibles del usuario',
                          error: err
                        })
                      }

                      /*
                      // Relogin session passport
                      req.login(user_reponse, function (err) {
                        if(err) {
                          return res.send('Error al encontrar relogear')
                        }
                      })*/

           						res.status(200).json({
           							status: 'uset_update',
           							message: 'Datos de usuario actualizado',
           							user_updated: user_reponse,
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

module.exports = app
