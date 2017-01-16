
var express = require('express')
var jwt = require('jsonwebtoken')
var app = express.Router()

var Users = require('../../../../models/usuarios/index.js')
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

// API: READ Lista de usuarios segun el tipo
app.get('/list/:type_user', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

        var type_user = req.params.type_user

        if(req.user.permiso === users_type.super_admin ||
           req.user.permiso === users_type.administrador ||
           req.user.permiso === users_type.tesorero) {

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
                var usuarios_nivel_access = [];

                // Si el parametro es user super_admin
                if(type_user === users_type.super_admin) {
                    console.log('Usuarios Super Admins')
                    // FIltro por Nivel defeco de permiso
                    usuarios_nivel_access = users.filter(function (element) {
                        return element.permiso === users_type.super_admin
                    })

                // Si el parametro es administrador
                } else if(type_user === users_type.administrador){
                    console.log('Usuarios Administradores')

                    // FIltro por Nivel defeco de permiso
                    usuarios_nivel_access = users.filter(function (element) {
                        return element.permiso === users_type.administrador
                    })

                // Si el parametro es de tesorero
                } else if(type_user === users_type.tesorero) {
                    console.log('Usuarios Tesoreros')

                    // FIltro por Nivel defeco de permiso
                    usuarios_nivel_access = users.filter(function (element) {
                        return element.permiso === users_type.tesorero
                    })

                } else if(type_user === 'todos'){
                    console.log('Todos')
                    // FIltro por Nivel defeco de permiso  ''Todos''
                    usuarios_nivel_access = users

                } else {
                    console.log('El parametro de seleccion de usuario no es correcto')
                    usuarios_nivel_access = []

                }

                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    usuarios: usuarios_nivel_access
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
app.post('/:type_user/register', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

        var type_user = req.params.type_user

        if(req.body.password === req.body.re_password ) {
            var contratista = ''
            var empresa_admin = ''
            var permiso = ''

            var new_user = new Users({
                names:          req.body.names || '',
                last_names:     req.body.last_names || '',
                full_name:      req.body.names + ' ' + req.body.last_names,
                photo: { 
                    path: 'images/avatar_default.png'
                },
                dni:            req.body.dni || '',
                email:          req.body.email || '',
                username:       req.body.username || 'anonymous',
                password:       req.body.password,
                permiso:        ''
            })

            // Validando pertenencia del usuario en el registro
            if(type_user === users_type.super_admin) {
                console.log('El usuario creado sera: ' + users_type.super_admin)
                // El usuario es owner
                permiso =        users_type.super_admin

            } else if (type_user === users_type.administrador) {
                console.log('El usuario creado sera: ' + users_type.administrador)

                // El usuario es admin
                permiso =        users_type.administrador

            } else if (type_user === users_type.tesorero) {
                console.log('El usuario creado seera: ' + users_type.tesorero)

                // El usuario es de oficina
                permiso =        users_type.tesorero
            
            } else {
                return res.status(400).json({
                    status: 'Bad Request',
                    message: `The param ${ users_type } is not valid`
                })
                
            }

            // Asignando valores de seleccion
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

                    if(type_user === users_type.super_admin) {
                        // Form para owner
                        res.status(200).json({
                            user: req.user,
                            type_user: type_user,
                            new_user: new_user,
                            msg: msg
                        })

                    } else if(type_user === users_type.administrador) {
                        // Form para admin
                        res.status(200).json({
                            user: req.user,
                            type_user: type_user,
                            new_user: new_user,
                            msg: msg
                        })

                    } else if(type_user === users_type.tesorero) {
                        // Form para officer
                        res.status(200).json({
                            user: req.user,
                            type_user: type_user,
                            new_user: new_user,
                            msg: msg
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

            if(type_user === users_type.super_admin) {
                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    msg: msg
                })

            } else if(type_user === users_type.administrador) {
                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    msg: msg
                })

            } else if(type_user === users_type.tesorero) {
                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    msg: msg
                })

            } else if(type_user === users_type.viewer) {
                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    msg: msg
                })

            } else if (type_user === users_type.users_campo) {
                // Buscando lista de contratista en la base de datos
                res.status(200).json({
                    user: req.user,
                    type_user: type_user,
                    contratistas: contratistas,
                    msg: msg
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
app.get('/:user_id', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
app.delete('/delete/:user_id', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
app.put('/edit/:user_id', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
                names:         req.body.names || user_found1.names,
                last_names:    req.body.last_names || user_found1.last_names,
                full_name:     req.body.names + ' ' + req.body.last_names || user_found1.full_name,
                dni:           req.body.dni || user_found1.dni,
                email:         req.body.email || user_found1.email,
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
app.get('/get-list', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {
       
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

//  Filtro: Busqueda dinamica
app.get('/dynamic-filter/:user_type/:estado', function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {
        
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
                if(req.user.permiso === users_type.super_admin ||
                   req.user.permiso === users_type.administrador ||
                   req.user.permiso === users_type.tesorero) {

                    // Si el parametro es user super_admin
                    if(user_type === users_type.super_admin) {
                        console.log('Usuarios Super Admins')
                        // FIltro por Nivel defeco de permiso
                        usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
                            return element.permiso === users_type.super_admin
                        })

                    // Si el parametro es administrador
                    } else if(user_type === users_type.administrador){
                        console.log('Usuarios Administradores')

                        // FIltro por Nivel defeco de permiso
                        usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
                            return element.permiso === users_type.administrador
                        })

                    // Si el parametro es de tesorero
                    } else if(user_type === users_type.tesorero) {
                        console.log('Usuarios Tesoreros')

                        // FIltro por Nivel defeco de permiso
                        usuarios_nivel_access = usuarios_empresa_filter.filter(function (element) {
                            return element.permiso === users_type.tesorero
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
                        return element.permiso === users_type.administrador
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


