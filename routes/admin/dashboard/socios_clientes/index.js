var express = require('express')
var pg = require('pg')
var app = express.Router()
var path = require('path')

var config = require('../../../../config')

var users_type = config.users_access
var connectionString = config.postgresql.local

var data_value_tablas = [
  'socios',   // 0
  'conyuges_socio',  // 1
  'afiliado_socio'  // 2
]

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

// READ list all
app.get('/list/:value', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var value_select = Number(req.params.value)

        if(value_select >= 0 && value_select <= 2) {
            var results = [];

            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                // SQL Query > Select Data
                const query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ';')

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()
                       
                    return res.status(200).json({
                        status: 'ok',
                        result: results
                    })
                })

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
          })
        }

    } else {
        console.log('El usuario no esta autentificado. Requiere logearse')
        res.status(403).json({
            status: 'not_access',
            message: 'El usuario no esta autentificado. Requiere logearse'
        })
    }
});

// READ One item by id from list
app.get('/item/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        var results = [];

        if(table_select >= 0 && table_select <= 2) {
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                // SQL Query > Select Data
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id = '${ socio_id }';`)

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()

                    if(results.length === 0) {
                        return res.status(404).json({
                            status: 'not_found',
                            message: 'El socio cliente no fue encontrado en la base de datos'
                        })
                    } 

                    res.status(200).render('./dashboard/socio/info_perfil/index.jade',{
                        status: 'ok',
                        result: results[0],
                        message: 'El socio cliente fue encontrado en la base de datos',
                        user: req.user
                    })

                })

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
          })
        }

    } else {
        console.log('El usuario no esta autentificado. Requiere logearse')
        res.status(403).json({
            status: 'not_access',
            message: 'El usuario no esta autentificado. Requiere logearse'
        })
    }
});

// CREATE item for list
app.post('/item/socio/add/:table_select', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {
        var table_select = Number(req.params.table_select);

        var results = [];
        var lista_table = [];

        // Obeteniendo nuevo usuario registrado
        var socioNuevo = {
            fecha_ingreso:                req.body.fecha_ingreso  || '',
            nombres:                      req.body.nombres  || '',
            apellidos:                    req.body.apellidos  || '',
            numero_carnet:                req.body.numero_carnet  || '',
            cip:                          req.body.cip  || '',
            dni:                          req.body.dni  || '',
            fecha_nacimiento:             req.body.fecha_nacimiento  || '',
            organizacion:                 req.body.organizacion  || '',
            grado_profesion:              req.body.grado_profesion  || '',
            arma:                         req.body.arma  || '',
            situacion_trabajo:            req.body.situacion_trabajo  || '',
            unidad:                       req.body.unidad  || '',
            gguu:                         req.body.gguu  || '',
            region:                       req.body.region  || '',
            guarnicion:                   req.body.guarnicion  || '',
            filial:                       req.body.filial  || '',
            direccion:                    req.body.direccion  || '',
            email:                        req.body.email  || '',
            celular1:                     req.body.celular1  || '',
            celular2:                     req.body.celular2  || '',
            telefono1:                    req.body.telefono1  || '',
            telefono2:                    req.body.telefono2  || '',
            carta_declaratoria:           req.body.carta_declaratoria  || '',
            tipo_socio:                   req.body.tipo_socio  || '',
            tipo_pago:                    req.body.tipo_pago  || '',
            situacion_socio:              req.body.situacion_socio  || '',
            foto:                         req.body.foto  || '',
            situacion_alerta:             req.body.situacion_alerta  || ''
        }

        console.log('Datos que obtengo de la subida');
        console.log(socioNuevo);

        if(table_select >= 0 && table_select <= 2) {
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                console.log('Buscando coincidencia por dni');

                // Validando existencia en la DB segun dni como campo obligatorio
                if(socioNuevo.dni !== '' && socioNuevo.dni.length === 8 ) {
                    console.log('El campo dni es valido');

                    // SQL Query > Select Data
                    // Buscando si ya esta registrado
                    const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE dni = '${ socioNuevo.dni }';`)

                    // Stream results back one row at a time
                    query.on('row', (row) => {
                        results.push(row)
                    })

                    // After all data is returned, close connection and return results
                    query.on('end', () => {
                        done()

                        if(results.length === 0) {
                           // El usuario es nuevo -> Registrar
                           console.log('El usuario es nuevo, y esta listo para guarda en la base de datos');

                          // Almacenando en la DB
                          client.query(`INSERT INTO ${ data_value_tablas[table_select] }
                                       (fecha_ingreso,
                                       nombres,
                                       apellidos,
                                       numero_carnet,
                                       cip,
                                       dni,
                                       fecha_nacimiento,
                                       organizacion,
                                       grado_profesion,
                                       arma,
                                       situacion_trabajo,
                                       unidad,
                                       gguu,
                                       region,
                                       guarnicion,
                                       filial,
                                       direccion,
                                       email,
                                       celular1,
                                       celular2,
                                       telefono1,
                                       telefono2,
                                       carta_declaratoria,
                                       tipo_socio,
                                       tipo_pago,
                                       situacion_socio,
                                       foto,
                                       situacion_alerta
                                       ) VALUES (
                                       '${ socioNuevo.fecha_ingreso }',
                                       '${ socioNuevo.nombres }',
                                       '${ socioNuevo.apellidos }',
                                       '${ socioNuevo.numero_carnet }',
                                       '${ socioNuevo.cip }',
                                       '${ socioNuevo.dni }',
                                       '${ socioNuevo.fecha_nacimiento }',
                                       '${ socioNuevo.organizacion }',
                                       '${ socioNuevo.grado_profesion }',
                                       '${ socioNuevo.arma }',
                                       '${ socioNuevo.situacion_trabajo }',
                                       '${ socioNuevo.unidad }',
                                       '${ socioNuevo.gguu }',
                                       '${ socioNuevo.region }',
                                       '${ socioNuevo.guarnicion }',
                                       '${ socioNuevo.filial }',
                                       '${ socioNuevo.direccion }',
                                       '${ socioNuevo.email }',
                                       '${ socioNuevo.celular1 }',
                                       '${ socioNuevo.celular2 }',
                                       '${ socioNuevo.telefono1 }',
                                       '${ socioNuevo.telefono2 }',
                                       '${ socioNuevo.carta_declaratoria }',
                                       '${ socioNuevo.tipo_socio }',
                                       '${ socioNuevo.tipo_pago }',
                                       '${ socioNuevo.situacion_socio }',
                                       '${ socioNuevo.foto }',
                                       '${ socioNuevo.situacion_alerta }');`);

                          console.log('El socio se registro efectivamente en la DB');

                          res.status(200).json({
                              status: 'ok',
                              result: socioNuevo,
                              message: 'El socio se registro efectivamente en la DB'
                          })

                        } else {
                            // El usuario ya se encuentra registrado
                            console.log('El usuario ya se encuentra registrado');
                            res.status(200).json({
                                status: 'not_register',
                                message: 'El socio cliente fue encontrado en la base de datos',
                                result: results[0]
                            })
                        } 

                    })

                } else {

                    console.log('El campo dni ingresado, es requerido con 8 digitos');

                    res.status(200).json({
                        status: 'not_register',
                        message: 'El campo dni ingresado, es requerido con 8 digitos'
                    })

                }

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
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

// DELETE item from list
app.delete('/item/delete/:table_select/:socio_id', isLoggedIn, function (req, res) {

   if(req.user.permiso === users_type.onwers ||
      req.user.permiso === users_type.admins ||
      req.user.permiso === users_type.officers ||
      req.user.permiso === users_type.viewer) {

        var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        var results = [];


        if(table_select >= 0 && table_select <= 2) {
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                // SQL Query > Select Data
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id = '${ socio_id }';`)

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()

                   if(results.length === 0) {
                      // No Existe en la base de datos
                      res.status(200).json({
                          status: 'not_found',
                          message: 'El socio cliente no existe en la base de datos'
                      })

                   } else {
                       // Existe, se va a eliminar
                       console.log('id_item del item para eliminar');
                       console.log(results[0]);

                       // SQL Query > Delete Item by id_item
                       client.query(`DELETE FROM ${ data_value_tablas[table_select] } WHERE id = '${ socio_id }';`);

                       res.status(200).json({
                           status: 'ok',
                           message: `El socio cliente ${ socio_id } fue eliminado de la base de datos`
                       })
                   }

                })

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
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

// UPDATE item from list
app.put('/item/update/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {
        var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        var results = [];

        if(table_select >= 0 && table_select <= 2) {
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                // SQL Query > Select Data
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id = '${ socio_id }';`)

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()

                   if(results.length === 0) {
                      // No Existe en la base de datos
                      console.log('El usuario no exite');
                      res.status(200).json({
                          status: 'not_found',
                          message: 'El socio cliente no existe en la base de datos'
                      })

                   } else {
                       // Existe, se va a Actualizar
                       console.log('id_item del item para actualizar');
                       console.log(results[0].dni);

                       var socioNuevo = {
                           fecha_ingreso:                req.body.fecha_ingreso     || results[0].fecha_ingreso,
                           nombres:                      req.body.nombres           || results[0].nombres,
                           apellidos:                    req.body.apellidos         || results[0].apellidos,
                           numero_carnet:                req.body.numero_carnet     || results[0].numero_carnet,
                           cip:                          req.body.cip               || results[0].cip,
                           dni:                          req.body.dni               || results[0].dni,
                           fecha_nacimiento:             req.body.fecha_nacimiento  || results[0].fecha_nacimiento,
                           organizacion:                 req.body.organizacion      || results[0].organizacion,
                           grado_profesion:              req.body.grado_profesion   || results[0].grado_profesion,
                           arma:                         req.body.arma              || results[0].arma,
                           situacion_trabajo:            req.body.situacion_trabajo || results[0].situacion_trabajo,
                           unidad:                       req.body.unidad            || results[0].unidad,
                           gguu:                         req.body.gguu              || results[0].gguu,
                           region:                       req.body.region            || results[0].region,
                           guarnicion:                   req.body.guarnicion        || results[0].guarnicion,
                           filial:                       req.body.filial            || results[0].filial,
                           direccion:                    req.body.direccion         || results[0].direccion,
                           email:                        req.body.email             || results[0].email,
                           celular1:                     req.body.celular1          || results[0].celular1,
                           celular2:                     req.body.celular2          || results[0].celular2,
                           telefono1:                    req.body.telefono1         || results[0].telefono1,
                           telefono2:                    req.body.telefono2         || results[0].telefono2,
                           carta_declaratoria:           req.body.carta_declaratoria   || results[0].carta_declaratoria,
                           tipo_socio:                   req.body.tipo_socio        || results[0].tipo_socio,
                           tipo_pago:                    req.body.tipo_pago         || results[0].tipo_pago,
                           situacion_socio:              req.body.situacion_socio   || results[0].situacion_socio,
                           foto:                         req.body.foto              || results[0].foto,
                           situacion_alerta:             req.body.situacion_alerta  || results[0].situacion_alerta
                       }

                       console.log('Datos listos para subirse');
                       console.log(socioNuevo);

                       // SQL Query > Delete Item by id_item
                       client.query(`UPDATE ${ data_value_tablas[table_select] } SET 
                               fecha_ingreso =          '${ socioNuevo.fecha_ingreso }',
                               nombres =                '${ socioNuevo.nombres  }',
                               apellidos =              '${ socioNuevo.apellidos }',
                               numero_carnet =          '${ socioNuevo.numero_carnet }',
                               cip =                    '${ socioNuevo.cip }',
                               dni =                    '${ socioNuevo.dni }',
                               fecha_nacimiento =       '${ socioNuevo.fecha_nacimiento }',
                               organizacion =           '${ socioNuevo.organizacion }',
                               grado_profesion =        '${ socioNuevo.grado_profesion }',
                               arma =                   '${ socioNuevo.arma }',
                               situacion_trabajo =      '${ socioNuevo.situacion_trabajo }',
                               unidad =                 '${ socioNuevo.unidad }',
                               gguu =                   '${ socioNuevo.gguu }',
                               region =                 '${ socioNuevo.region }',
                               guarnicion =             '${ socioNuevo.guarnicion }',
                               filial =                 '${ socioNuevo.filial }',
                               direccion =              '${ socioNuevo.direccion }',
                               email =                  '${ socioNuevo.email }',
                               celular1 =               '${ socioNuevo.celular1 }',
                               celular2 =               '${ socioNuevo.celular2 }',
                               telefono1 =              '${ socioNuevo.telefono1 }',
                               telefono2 =              '${ socioNuevo.telefono2 }',
                               carta_declaratoria =     '${ socioNuevo.carta_declaratoria }',
                               tipo_socio =             '${ socioNuevo.tipo_socio }',
                               tipo_pago =              '${ socioNuevo.tipo_pago }',
                               situacion_socio =        '${ socioNuevo.situacion_socio }',
                               foto =                   '${ socioNuevo.foto }',
                               situacion_alerta =       '${ socioNuevo.situacion_alerta }'
                             WHERE 
                               id = '${ socio_id }';
                             `);

                       res.status(200).json({
                           status: 'ok',
                           message: `El socio cliente ${ socio_id } fue actualizado en la base de datos`
                       })
                   }

                })

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
          })
        }
    } else {
        console.log('El usuario no esta autentificado. Requiere logearse')
        res.status(403).json({
            status: 'not_access',
            message: 'El usuario no esta autentificado. Requiere logearse'
        })
    }
});

// Viewers

// Viewer: Form Create
app.get('/form-to-register', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        res.status(200).render('./dashboard/socio/create/index.jade', {
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

// Viewer: From Edit
app.get('/form-to-edit/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        var results = [];

        if(table_select >= 0 && table_select <= 2) {
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
                // Handle connection errors
                if(err) {
                    done();
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        data: err
                    })
                }

                // SQL Query > Select Data
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id = '${ socio_id }';`)

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()

                    if(results.length === 0) {
                        return res.status(404).json({
                            status: 'not_found',
                            message: 'El socio cliente no fue encontrado en la base de datos'
                        })
                    }

                    res.status(200).render('./dashboard/socio/edit/index.jade', {
                        status: 'ok',
                        user: req.user,
                        socio: results[0]
                    })

                })

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
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


module.exports = app
