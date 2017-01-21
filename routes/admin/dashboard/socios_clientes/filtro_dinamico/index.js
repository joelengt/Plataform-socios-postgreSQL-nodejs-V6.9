var express = require('express')
var qs = require('qs');
var app = express.Router()
var path = require('path')

var config = require('../../../../../config')

var users_type = config.users_access
var connectionString = config.postgresql.local

var PostgreSQL = require('../../../../../db/postgresql/index.js').PostgreSQL;

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

        var param_tipo_socio = req.query.tipo_socio                   || 'Todos';
        var param_situacion_socio = req.query.situacion_socio         || 'Todos';
        var param_tipo_pago = req.query.tipo_pago                     || 'Todos';
        var param_situacion_trabajo = req.query.situacion_trabajo     || 'Todos';
        var param_carta_declaratoria = req.query.carta_declaratoria   || 'Todos';
        var param_onomastico = req.query.onomastico                   || 'Todos';

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

            var filtro_tipo_socio = '';
            var filtro_situacion_socio = '';
            var filtro_tipo_pago = '';
            var filtro_situacion_trabajo = '';
            var filtro_carta_declaratoria = '';
            var filtro_onomastico = '';

            // Options Filter
            if(socio_filter_params.tipo_socio ===          'Todos' &&
               socio_filter_params.situacion_socio ===     'Todos' &&
               socio_filter_params.tipo_pago ===           'Todos' &&
               socio_filter_params.situacion_trabajo ===   'Todos' &&
               socio_filter_params.carta_declaratoria ===  'Todos' &&
               socio_filter_params.onomastico ===          'Todos') {

                console.log('Default Todos');

               // PostgreSQL
               PostgreSQL.query('socios', `SELECT * FROM ${ data_value_tablas[table_select] }`).make(function(builder) {
               });

            } else {
                console.log('con Filtro');

                // Evaluando el filtro => 'Tipo Socio'
                switch (socio_filter_params.tipo_socio) {
                    case 'Activos':
                        filtro_tipo_socio = "Activos";
                        break;

                    case 'Adherentes':
                        filtro_tipo_socio = "Adherentes";
                        break;

                    case 'Todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_tipo_socio = ''
                        break;
                }

                // Evaluando el filtro => 'Situacion de socio'
                switch (socio_filter_params.situacion_socio) {
                    case 'Habil':
                        filtro_situacion_socio = "Habil";
                        break;

                    case 'Inhabil':
                        filtro_situacion_socio = "Inhabil";
                        break;

                    case 'Renunciante':
                        filtro_situacion_socio = "Renunciante";
                        break;

                    case 'Fallecido':
                        filtro_situacion_socio = "Fallecido";
                        break;

                    case 'Todos':
                        // Si la palabra es 'todos', se queda en blanco
                        filtro_situacion_socio = '';
                        break;
                }

                // Evaluando el filtro => 'Tipo de pago'
                switch (socio_filter_params.tipo_pago) {
                    case 'OGECOE':
                        filtro_tipo_pago = "OGECOE";
                        break;

                    case 'CPMP':
                        filtro_tipo_pago = "CPMP";
                        break;

                    case 'Pago Directo':
                        filtro_tipo_pago = "Pago Directo";
                        break;

                    case 'Todos':
                        filtro_tipo_pago = '';
                        break;
                }

                // Evaluando el filtro => 'Situación de trabajo'
                switch (socio_filter_params.situacion_trabajo) {
                    case 'Actividad':
                        filtro_situacion_trabajo = "Actividad";
                        break;

                    case 'Retiro':
                        filtro_situacion_trabajo = "Retiro";
                        break;

                    case 'Todos':
                        filtro_situacion_trabajo = '';
                        break;
                }

                // Evaluando el filtro => 'Carta declaratoria'
                switch (socio_filter_params.carta_declaratoria) {
                    case 'Si':
                        filtro_carta_declaratoria = "Si";
                        break;

                    case 'No':
                        filtro_carta_declaratoria = "No";
                        break;

                    case 'Todos':
                        filtro_carta_declaratoria = '';
                        break;
                }

                // Evaluando el filtro => 'Onomastico'
                switch (socio_filter_params.onomastico) {
                    case 'Enero':
                        
                        filtro_onomastico = 1;
                        break;

                    case 'Febrero':
                        filtro_onomastico = 2;
                        break;

                    case 'Marzo':
                        filtro_onomastico = 3;
                        break;

                    case 'Abril':
                        filtro_onomastico = 4;
                        break;

                    case 'Mayo':
                        filtro_onomastico = 5;
                        break;

                    case 'Junio':
                        filtro_onomastico = 6;
                        break;

                    case 'Julio':
                        filtro_onomastico = 7;
                        break;

                    case 'Agosto':
                        filtro_onomastico = 8;
                        break;

                    case 'Septiembre':
                        filtro_onomastico = 9;
                        break;

                    case 'Octubre':
                        filtro_onomastico = 10;
                        break;

                    case 'Noviembre':
                        filtro_onomastico = 11;
                        break;

                    case 'Diciembre':
                        filtro_onomastico = 12;
                        break;

                    case 'Todos':
                        filtro_onomastico = '';
                        break;
                }

                // PostgreSQL
                PostgreSQL.query('socios', `SELECT * FROM ${ data_value_tablas[table_select] }`).make(function(builder) {
                    // parametros de filtrado
                    if(filtro_tipo_socio !== '') {
                        console.log('Filtro para tipo_socio => ', filtro_tipo_socio);
                        builder.where('tipo_socio', filtro_tipo_socio);
                    }

                    if(filtro_situacion_socio !== '') {
                        console.log('Filtro para situacion_socio');

                        builder.where('situacion_socio', filtro_situacion_socio);
                    }

                    if(filtro_tipo_pago !== '') {
                        console.log('Filtro para tipo_pago');

                        builder.where('tipo_pago', filtro_tipo_pago);
                    }

                    if(filtro_situacion_trabajo !== '') {
                        console.log('Filtro para situacion_trabajo');

                        builder.where('situacion_trabajo', filtro_situacion_trabajo);
                    }

                    if(filtro_carta_declaratoria !== '') {
                        console.log('Filtro para carta_declaratoria');

                        builder.where('carta_declaratoria', filtro_carta_declaratoria);
                    }

                    // if(filtro_onomastico !== '') {
                    //     console.log('Filtro para fecha_nacimiento');

                    //     builder.where('fecha_nacimiento', filtro_onomastico);
                    // }

                });

            }

            PostgreSQL.exec(function(err, response) {
                // console.log(response);
                var count = 0;

                for(var j = 0; j <= response.socios.length - 1; j++) {
                    var element = response.socios[j];
                    count++;
                }

                console.log('TOTAL', count);

                // Filter by date 
                if(filtro_onomastico !== '') {
                    console.log('Filtro para fecha_nacimiento');
                    console.log('La Fecha es ', filtro_onomastico);

                    for(var j = 0; j <= response.socios.length - 1; j++) {
                        var element = response.socios[j];
                        
                        console.log('User id', element.id);
                        
                        // Filter by date birthday
                        var birthday_partner = new Date(element.fecha_nacimiento)
                        var month_partner = birthday_partner.getMonth();

                        console.log('onomastico',birthday_partner);
                        console.log('month partner', month_partner);

                        if(month_partner === filtro_onomastico) {
                            console.log('EL MES COINCIDE');
                        }

                    }

                }

                return res.status(200).json({
                   status: 'ok Pg',
                   list: response.socios
                })

            });


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
