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
app.get('/list/:value', isLoggedIn, (req, res, next) => {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var value_select = Number(req.params.value)

        if(value_select >= 0 && value_select <= 2) {
            const results = [];

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
app.get('/item/:table_select/:socio_id', isLoggedIn, (req, res, next) => {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        const results = [];

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
app.post('/item/:table_select/add', isLoggedIn, (req, res, next) => {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

        var table_select = Number(req.params.table_select);

        const results = [];

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
                       //const query_id = client.query(`SELECT count(*) FROM ${ data_value_tablas[table_select] };`)

                       socioNuevo.id_item = 

                       // Almacenando en la DB
                       // SQL Query > Insert Data

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
                                    '${ socioNuevo.campo28 }'
                                    )`);

                       console.log('El socio se registro efectivamente en la DB');
                       res.status(200).json({
                           status: 'ok',
                           result: results[0],
                           message: 'El socio se registro efectivamente en la DB'
                       })

                    } else {
                        // El usuario ya se encuentra registrado
                        console.log('El usuario ya se encuentra registrado');
                        res.status(200).json({
                            status: 'ok',
                            result: results[0],
                            message: 'El socio cliente fue encontrado en la base de datos'
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

// CREATE item from list
app.post('/item/add', isLoggedIn, (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({
        success: false,
        data: err
      });
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)',
    [data.text, data.complete]);

    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });

  });
});

// UPDATE item from list
app.put('/item/:socio_id', isLoggedIn, (req, res, next) => {
    const results = [];
    // Grab data from the URL parameters
    const id = req.params.todo_id;
    
    // Grab data from http request
    const data = {text: req.body.text, complete: req.body.complete};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Update Data
        client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
        [data.text, data.complete, id]);
        
        // SQL Query > Select Data
        const query = client.query("SELECT * FROM items ORDER BY id ASC");
        
        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        
        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });
});

// DELETE item from list
app.delete('/item/:socio_id', isLoggedIn, (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = app


// id_item