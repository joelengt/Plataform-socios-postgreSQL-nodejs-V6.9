var express = require('express')
var pg = require('pg')
var app = express.Router()
var path = require('path')

var Urbs = require('../../../models/urbanizaciones/index.js')
var Users = require('../../../models/usuarios')

var config = require('../../../config')
var users_type = config.users_access

var connectionString = config.postgresql.local

var data_value_tablas = [
  'md_country',   // 0
  'md_district',  // 1
  'md_province',  // 2
  'md_region',    // 3
  'md_street',    // 4
  'md_streettype' // 5
]

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

// READ list all
app.get('/list/:value', ensureAuthorized, function (req, res, next) {
  Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
    if(err) {
      return res.status(500).json({
          status: 'error_server',
          message: 'Error al encontrar a usuario en la base de datos',
          error: err
      })

    } else {

      console.log('ENTRO!!! AUTH')
      console.log(usuario_token)

      if(usuario_token.permiso === users_type.onwers ||   
        usuario_token.permiso === users_type.admins ||
        usuario_token.permiso === users_type.officers ||
        usuario_token.permiso === users_type.viewer ||
        usuario_token.permiso === users_type.users_campo) {

        var value_select = Number(req.params.value)

        if (value_select >= 0 && value_select <= 5) {

          const results = [];
          // Get a Postgres client from the connection pool
          pg.connect(connectionString, (err, client, done) => {
            // Handle connection errors
            if(err) {
              done();
              console.log(err);
              return res.status(500).json({success: false, data: err})
            }

            // SQL Query > Select Data
            const query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ' ORDER BY id ASC;')

            // Stream results back one row at a time
            query.on('row', (row) => {
              results.push(row)
            })

            // After all data is returned, close connection and return results
            query.on('end', () => {
              done()
              return res.status(200).json({
                status: 'ok',
                result: results,
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
    }
  })

})

// READ list with filter
app.get('/:option_select/:id_before', ensureAuthorized, function (req, res) {
  Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
    if(err) {
      return res.status(500).json({
          status: 'error_server',
          message: 'Error al encontrar a usuario en la base de datos',
          error: err
      })

    } else {

      console.log('ENTRO!!! AUTH')
      console.log(usuario_token)

      if(usuario_token.permiso === users_type.onwers ||   
        usuario_token.permiso === users_type.admins ||
        usuario_token.permiso === users_type.officers ||
        usuario_token.permiso === users_type.viewer ||
        usuario_token.permiso === users_type.users_campo) {
        
        var option_select = req.params.option_select
        var id_before = req.params.id_before

        var value_select
        var value_before

        // Evaluando valor de value
        if(option_select === 'pais') {
          value_select = 0

        } else if (option_select === 'region') {
          value_select = 3
          value_before = "country_id"

        } else if (option_select === 'provincia') {
          value_select = 2
          value_before = "region_id"

        } else if (option_select === 'distrito') {
          value_select = 1
          value_before = "province_id"

        } else if (option_select === 'street') {
          value_select = 4
          value_before = "district_id"

        } else if (option_select === 'street-by-type') {
          value_select = 5
          value_before = "not_found"

        } else {
          value_select = 'not_found'
        }

        console.log(id_before)

        // Evaluando lectura de contenido
        if(id_before === 'list') {

          if (value_select >= 0 && value_select <= 5) {

            var results = [];
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
              // Handle connection errors
              if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err})
              }

              // SQL Query > Select Data
              var query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ' ORDER BY id ASC;')

              // Stream results back one row at a time
              query.on('row', (row) => {
                results.push(row)
              })

              // After all data is returned, close connection and return results
              query.on('end', () => {
                done()
                return res.status(200).json({
                  status: 'ok',
                  result: results,
                })

              })

            })

          } else {
            res.status(200).json({
              status: 'not_found',
              message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
            })
          }

        } else if (id_before > 0) {  // Filtro de lista, para el parametro buscado, por id de coincidencia en cascada anteior
          id_before = Number(id_before)

          if (value_select >= 1 && value_select <= 5) {  // pais no tiene para filtrarse en cascada anterior

            var results = [];
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
              // Handle connection errors
              if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err})
              }

              // SQL Query > Select Data
              var query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ' ORDER BY id ASC;')

              // Stream results back one row at a time
              query.on('row', (row) => {
                results.push(row)
              })

              // After all data is returned, close connection and return results
              query.on('end', () => {
                done()

                console.log('ARREGLO')
                console.log(results)

                console.log(typeof(id_before))
                console.log(id_before)

                // Validando filtro de peticion
                var result_filter = results.filter(function (element) {
                  return element[value_before] === id_before
                })

                // Validando si hay elemento encontrado
                if(result_filter.length === 0) {
                  res.status(200).json({
                    status: 'not_found',
                    message: 'No se encontraron elementos con el parametro buscado'
                  })

                } else {
                  return res.status(200).json({
                    status: 'ok',
                    result: result_filter,
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
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro id_before solicitado no es valida.'
          })
        }

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

// READ list with filter 
app.get('/street/:id_before/street-by-type/:id_before_second', ensureAuthorized, function (req, res) {
  Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
    if(err) {
      return res.status(500).json({
          status: 'error_server',
          message: 'Error al encontrar a usuario en la base de datos',
          error: err
      })

    } else {

      console.log('ENTRO!!! AUTH')
      console.log(usuario_token)

      if(usuario_token.permiso === users_type.onwers ||   
        usuario_token.permiso === users_type.admins ||
        usuario_token.permiso === users_type.officers ||
        usuario_token.permiso === users_type.viewer ||
        usuario_token.permiso === users_type.users_campo) {
        
        var option_select = req.params.option_select
        var id_before = req.params.id_before

        var id_before_second = req.params.id_before_second

        var value_select = 4
        var value_before = "district_id"

        console.log(id_before)

        // Evaluando lectura de contenido
        if (id_before > 0) {  // Filtro de lista, para el parametro buscado, por id de coincidencia en cascada anteior
          id_before = Number(id_before)
          id_before_second = Number(id_before_second)
          
          if (value_select >= 1 && value_select <= 5) {  // pais no tiene para filtrarse en cascada anterior

            var results = [];
            // Get a Postgres client from the connection pool
            pg.connect(connectionString, (err, client, done) => {
              // Handle connection errors
              if(err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err})
              }

              // SQL Query > Select Data
              var query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ' ORDER BY id ASC;')

              // Stream results back one row at a time
              query.on('row', (row) => {
                results.push(row)
              })

              // After all data is returned, close connection and return results
              query.on('end', () => {
                done()

                console.log('ARREGLO')
                console.log(results)

                console.log(typeof(id_before))
                console.log(id_before)

                // Validando filtro de peticion street
                var result_filter = results.filter(function (element) {
                  return element[value_before] === id_before
                })

                if(result_filter.length === 0) {
                  res.status(200).json({
                    status: 'not_found',
                    message: 'No se encontraron elementos con el parametro buscado'
                  })

                } else {

                  // Validando filtro de peticion street type
                  var result_filter2 = result_filter.filter(function (element) {
                    return element["streettype_id"] === id_before_second
                  })

                  if (result_filter2.length === 0) {
                    res.status(200).json({
                      status: 'not_found',
                      message: 'No se encontraron elementos con el parametro buscado'
                    })

                  } else {

                    return res.status(200).json({
                      status: 'ok',
                      result: result_filter2,
                    })

                  }

                }

              })

            })

          } else {
            res.status(200).json({
              status: 'not_found',
              message: 'El parametro solicitado no es valida'
            })
          }

        } else {
          res.status(200).json({
            status: 'not_found',
            message: 'El parametro id_before solicitado no es valida.'
          })
        }

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

// CREATE : Urganizacion
app.post('/get/urbanizacion/add', ensureAuthorized, function (req, res) {
  Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
    if(err) {
      return res.status(500).json({
          status: 'error_server',
          message: 'Error al encontrar a usuario en la base de datos',
          error: err
      })

    } else {

      console.log('ENTRO!!! AUTH')
      console.log(usuario_token)

      if(usuario_token.permiso === users_type.onwers ||   
        usuario_token.permiso === users_type.admins ||
        usuario_token.permiso === users_type.officers ||
        usuario_token.permiso === users_type.viewer ||
        usuario_token.permiso === users_type.users_campo) {
        
        var data_element = req.body.new_string_urbanizacion

        // Validando exitencia en la base de datos
        Urbs.findOne({'name': 'URB. ' + data_element}, function (err, result) {
          if(err) {
            return res.status(500).json({
              status: 'error_server',
              error: err
            })
          }

          console.log('RESULTADO DE BUSQUEDA')
          if(result === null) {
            // Es nuevo
            // Creando nuevo elemento a la lista de Urbanizacion
            var new_urbs = new Urbs({
                name: 'URB. ' + data_element
            })

            // Guardando nuevo dato
            new_urbs.save(function (err) {
                if(err) {
                    return res.status(200).json({
                      status: 'error_server',
                      error: err
                    })
                }

                // Respuesta del servidor
                res.status(200).json({
                    status: 'ok',
                    result: new_urbs
                })

            })

          } else {
            // Ya existe, fue encontrado
            console.log(result)

            res.status(200).json({
                status: 'ok',
                message: 'El dato fue encontrado',
                result: result
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

// READ: Urbanizacion
app.get('/get/urbanizacion/list', ensureAuthorized, function (req, res) {
  Users.findOne({'token_auth': req.token_auth}, function (err, usuario_token) {
    if(err) {
      return res.status(500).json({
          status: 'error_server',
          message: 'Error al encontrar a usuario en la base de datos',
          error: err
      })

    } else {

      console.log('ENTRO!!! AUTH')
      console.log(usuario_token)

      if(usuario_token.permiso === users_type.onwers ||   
        usuario_token.permiso === users_type.admins ||
        usuario_token.permiso === users_type.officers ||
        usuario_token.permiso === users_type.viewer ||
        usuario_token.permiso === users_type.users_campo) {
        
        Urbs.find(function (err, list) {
          if(err) {
              return res.status(200).json({
                status: 'error_server',
                error: err
              })
          }

          if(list.length === 0) {
            res.status(200).json({
              status: 'error_server',
              message: 'No hay elemento en la lista',
              result: []
            })

          } else {
            res.status(200).json({
              status: 'ok',
              result: list
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

/*
// CREATE
app.post('/todos', (req, res, next) => {
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
});*/

/* 

// UPDATE
app.put('/todos/:todo_id', (req, res, next) => {
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

// DELETE
app.delete('/todos/:todo_id', (req, res, next) => {
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
*/

module.exports = app
