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

app.get('/', isLoggedIn, function (req, res) {
    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {

        console.log('El usuario tiene acceso a la plataforma')
        res.render('./dashboard/index.jade', {
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

// Use controller from json module
var TestController = require('../../../controllers/test/index.js');

app.get('/test', TestController.data);


// Use controller from  class module
var Test2ClassController = require('../../../controllers/test2/index.js');
var Test2Controller = new Test2ClassController();

app.get('/test-2', Test2Controller.info);
app.get('/test-2/:id', Test2Controller.item);


module.exports = app
