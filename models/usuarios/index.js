var mongoose = require('mongoose')

var Schema = mongoose.Schema

var userSchema = new Schema({
    names:         { type: String },
    last_names:    { type: String },
    full_name:     { type: String },
    photo:         {},
    dni:           { type: String, unique: true },
    email:         { type: String, unique: true },
    username:      { type: String, unique: true },
    password:      { type: String },
    permiso:       { type: String },
    token_auth:    { type: String },
    fecha_creada:  { type: Date, default: Date.now },
    status_connect: { type: Boolean, default: false }
})


var users = mongoose.model('users', userSchema)

module.exports = users
