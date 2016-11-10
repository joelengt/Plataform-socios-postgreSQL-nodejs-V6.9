var express = require('express')
var pg = require('pg')
var qs = require('qs');
var app = express.Router()
var path = require('path')

var config = require('../../../../../config')

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

// READ One item by id from list
app.get('/table/:table_select/columns/params', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.onwers ||
       req.user.permiso === users_type.admins ||
       req.user.permiso === users_type.officers ||
       req.user.permiso === users_type.viewer) {

       // var socio_id = Number(req.params.socio_id);
        var table_select = Number(req.params.table_select);

        var socio_filter_params = {
            region: req.query.region,
            unidad: req.query.unidad,
            arma:   req.query.arma,
            grado:  req.query.grado,
            fecha:  req.query.fecha
        }

        console.log(socio_id);

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
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } WHERE ${ param_filter } = '${ param_content }';`)

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
                        result: results,
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

module.exports = app
