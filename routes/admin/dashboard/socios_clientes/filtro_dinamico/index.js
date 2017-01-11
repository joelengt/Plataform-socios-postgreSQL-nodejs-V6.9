var express = require('express')
var pg = require('pg')
var qs = require('qs');
var app = express.Router()
var path = require('path')

var config = require('../../../../../config')

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

// READ One item by id from list
app.get('/table/:table_select/columns/params', function (req, res) {
    // if(req.user.permiso === users_type.onwers ||
    //    req.user.permiso === users_type.admins ||
    //    req.user.permiso === users_type.officers ||
    //    req.user.permiso === users_type.viewer) {

        var table_select = Number(req.params.table_select);

        var param_tipo_socio = req.query.tipo_socio                   || 'todos';
        var param_situacion_socio = req.query.situacion_socio         || 'todos';
        var param_tipo_pago = req.query.tipo_pago                     || 'todos';
        var param_situacion_trabajo = req.query.situacion_trabajo     || 'todos';
        var param_carta_declaratoria = req.query.carta_declaratoria   || 'todos';
        var param_onomastico = req.query.onomastico                   || 'todos';

        // var socio_filter_params = {
        //     tipo_socio:           param_tipo_socio.toLowerCase(),
        //     situacion_socio:      param_situacion_socio.toLowerCase(),
        //     tipo_pago:            param_tipo_pago.toLowerCase(),
        //     situacion_trabajo:    param_situacion_trabajo.toLowerCase(),
        //     carta_declaratoria:   param_carta_declaratoria.toLowerCase(),
        //     onomastico:           param_onomastico.toLowerCase()
        // }

        var socio_filter_params = {
            tipo_socio:           param_tipo_socio,
            situacion_socio:      param_situacion_socio,
            tipo_pago:            param_tipo_pago,
            situacion_trabajo:    param_situacion_trabajo,
            carta_declaratoria:   param_carta_declaratoria,
            onomastico:           param_onomastico
        }

        var queryFiler = '';

        var results = [];

        if(table_select >= 0 && table_select <= 2) {

            // Options Filter
            if(socio_filter_params.tipo_socio ===          'Todos' &&
               socio_filter_params.situacion_socio ===     'Todos' &&
               socio_filter_params.tipo_pago ===           'Todos' &&
               socio_filter_params.situacion_trabajo ===   'Todos' &&
               socio_filter_params.carta_declaratoria ===  'Todos' &&
               socio_filter_params.onomastico ===          'Todos') {

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
                    case 'Activos':
                        filtro_tipo_socio = "tipo_socio = 'Activos'";
                        break;

                    case 'Adherentes':
                        filtro_tipo_socio = "tipo_socio = 'Adherentes'";
                        break;

                    case 'Todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_tipo_socio = ''
                        break;
                }

                // Evaluando el filtro => 'Situacion de socio'
                switch (socio_filter_params.situacion_socio) {
                    case 'Habil':
                        filtro_situacion_socio = "situacion_socio = 'Habil'";
                        break;

                    case 'Inhabil':
                        filtro_situacion_socio = "situacion_socio = 'Inhabil'";
                        break;

                    case 'Renunciante':
                        filtro_situacion_socio = "situacion_socio = 'Renunciante'";
                        break;

                    case 'Fallecido':
                        filtro_situacion_socio = "situacion_socio = 'Fallecido'";
                        break;

                    case 'Todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_situacion_socio = '';
                        break;
                }

                // Evaluando el filtro => 'Tipo de pago'
                switch (socio_filter_params.tipo_pago) {
                    case 'OGECOE':
                        filtro_tipo_pago = "tipo_pago = 'OGECOE'";
                        break;

                    case 'CPMP':
                        filtro_tipo_pago = "tipo_pago = 'CPMP'";
                        break;

                    case 'Pago Directo':
                        filtro_tipo_pago = "tipo_pago = 'Pago Directo'";
                        break;

                    case 'Todos':
                        filtro_tipo_pago = '';
                        break;
                }

                // Evaluando el filtro => 'Situación de trabajo'
                switch (socio_filter_params.situacion_trabajo) {
                    case 'Actividad':
                        filtro_situacion_trabajo = "situacion_trabajo = 'Actividad'";
                        break;

                    case 'Retiro':
                        filtro_situacion_trabajo = "situacion_trabajo = 'Retiro'";
                        break;

                    case 'Todos':
                        filtro_situacion_trabajo = '';
                        break;
                }

                // Evaluando el filtro => 'Carta declaratoria'
                switch (socio_filter_params.carta_declaratoria) {
                    case 'Si':
                        filtro_carta_declaratoria = "carta_declaratoria = 'Si'";
                        break;

                    case 'No':
                        filtro_carta_declaratoria = "carta_declaratoria = 'No'";
                        break;

                    case 'Todos':
                        filtro_carta_declaratoria = '';
                        break;
                }

                // Evaluando el filtro => 'Onomastico'
                switch (socio_filter_params.onomastico) {
                    case 'Enero':
                        
                        filtro_onomastico = "fecha_nacimiento = 'Enero'";
                        break;

                    case 'Febrero':
                        filtro_onomastico = "fecha_nacimiento = 'Febrero'";
                        break;

                    case 'Marzo':
                        filtro_onomastico = "fecha_nacimiento = 'Marzo'";
                        break;

                    case 'Abril':
                        filtro_onomastico = "fecha_nacimiento = 'Abril'";
                        break;

                    case 'Mayo':
                        filtro_onomastico = "fecha_nacimiento = 'Mayo'";
                        break;

                    case 'Junio':
                        filtro_onomastico = "fecha_nacimiento = 'Junio'";
                        break;

                    case 'Julio':
                        filtro_onomastico = "fecha_nacimiento = 'Julio'";
                        break;

                    case 'Agosto':
                        filtro_onomastico = "fecha_nacimiento = 'Agosto'";
                        break;

                    case 'Septiembre':
                        filtro_onomastico = "fecha_nacimiento = 'Septiembre'";
                        break;

                    case 'Octubre':
                        filtro_onomastico = "fecha_nacimiento = 'Octubre'";
                        break;

                    case 'Noviembre':
                        filtro_onomastico = "fecha_nacimiento = 'Noviembre'";
                        break;

                    case 'Diciembre':
                        filtro_onomastico = "fecha_nacimiento = 'Diciembre'";
                        break;

                    case 'Todos':
                        filtro_onomastico = '';
                        break;
                }

                // Validante each option 
                if(filtro_tipo_socio          !== '' ||
                   filtro_situacion_socio     !== '' ||
                   filtro_tipo_pago           !== '' ||
                   filtro_situacion_trabajo   !== '' ||
                   filtro_carta_declaratoria  !== '' ||
                   filtro_onomastico          !== '') {

                   var query_string = '';
                   var final_query = [filtro_tipo_socio, 
                                      filtro_situacion_socio,
                                      filtro_tipo_pago,
                                      filtro_situacion_trabajo, 
                                      filtro_carta_declaratoria, 
                                      filtro_onomastico]; 

                    for(var e = 0; e <= final_query.length - 1; e++) {
                        var element = final_query[e];

                        if(element !== '' && e < final_query.length - 2) {
                            query_string += element + ' AND ';
                        }

                        if(e === final_query.length - 1) {
                            query_string += element;
                            query_string += ' AND ';
                        }

                    }

                    // Validate if not blank

                    // Si tienen almenos un campo lleno
                    queryFiler = `SELECT * FROM ${ data_value_tablas[table_select] }
                                  WHERE
                                  ${ query_string };`;

                    // queryFiler = `SELECT * FROM ${ data_value_tablas[table_select] }
                    //               WHERE
                    //               ${ filtro_tipo_socio }
                    //               ${ filtro_situacion_socio }
                    //               ${ filtro_tipo_pago }
                    //               ${ filtro_situacion_trabajo }
                    //               ${ filtro_carta_declaratoria }
                    //               ${ filtro_onomastico };`;

                } else {

                    // Si no tiene ningun campo para filtrar
                    queryFiler = `SELECT * FROM ${ data_value_tablas[table_select] };`;

                }

            }

            console.log('FILTER PROCESS SELECTED ==> ');
            console.log(queryFiler)

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
                const query = client.query(queryFiler)

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
                    } else {
                        

                        console.log('Encontrados => ' + results.length);
                        res.status(200).json({
                            status: 'ok',
                            result: results,
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

    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //     res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //     })
    // }
});

module.exports = app
