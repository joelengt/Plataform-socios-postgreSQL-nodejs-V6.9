var express = require('express')
var app = express.Router()
var excelbuilder = require('msexcel-builder');

// archivo config
var config = require('../../config')

// DataBase
var Users = require('../../models/usuarios')

// Dashboard Plataforma Admin

// Permiso de acceso usuario
var config = require('../../config')
var users_type = config.users_access

app.get('/', function (req, res) {

    if(req.user.permiso === users_type.super_admin ||
       req.user.permiso === users_type.administrador ||
       req.user.permiso === users_type.tesorero) {
        
        res.status(200).json({
            status: 'ok'
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

module.exports = app
