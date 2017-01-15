var Users = require('../../models/usuarios/index.js');
var config = require('../../config');

// Buscando datos del usuario en la base de datos
function FindUserData(user_id, cb) {
    Users.findById({'_id': user_id}, function (err, user_find) {
        if(err) {
            return cb(err)
        }

        cb(err, user_find)

    })
}

module.exports = FindUserData
