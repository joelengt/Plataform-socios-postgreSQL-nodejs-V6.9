var express = require('express');
var app = express.Router()

app.get('/forget-password', function (req, res) {
    res.status(200).render('./login/forget_password/index.jade', {
        status: 'ok'
    })
})

module.exports = app;