var express = require('express')
var pg = require('pg')
var app = express.Router()
var path = require('path')

var config = require('../../../../config')

var users_type = config.users_access
var connectionString = config.postgresql.local

var getDatePerrty = require('../../../../controllers/get_date_pretty');

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
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
app.get('/item/to-json/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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

                    var socio_user = results[0];
                    var results_conyugue = [];
                    var results_afiliado = [];
                    
                    // Obteniendo datos del conyuge 
                    const query_conyugue = client.query(`SELECT * FROM ${ data_value_tablas[1] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                    
                    query_conyugue.on('row', (row) => {
                        results_conyugue.push(row)
                    })

                    query_conyugue.on('end', () => {
                        done();

                        socio_user.datos_extra = {
                          conyuge: '',
                          afiliado: ''
                        }

                        if(results_conyugue.length !== 0) {
                            socio_user.datos_extra.conyuge = results_conyugue[0]
                        } 

                        // Obteniendo datos del afiliado
                        const query_afiliado = client.query(`SELECT * FROM ${ data_value_tablas[2] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                        
                        query_afiliado.on('row', (row) => {
                            results_afiliado.push(row)
                        })

                        query_afiliado.on('end', () => {
                            done();


                            if(results_afiliado.length !== 0) {
                                socio_user.datos_extra.afiliado = results_afiliado[0]
                            } 

                            res.status(200).json({
                                status: 'ok',
                                result: socio_user,
                                message: 'El socio cliente fue encontrado en la base de datos',
                                user: req.user
                            })

                        })

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
    if(req.user.permiso === users_type.super_admin ||
        req.user.permiso === users_type.administrador ||
        req.user.permiso === users_type.tesorero) {

        var table_select = Number(req.params.table_select);

        var results = [];
        var results2 = [];

        var lista_table = [];

        // Obteniendo techa del dia
        var RTime = new Date();
        var month = RTime.getMonth() + 1   // 0 - 11 *
        var day = RTime.getDate()          // 1- 31  *
        var year = RTime.getFullYear()     // año   *

        var date_today = `${ year }-${ month }-${ day }`;

        // Obeteniendo nuevo usuario registrado

        var socioNuevo = {
            fecha_ingreso:                date_today,
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
            situacion_alerta:             req.body.situacion_alerta  || '',
            datos_extra:  {
              conyuge: {
                nombres:               '',
                apellidos:             '',
                dni:                   '',
                fecha_nacimiento:      '',
                celular:               '',
                fecha_ingreso:         date_today,
                email:                 '',
                id_socio_afiliado:     ''
              },
              afiliado: {
                nombres:              '',
                apellidos:            '',
                dni:                  '',
                fecha_nacimiento:     '',
                direccion:            '',
                email:                '',
                celular:              '',
                telefono:             '',
                fecha_ingreso:        '',
                carta_declaratoria:   '',
                id_socio_afiliado:    ''
              }
          }
        }

        if(req.body.hasOwnProperty('datos_extra')) {
          var datos_extra = req.body.datos_extra;

          // Actualizando conyuge
          if(datos_extra.conyuge !== undefined && datos_extra.conyuge !== null) {

               if(datos_extra.conyuge.nombres !== '' && datos_extra.conyuge.nombres !== undefined) {
                 socioNuevo.datos_extra.conyuge.nombres =  datos_extra.conyuge.nombres;
               }

               if(datos_extra.conyuge.apellidos !== '' && datos_extra.conyuge.apellidos !== undefined) {
                 socioNuevo.datos_extra.conyuge.apellidos =  datos_extra.conyuge.apellidos;
               }

               if(datos_extra.conyuge.dni !== '' && datos_extra.conyuge.dni !== undefined) {
                 socioNuevo.datos_extra.conyuge.dni =  datos_extra.conyuge.dni;
               }

               if(datos_extra.conyuge.fecha_nacimiento !== '' && datos_extra.conyuge.fecha_nacimiento !== undefined) {
                 socioNuevo.datos_extra.conyuge.fecha_nacimiento =  datos_extra.conyuge.fecha_nacimiento;
               }

               if(datos_extra.conyuge.celular !== '' && datos_extra.conyuge.celular !== undefined) {
                 socioNuevo.datos_extra.conyuge.celular =  datos_extra.conyuge.celular;
               }

               if(datos_extra.conyuge.email !== '' && datos_extra.conyuge.email !== undefined) {
                 socioNuevo.datos_extra.conyuge.email =  datos_extra.conyuge.email;
               }

                console.log('El conyuge del socio fue asociado con la data enviada');

          }

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

                          // Almacenando socio en la DB
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

                          // Almacenando al conyuge en la DB
                          // Llamando al socio
                          const query2 = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE dni = '${ socioNuevo.dni }';`)

                          query2.on('row', (row) => {
                              results2.push(row)
                          })

                          query2.on('end', () => {
                              done()

                              // Actualizando conyuge con el id del socio afiliado
                              socioNuevo.datos_extra.conyuge.id_socio_afiliado = results2[0].id;
                              socioNuevo.datos_extra.afiliado.id_socio_afiliado = results2[0].id;

                              // Guardando conyuge en la DB
                              client.query(`INSERT INTO ${ data_value_tablas[1] }
                                           (nombres,
                                           apellidos,
                                           dni,
                                           fecha_nacimiento,
                                           celular,
                                           fecha_ingreso,
                                           email,
                                           id_socio_afiliado
                                           ) VALUES (
                                           '${ socioNuevo.datos_extra.conyuge.nombres }',
                                           '${ socioNuevo.datos_extra.conyuge.apellidos }',
                                           '${ socioNuevo.datos_extra.conyuge.dni }',
                                           '${ socioNuevo.datos_extra.conyuge.fecha_nacimiento }',
                                           '${ socioNuevo.datos_extra.conyuge.celular }',
                                           '${ socioNuevo.datos_extra.conyuge.fecha_ingreso }',
                                           '${ socioNuevo.datos_extra.conyuge.email }',
                                           '${ socioNuevo.datos_extra.conyuge.id_socio_afiliado }');`);

                              // Guardando afiliado en la DB
                              client.query(`INSERT INTO ${ data_value_tablas[2] }
                                           (nombres,
                                           apellidos,
                                           dni,
                                           fecha_nacimiento,
                                           direccion,
                                           email,
                                           celular,
                                           telefono,
                                           fecha_ingreso,
                                           carta_declaratoria,
                                           id_socio_afiliado
                                           ) VALUES (
                                           '${ socioNuevo.datos_extra.afiliado.nombres }',
                                           '${ socioNuevo.datos_extra.afiliado.apellidos }',
                                           '${ socioNuevo.datos_extra.afiliado.dni }',
                                           '${ socioNuevo.datos_extra.afiliado.fecha_nacimiento }',
                                           '${ socioNuevo.datos_extra.afiliado.direccion }',
                                           '${ socioNuevo.datos_extra.afiliado.email }',
                                           '${ socioNuevo.datos_extra.afiliado.celular }',
                                           '${ socioNuevo.datos_extra.afiliado.telefono }',
                                           '${ socioNuevo.datos_extra.afiliado.fecha_ingreso }',
                                           '${ socioNuevo.datos_extra.afiliado.carta_declaratoria }',
                                           '${ socioNuevo.datos_extra.afiliado.id_socio_afiliado }');`);


                              console.log('El socio se registro efectivamente en la DB');

                              res.status(200).json({
                                  status: 'ok',
                                  result: socioNuevo,
                                  message: 'El socio se registro efectivamente en la DB'
                              })

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

   if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {
      
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
                           situacion_alerta:             req.body.situacion_alerta  || results[0].situacion_alerta,
                           datos_extra:  {
                                 conyuge: {
                                   nombres:               '',
                                   apellidos:             '',
                                   dni:                   '',
                                   fecha_nacimiento:      '',
                                   celular:               '',
                                   fecha_ingreso:         '',
                                   email:                 '',
                                   id_socio_afiliado:     ''
                                 },
                                 afiliado: {
                                   nombres:              '',
                                   apellidos:            '',
                                   dni:                  '',
                                   fecha_nacimiento:     '',
                                   direccion:            '',
                                   email:                '',
                                   celular:              '',
                                   telefono:             '',
                                   fecha_ingreso:        '',
                                   carta_declaratoria:   '',
                                   id_socio_afiliado:    ''
                                 }
                           }
                       }

                       if(req.body.hasOwnProperty('datos_extra')) {

                           console.log('DATOS EXTRA DEL CLIENTE');
                           console.log(req.body.datos_extra);

                           var datos_extra = req.body.datos_extra;

                           // Obteniendo datos del conyuge

                           // Obteniendos datos del afiliado
                           var socio_user = results[0];
                           var results_conyugue = [];
                           var results_afiliado = [];
                           
                           // Obteniendo datos del conyuge 
                           const query_conyugue = client.query(`SELECT * FROM ${ data_value_tablas[1] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                           
                           query_conyugue.on('row', (row) => {
                               results_conyugue.push(row)
                           })

                           query_conyugue.on('end', () => {
                               done();

                               socio_user.datos_extra = {
                                 conyuge: '',
                                 afiliado: ''
                               }

                               if(results_conyugue.length !== 0) {
                                   socio_user.datos_extra.conyuge = results_conyugue[0]
                               } 

                               // Obteniendo datos del afiliado
                               const query_afiliado = client.query(`SELECT * FROM ${ data_value_tablas[2] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                               
                               query_afiliado.on('row', (row) => {
                                   results_afiliado.push(row)
                               })

                               query_afiliado.on('end', () => {
                                   done();


                                   if(results_afiliado.length !== 0) {
                                       socio_user.datos_extra.afiliado = results_afiliado[0]
                                   } 

                                    // Actualizando conyuge
                                    if(datos_extra.conyuge !== undefined && datos_extra.conyuge !== null) {

                                        console.log('DATOS CONYUGE PASARON');
                                        console.log(datos_extra.conyuge);

                                         socioNuevo.datos_extra.conyuge.nombres =           socio_user.datos_extra.conyuge.nombres;
                                         socioNuevo.datos_extra.conyuge.apellidos =         socio_user.datos_extra.conyuge.apellidos;
                                         socioNuevo.datos_extra.conyuge.dni =               socio_user.datos_extra.conyuge.dni;
                                         socioNuevo.datos_extra.conyuge.fecha_nacimiento =  socio_user.datos_extra.conyuge.fecha_nacimiento;
                                         socioNuevo.datos_extra.conyuge.celular =           socio_user.datos_extra.conyuge.celular;
                                         socioNuevo.datos_extra.conyuge.email =             socio_user.datos_extra.conyuge.email;

                                         if(datos_extra.conyuge.nombres !== '' && datos_extra.conyuge.nombres !== undefined) {
                                           socioNuevo.datos_extra.conyuge.nombres =  datos_extra.conyuge.nombres;
                                         }

                                         if(datos_extra.conyuge.apellidos !== '' && datos_extra.conyuge.apellidos !== undefined) {
                                           socioNuevo.datos_extra.conyuge.apellidos =  datos_extra.conyuge.apellidos;
                                         }

                                         if(datos_extra.conyuge.dni !== '' && datos_extra.conyuge.dni !== undefined) {
                                           socioNuevo.datos_extra.conyuge.dni =  datos_extra.conyuge.dni;
                                         }

                                         if(datos_extra.conyuge.fecha_nacimiento !== '' && datos_extra.conyuge.fecha_nacimiento !== undefined) {
                                           socioNuevo.datos_extra.conyuge.fecha_nacimiento =  datos_extra.conyuge.fecha_nacimiento;
                                         }

                                         if(datos_extra.conyuge.celular !== '' && datos_extra.conyuge.celular !== undefined) {
                                           socioNuevo.datos_extra.conyuge.celular =  datos_extra.conyuge.celular;
                                         }

                                         if(datos_extra.conyuge.email !== '' && datos_extra.conyuge.email !== undefined) {
                                           socioNuevo.datos_extra.conyuge.email =  datos_extra.conyuge.email;
                                         }

                                         // Guardando conyuge en la DB
                                        
                                        console.log('tabla ', data_value_tablas[1]);

                                        console.log('datos socio');
                                        console.log(socioNuevo);

                                        console.log('id socio');
                                        console.log(socio_id);

                                         // SQL Query > Select Data
                                        client.query(`UPDATE ${ data_value_tablas[1] } SET
                                                      nombres =           '${ socioNuevo.datos_extra.conyuge.nombres }',
                                                      apellidos =         '${ socioNuevo.datos_extra.conyuge.apellidos }',
                                                      dni =               '${ socioNuevo.datos_extra.conyuge.dni }',
                                                      fecha_nacimiento =  '${ socioNuevo.datos_extra.conyuge.fecha_nacimiento }',
                                                      celular =           '${ socioNuevo.datos_extra.conyuge.celular }',
                                                      email =             '${ socioNuevo.datos_extra.conyuge.email }'
                                                      WHERE 
                                                      id_socio_afiliado = '${ socio_id }';
                                                      `);

                                          console.log('El conyuge del socio fue actualizado');

                                    }

                                    // Actualizando afiliado
                                    if(datos_extra.afiliado !== undefined && datos_extra.afiliado !== null) {
                                         socioNuevo.datos_extra.afiliado.nombres =             socio_user.datos_extra.afiliado.nombres;
                                         socioNuevo.datos_extra.afiliado.apellidos =           socio_user.datos_extra.afiliado.apellidos;
                                         socioNuevo.datos_extra.afiliado.dni =                 socio_user.datos_extra.afiliado.dni;
                                         socioNuevo.datos_extra.afiliado.fecha_nacimiento =    socio_user.datos_extra.afiliado.fecha_nacimiento;
                                         socioNuevo.datos_extra.afiliado.direccion =           socio_user.datos_extra.afiliado.direccion;
                                         socioNuevo.datos_extra.afiliado.email =               socio_user.datos_extra.afiliado.email;
                                         socioNuevo.datos_extra.afiliado.celular =             socio_user.datos_extra.afiliado.celular;
                                         socioNuevo.datos_extra.afiliado.telefono =            socio_user.datos_extra.afiliado.telefono;
                                         socioNuevo.datos_extra.afiliado.carta_declaratoria =  socio_user.datos_extra.afiliado.carta_declaratoria;
                                          
                                         if(datos_extra.afiliado.nombres !== '' && datos_extra.afiliado.nombres !== undefined) {
                                           socioNuevo.datos_extra.afiliado.nombres =  datos_extra.afiliado.nombres;
                                         }

                                         if(datos_extra.afiliado.apellidos !== '' && datos_extra.afiliado.apellidos !== undefined) {
                                          socioNuevo.datos_extra.afiliado.apellidos =   datos_extra.afiliado.apellidos;
                                         }

                                         if(datos_extra.afiliado.dni !== '' && datos_extra.afiliado.dni !== undefined) {
                                            socioNuevo.datos_extra.afiliado.dni =  datos_extra.afiliado.dni;
                                         }

                                         if(datos_extra.afiliado.fecha_nacimiento !== '' && datos_extra.afiliado.fecha_nacimiento !== undefined) {
                                            socioNuevo.datos_extra.afiliado.fecha_nacimiento =   datos_extra.afiliado.fecha_nacimiento;
                                         }

                                         if(datos_extra.afiliado.direccion !== '' && datos_extra.afiliado.direccion !== undefined) {
                                           socioNuevo.datos_extra.afiliado.direccion =  datos_extra.afiliado.direccion;
                                         }

                                         if(datos_extra.afiliado.email !== '' && datos_extra.afiliado.email !== undefined) {
                                            socioNuevo.datos_extra.afiliado.email =   datos_extra.afiliado.email;
                                         }

                                         if(datos_extra.afiliado.celular !== '' && datos_extra.afiliado.celular !== undefined) {
                                            socioNuevo.datos_extra.afiliado.celular =  datos_extra.afiliado.celular;
                                         }

                                         if(datos_extra.afiliado.telefono !== '' && datos_extra.afiliado.telefono !== undefined) {
                                            socioNuevo.datos_extra.afiliado.telefono =  datos_extra.afiliado.telefono;
                                         }

                                         if(datos_extra.afiliado.carta_declaratoria !== '' && datos_extra.afiliado.carta_declaratoria !== undefined) {
                                            socioNuevo.datos_extra.afiliado.carta_declaratoria =  datos_extra.afiliado.carta_declaratoria;
                                         }


                                         // Guardando afiliado en la DB
                                         client.query(`UPDATE ${ data_value_tablas[2] } SET
                                                      nombres =            '${ socioNuevo.datos_extra.afiliado.nombres }',
                                                      apellidos =          '${ socioNuevo.datos_extra.afiliado.apellidos }',
                                                      dni =                '${ socioNuevo.datos_extra.afiliado.dni }',
                                                      fecha_nacimiento =   '${ socioNuevo.datos_extra.afiliado.fecha_nacimiento }',
                                                      direccion =          '${ socioNuevo.datos_extra.afiliado.direccion }',
                                                      email =              '${ socioNuevo.datos_extra.afiliado.email }',
                                                      celular =            '${ socioNuevo.datos_extra.afiliado.celular }',
                                                      telefono =           '${ socioNuevo.datos_extra.afiliado.telefono }',
                                                      carta_declaratoria = '${ socioNuevo.datos_extra.afiliado.carta_declaratoria }'
                                                      WHERE 
                                                      id_socio_afiliado = '${ socio_id }';
                                                      `);

                                          console.log('El afiliado del socio fue actualizado');


                                    }


                               })

                           })

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

// Viewer: Socio by id
// READ One item by id from list
app.get('/item/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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

                    var socio_user = results[0];
                    var results_conyugue = [];
                    var results_afiliado = [];
                    
                    // Obteniendo datos del conyuge 
                    const query_conyugue = client.query(`SELECT * FROM ${ data_value_tablas[1] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                    
                    query_conyugue.on('row', (row) => {
                        results_conyugue.push(row)
                    })

                    query_conyugue.on('end', () => {
                        done();

                        socio_user.datos_extra = {
                          conyuge: '',
                          afiliado: ''
                        }

                        if(results_conyugue.length !== 0) {
                            socio_user.datos_extra.conyuge = results_conyugue[0]
                        } 

                        // Obteniendo datos del afiliado
                        const query_afiliado = client.query(`SELECT * FROM ${ data_value_tablas[2] } WHERE id_socio_afiliado = '${ socio_user.id }';`)
                        
                        query_afiliado.on('row', (row) => {
                            results_afiliado.push(row)
                        })

                        query_afiliado.on('end', () => {
                            done();


                            if(results_afiliado.length !== 0) {
                                socio_user.datos_extra.afiliado = results_afiliado[0]
                            } 

                            console.log('DATOS EL SOCIO ');
                            console.log(socio_user);

                            res.status(200).render('./dashboard/socio/info_perfil/index.jade',{
                                status: 'ok',
                                result: socio_user,
                                message: 'El socio cliente fue encontrado en la base de datos',
                                user: req.user
                            })

                        })

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

// Viewer: Form Create
app.get('/form-to-register', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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

// Viewer: Form Edit
app.get('/form-to-edit/:table_select/:socio_id', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

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
