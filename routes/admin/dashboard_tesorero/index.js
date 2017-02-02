var express = require('express')
var app = express.Router()

var config = require('../../../config.js')

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

// Dashboard
app.get('/', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.tesorero) {

        console.log('El usuario tiene acceso a la plataforma')
        res.render('./dashboard_tesorero/index.jade', {
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

// Planillas

// READ ALL - Get a list panillas
app.get('/planillas/list', function (req, res) {
    // if(req.user.permiso === users_type.super_admin ||
    //    req.user.permiso === users_type.tesorero) {

        console.log('Planillas lista')

        // res.render('./dashboard_tesorero/index.jade', {
        //     user: req.user
        // })

        var planillasList = [];

        var data = {
            status: 'ok',
            list: planillasList
        };

        res.status(200).json(data);

    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //      res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //      })
    // }
});

// READ - Get panillas by id
app.get('/planillas/:planilla_id', function (req, res) {
    // if(req.user.permiso === users_type.super_admin ||
    //    req.user.permiso === users_type.tesorero) {

        var planilla_id = req.params.planilla_id;

        console.log('Planillas item')

        // res.render('./dashboard_tesorero/index.jade', {
        //     user: req.user
        // })

        var planillasItem = {
            id: planilla_id,
            title: 'Sample',
            price: 2001
        };
        
        var data = {
            status: 'ok',
            item: planillasItem
        };

        res.status(200).json(data);

    // } else {
    //     console.log('El usuario no esta autentificado. Requiere logearse')
    //      res.status(403).json({
    //         status: 'not_access',
    //         message: 'El usuario no esta autentificado. Requiere logearse'
    //      })
    // }
});

// CREATE - Planillas
app.post('/planillas/create', function (req, res) {

});

// UPDATE - Edit panilla by id
app.put('/planillas/:id', function (req, res) {

});

// DELETE - delete panilla by id
app.delete('/planillas/:id', function (req, res) {

});


module.exports = app
