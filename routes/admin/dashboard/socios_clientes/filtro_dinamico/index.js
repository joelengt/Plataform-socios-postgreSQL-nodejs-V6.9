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

        var table_select = Number(req.params.table_select);

        var socio_filter_params = {
            tipo_socio:           req.query.tipo_socio.toLowerCase()         || 'todos',
            situacion_socio:      req.query.situacion_socio.toLowerCase()    || 'todos',
            tipo_pago:            req.query.tipo_pago.toLowerCase()          || 'todos',
            situacion_trabajo:    req.query.situacion_trabajo.toLowerCase()  || 'todos',
            carta_declaratoria:   req.query.carta_declaratoria.toLowerCase() || 'todos',
            onomastico:           req.query.onomastico.toLowerCase()         || 'todos'
        }

        var queryFiler = '';

        var results = [];

        if(table_select >= 0 && table_select <= 2) {

            // Options Filter
            if(socio_filter_params.tipo_socio ===          'todos' &&
               socio_filter_params.situacion_socio ===     'todos' &&
               socio_filter_params.tipo_pago ===           'todos' &&
               socio_filter_params.situacion_trabajo ===   'todos' &&
               socio_filter_params.carta_declaratoria ===  'todos' &&
               socio_filter_params.onomastico ===          'todos') {

               queryFiler = `SELECT * FROM ${ data_value_tablas[table_select] };`;

            } else {
                var filtro_tipo_socio = '';
                var filtro_situacion_socio = '';
                var filtro_tipo_pago = '';
                var filtro_situacion_trabajo = '';
                var filtro_carta_declaratoria = '';
                var filtro_onomastico = '';

                // Evaluando el filtro => 'Tipo Socio'
                switch (socio_filter_params.tipo_socio) {
                    case 'activos':
                        filtro_tipo_socio = 'activos';
                        break;

                    case 'adherentes':
                        filtro_tipo_socio = 'adherentes';
                        break;

                    case 'todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_tipo_socio = ''
                        break;
                }

                // Evaluando el filtro => 'Situacion de socio'
                switch (socio_filter_params.situacion_socio) {
                    case 'habil':
                        filtro_situacion_socio = 'habil';
                        break;

                    case 'inhabil':
                        filtro_situacion_socio = 'inhabil';
                        break;

                    case 'renunciante':
                        filtro_situacion_socio = 'renunciante';
                        break;

                    case 'fallecido':
                        filtro_situacion_socio = 'fallecido';
                        break;

                    case 'todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_situacion_socio = '';
                        break;
                }

                // Evaluando el filtro => 'Tipo de pago'
                switch (socio_filter_params.tipo_pago) {
                    case 'ogecoe':
                        filtro_tipo_pago = 'ogecoe';
                        break;

                    case 'cpmp':
                        filtro_tipo_pago = 'cpmp';
                        break;

                    case 'pago_directo':
                        filtro_tipo_pago = 'pago_directo';
                        break;

                    case 'todos':
                        filtro_tipo_pago = '';
                        break;
                }

                // Evaluando el filtro => 'Situación de trabajo'
                switch (socio_filter_params.situacion_trabajo) {
                    case 'actividad':
                        filtro_situacion_trabajo = 'actividad'
                        break;

                    case 'retiro':
                        filtro_situacion_trabajo = 'retiro';
                        break;

                    case 'todos':
                        filtro_situacion_trabajo = '';
                        break;
                }

                // Evaluando el filtro => 'Carta declaratoria'
                switch (socio_filter_params.carta_declaratoria) {
                    case 'si':
                        filtro_carta_declaratoria = 'si';
                        break;

                    case 'no':
                        filtro_carta_declaratoria = 'no';
                        break;

                    case 'todos':
                        filtro_carta_declaratoria = '';
                        break;
                }

                // Evaluando el filtro => 'Onomastico'
                switch (socio_filter_params.onomastico) {
                    case 'enero':
                        filtro_onomastico = 'enero';
                        break;

                    case 'febrero':
                        filtro_onomastico = 'febrero';
                        break;

                    case 'marzo':
                        filtro_onomastico = 'marzo';
                        break;

                    case 'abril':
                        filtro_onomastico = 'abril';
                        break;

                    case 'mayo':
                        filtro_onomastico = 'mayo';
                        break;

                    case 'junio':
                        filtro_onomastico = 'junio';
                        break;

                    case 'julio':
                        filtro_onomastico = 'julio';
                        break;

                    case 'agosto':
                        filtro_onomastico = 'agosto';
                        break;

                    case 'septiembre':
                        filtro_onomastico = 'septiembre';
                        break;

                    case 'octubre':
                        filtro_onomastico = 'octubre';
                        break;

                    case 'noviembre':
                        filtro_onomastico = 'noviembre';
                        break;

                    case 'diciembre':
                        filtro_onomastico = 'diciembre';
                        break;

                    case 'todos':
                        filtro_onomastico = '';
                        break;
                }

                queryFiler = `SELECT * FROM ${ data_value_tablas[table_select] }
                              WHERE  
                              tipo_socio =         '' AND
                              situacion_socio =    '' AND
                              tipo_pago =          '' AND 
                              situacion_trabajo =  '' AND 
                              carta_declaratoria = '' AND 
                              onomastico =         '';`

            }

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
                const query = client.query(`SELECT * FROM ${ data_value_tablas[table_select] } 
                                            ${ query_filter };`)

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
