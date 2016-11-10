var express = require('express')
var pg = require('pg')
var app = express.Router()
var path = require('path')

var config = require('../../../../config')

var users_type = config.users_access
var connectionString = config.postgresql.local

var data_value_tablas = [
  'habiles_lecabpe_2016',   // 0
  'inhabiles_lecabpe_2016',  // 1
  'personalidades'  // 2
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
                    console.log('Largo del arreglo: ' + results.length);
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
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id_item = '${ socio_id }';`)

                // Stream results back one row at a time
                query.on('row', (row) => {
                    results.push(row)
                })

                // After all data is returned, close connection and return results
                query.on('end', () => {
                    done()

                    if(results.length === 0) {
                        return res.status(200).json({
                            status: 'not_found',
                            message: 'El socio cliente no fue encontrado en la base de datos'
                        })
                    } 

                    res.status(200).json({
                        status: 'ok',
                        result: results[0],
                        message: 'El socio cliente fue encontrado en la base de datos'
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

// CREATE item from list
app.post('/item/socio/add/:table_select', isLoggedIn, function (req, res) {
    // if(req.user.permiso === users_type.onwers ||
    //    req.user.permiso === users_type.admins ||
    //    req.user.permiso === users_type.officers ||
    //    req.user.permiso === users_type.viewer) {
        var table_select = Number(req.params.table_select);

        var results = [];
        var lista_table = [];

        // Obeteniendo nuevo usuario registrado
        var socioNuevo = {
            id_item:            '',
            fecha_ingreso:      req.body.fecha_ingreso || '',
            numero_carnet:      req.body.numero_carnet || '',
            foto:               req.body.foto || '',
            grado:              req.body.grado || '',
            arma:               req.body.arma || '',
            nombres:            req.body.nombres || '',
            unidad:             req.body.unidad || '',
            gguu:               req.body.gguu || '',
            region:             req.body.region || '',
            guarnicion:         req.body.guarnicion || '',
            situacion:          req.body.situacion || '',
            filial:             req.body.filial || '',
            cip:                req.body.cip || '',
            dni:                req.body.dni || '',
            email:              req.body.email || '',
            celular1:           req.body.celular1 || '',
            celular2:           req.body.celular2 || '',
            rpm1:               req.body.rpm1 || '',
            rpm2:               req.body.rpm2 || '',
            telefono1:          req.body.telefono1 || '',
            telefono2:          req.body.telefono2 || '',
            cd_leg:             req.body.cd_leg || '',
            onomastico:         req.body.onomastico || '',
            cd_esp:             req.body.cd_esp || '',
            ono_esp:            req.body.ono_esp || '',
            esposa:             req.body.esposa || '',
            domicilio:          req.body.domicilio || '',
            diversos:           req.body.diversos || '',
            obs:                req.body.obs || '',
            campo28:            req.body.campo28 || ''
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

                console.log('Buscando coincidencia por id');

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

                           // Obteniendo nuevo id
                            const query2 = client.query(`SELECT * FROM ${ data_value_tablas[table_select] };`);

                            // Stream results back one row at a time
                            query2.on('row', (row) => {
                                lista_table.push(row)
                            })

                            // After all data is returned, close connection and return results
                            query2.on('end', function() {
                                done();
                                // Buscando al numero mayor
                                var mayor = 0;

                                for(var i = 0; i <= lista_table.length - 1; i++) {
                                    var lista_table_element = Number(lista_table[i].id_item);
                                    
                                    if(lista_table_element > mayor ) {
                                        mayor = lista_table_element;
                                    }

                                }

                                console.log('Numero mayor');
                                console.log(mayor);

                                // Asignando nuevo id
                                console.log('Asignando nuevo id al item')
                                socioNuevo.id_item = mayor + 1;
                                
                                // Almacenando en la DB
                                //INSERT INTO md_country (country_id, country_name) VALUES (1,'Perú');
                                client.query(`INSERT INTO ${ data_value_tablas[table_select] }
                                             (id_item, 
                                             fecha_ingreso,
                                             numero_carnet,
                                             foto,
                                             grado,
                                             arma,
                                             nombres,
                                             unidad,
                                             gguu,
                                             region,
                                             guarnicion,
                                             situacion,
                                             filial,
                                             cip,
                                             dni,
                                             email,
                                             celular1,
                                             celular2,
                                             rpm1,
                                             rpm2,
                                             telefono1,
                                             telefono2,
                                             cd_leg,
                                             onomastico,
                                             cd_esp,
                                             ono_esp,
                                             esposa,
                                             domicilio,
                                             diversos,
                                             obs,
                                             campo28
                                             ) VALUES (
                                             '${ socioNuevo.id_item }',
                                             '${ socioNuevo.fecha_ingreso }',
                                             '${ socioNuevo.numero_carnet }',
                                             '${ socioNuevo.foto }',
                                             '${ socioNuevo.grado }',
                                             '${ socioNuevo.arma }',
                                             '${ socioNuevo.nombres }',
                                             '${ socioNuevo.unidad }',
                                             '${ socioNuevo.gguu }',
                                             '${ socioNuevo.region }',
                                             '${ socioNuevo.guarnicion }',
                                             '${ socioNuevo.situacion }',
                                             '${ socioNuevo.filial }',
                                             '${ socioNuevo.cip }',
                                             '${ socioNuevo.dni }',
                                             '${ socioNuevo.email }',
                                             '${ socioNuevo.celular1 }',
                                             '${ socioNuevo.celular2 }',
                                             '${ socioNuevo.rpm1 }',
                                             '${ socioNuevo.rpm2 }',
                                             '${ socioNuevo.telefono1 }',
                                             '${ socioNuevo.telefono2 }',
                                             '${ socioNuevo.cd_leg }',
                                             '${ socioNuevo.onomastico }',
                                             '${ socioNuevo.cd_esp }',
                                             '${ socioNuevo.ono_esp }',
                                             '${ socioNuevo.esposa }',
                                             '${ socioNuevo.domicilio }',
                                             '${ socioNuevo.diversos }',
                                             '${ socioNuevo.obs }',
                                             '${ socioNuevo.campo28 }');`);

                                // Insertando en la base de datos
                                lista_table.push(socioNuevo);

                                console.log('El socio se registro efectivamente en la DB');
                                console.log(lista_table[lista_table.length - 1]);

                                res.status(200).json({
                                    status: 'ok',
                                    result: lista_table[lista_table.length - 1],
                                    message: 'El socio se registro efectivamente en la DB'
                                })

                            });

                        } else {
                            // El usuario ya se encuentra registrado
                            console.log('El usuario ya se encuentra registrado');
                            res.status(200).json({
                                status: 'ok',
                                message: 'El socio cliente fue encontrado en la base de datos',
                                result: results[0]
                            })
                        } 

                    })

                } else {

                    // El usuario es nuevo -> Registrar
                    console.log('El usuario se va aguardar sin importar repeticion, y esta listo para guarda en la base de datos');

                    // Obteniendo nuevo id
                     const query2 = client.query(`SELECT * FROM ${ data_value_tablas[table_select] };`);

                     // Stream results back one row at a time
                     query2.on('row', (row) => {
                         lista_table.push(row)
                     })

                     // After all data is returned, close connection and return results
                     query2.on('end', function() {
                         done();
                         // Buscando al numero mayor
                         var mayor = 0;

                         for(var i = 0; i <= lista_table.length - 1; i++) {
                             var lista_table_element = Number(lista_table[i].id_item);
                             
                             if(lista_table_element > mayor ) {
                                 mayor = lista_table_element;
                             }

                         }

                         console.log('Numero mayor');
                         console.log(mayor);

                         // Asignando nuevo id
                         console.log('Asignando nuevo id al item')
                         socioNuevo.id_item = mayor + 1;
                         
                         // Almacenando en la DB
                         //INSERT INTO md_country (country_id, country_name) VALUES (1,'Perú');
                         client.query(`INSERT INTO ${ data_value_tablas[table_select] }
                                      (id_item, 
                                      fecha_ingreso,
                                      numero_carnet,
                                      foto,
                                      grado,
                                      arma,
                                      nombres,
                                      unidad,
                                      gguu,
                                      region,
                                      guarnicion,
                                      situacion,
                                      filial,
                                      cip,
                                      dni,
                                      email,
                                      celular1,
                                      celular2,
                                      rpm1,
                                      rpm2,
                                      telefono1,
                                      telefono2,
                                      cd_leg,
                                      onomastico,
                                      cd_esp,
                                      ono_esp,
                                      esposa,
                                      domicilio,
                                      diversos,
                                      obs,
                                      campo28
                                      ) VALUES (
                                      '${ socioNuevo.id_item }',
                                      '${ socioNuevo.fecha_ingreso }',
                                      '${ socioNuevo.numero_carnet }',
                                      '${ socioNuevo.foto }',
                                      '${ socioNuevo.grado }',
                                      '${ socioNuevo.arma }',
                                      '${ socioNuevo.nombres }',
                                      '${ socioNuevo.unidad }',
                                      '${ socioNuevo.gguu }',
                                      '${ socioNuevo.region }',
                                      '${ socioNuevo.guarnicion }',
                                      '${ socioNuevo.situacion }',
                                      '${ socioNuevo.filial }',
                                      '${ socioNuevo.cip }',
                                      '${ socioNuevo.dni }',
                                      '${ socioNuevo.email }',
                                      '${ socioNuevo.celular1 }',
                                      '${ socioNuevo.celular2 }',
                                      '${ socioNuevo.rpm1 }',
                                      '${ socioNuevo.rpm2 }',
                                      '${ socioNuevo.telefono1 }',
                                      '${ socioNuevo.telefono2 }',
                                      '${ socioNuevo.cd_leg }',
                                      '${ socioNuevo.onomastico }',
                                      '${ socioNuevo.cd_esp }',
                                      '${ socioNuevo.ono_esp }',
                                      '${ socioNuevo.esposa }',
                                      '${ socioNuevo.domicilio }',
                                      '${ socioNuevo.diversos }',
                                      '${ socioNuevo.obs }',
                                      '${ socioNuevo.campo28 }');`);

                         // Insertando en la base de datos
                         lista_table.push(socioNuevo);

                         console.log('El socio se registro efectivamente en la DB');
                         console.log(lista_table[lista_table.length - 1]);

                         res.status(200).json({
                             status: 'ok',
                             result: lista_table[lista_table.length - 1],
                             message: 'El socio se registro efectivamente en la DB'
                         })

                     });

                }

            })

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
          })
        }

    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //     res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //     })
    // }
})

// // DELETE item from list
app.delete('/item/delete/:table_select/:socio_id', isLoggedIn, function (req, res) {
   // if(req.user.permiso === users_type.onwers ||
   //    req.user.permiso === users_type.admins ||
   //    req.user.permiso === users_type.officers ||
   //    req.user.permiso === users_type.viewer) {

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
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id_item = '${ socio_id }';`)

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
                       client.query(`DELETE FROM ${ data_value_tablas[table_select] } WHERE id_item = '${ socio_id }';`);

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
    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //     res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //     })
    // }
})

// UPDATE item from list
app.put('/item/update/:table_select/:socio_id', isLoggedIn, function (req, res) {
    // if(req.user.permiso === users_type.onwers ||
    //    req.user.permiso === users_type.admins ||
    //    req.user.permiso === users_type.officers ||
    //    req.user.permiso === users_type.viewer) {
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
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE id_item = '${ socio_id }';`)

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
                       // Existe, se va a eliminar
                       console.log('id_item del item para actualizar');
                       console.log(results[0].dni);

                       var socioNuevo = {
                           fecha_ingreso:      req.body.fecha_ingreso || results[0].fecha_ingreso,
                           numero_carnet:      req.body.numero_carnet || results[0].numero_carnet,
                           foto:               req.body.foto || results[0].foto,
                           grado:              req.body.grado || results[0].grado,
                           arma:               req.body.arma || results[0].arma,
                           nombres:            req.body.nombres || results[0].nombres,
                           unidad:             req.body.unidad || results[0].unidad,
                           gguu:               req.body.gguu || results[0].gguu,
                           region:             req.body.region || results[0].region,
                           guarnicion:         req.body.guarnicion || results[0].guarnicion,
                           situacion:          req.body.situacion || results[0].situacion,
                           filial:             req.body.filial || results[0].filial,
                           cip:                req.body.cip || results[0].cip,
                           dni:                req.body.dni || results[0].dni,
                           email:              req.body.email || results[0].email,
                           celular1:           req.body.celular1 || results[0].celular1,
                           celular2:           req.body.celular2 || results[0].celular2,
                           rpm1:               req.body.rpm1 || results[0].rpm1,
                           rpm2:               req.body.rpm2 || results[0].rpm2,
                           telefono1:          req.body.telefono1 || results[0].telefono1,
                           telefono2:          req.body.telefono2 || results[0].telefono2,
                           cd_leg:             req.body.cd_leg || results[0].cd_leg,
                           onomastico:         req.body.onomastico || results[0].onomastico,
                           cd_esp:             req.body.cd_esp || results[0].cd_esp,
                           ono_esp:            req.body.ono_esp || results[0].ono_esp,
                           esposa:             req.body.esposa || results[0].esposa,
                           domicilio:          req.body.domicilio || results[0].domicilio,
                           diversos:           req.body.diversos || results[0].diversos,
                           obs:                req.body.obs || results[0].obs,
                           campo28:            req.body.campo28 || results[0].campo28
                       }

                       console.log('Datos listos para subirse');
                       console.log(socioNuevo);

                       // SQL Query > Delete Item by id_item
                       client.query(`UPDATE ${ data_value_tablas[table_select] } SET 
                             fecha_ingreso = '${ socioNuevo.fecha_ingreso }',
                             numero_carnet = '${ socioNuevo.numero_carnet }',
                             foto =          '${ socioNuevo.foto }',
                             grado =         '${ socioNuevo.grado }',
                             arma =          '${ socioNuevo.arma }',
                             nombres =       '${ socioNuevo.nombres }',
                             unidad =        '${ socioNuevo.unidad }',
                             gguu =          '${ socioNuevo.gguu }',
                             region =        '${ socioNuevo.region }',
                             guarnicion =    '${ socioNuevo.guarnicion }',
                             situacion =     '${ socioNuevo.situacion }',
                             filial =        '${ socioNuevo.filial }',
                             cip =           '${ socioNuevo.cip }',
                             dni =           '${ socioNuevo.dni }',
                             email =         '${ socioNuevo.email }',
                             celular1 =      '${ socioNuevo.celular1 }',
                             celular2 =      '${ socioNuevo.celular2 }',
                             rpm1 =          '${ socioNuevo.rpm1 }',
                             rpm2 =          '${ socioNuevo.rpm2 }',
                             telefono1 =     '${ socioNuevo.telefono1 }',
                             telefono2 =     '${ socioNuevo.telefono2 }',
                             cd_leg =        '${ socioNuevo.cd_leg }',
                             onomastico =    '${ socioNuevo.onomastico }',
                             cd_esp =        '${ socioNuevo.cd_esp }',
                             ono_esp =       '${ socioNuevo.ono_esp }',
                             esposa =        '${ socioNuevo.esposa }',
                             domicilio =     '${ socioNuevo.domicilio }',
                             diversos =      '${ socioNuevo.diversos }',
                             obs =           '${ socioNuevo.obs }',
                             campo28 =       '${ socioNuevo.campo28 }'
                             WHERE 
                             id_item = '${ socio_id }';`);

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
    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //     res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //     })
    // }
});

module.exports = app
