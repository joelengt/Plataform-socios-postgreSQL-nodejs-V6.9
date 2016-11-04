
var Users = require('../../models/usuarios')
var config = require('../../config')
//var bCrypt = require('bcrypt-nodejs');

var LocalStrategy = require('passport-local').Strategy

var register = function (app, passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id)
	})

	passport.deserializeUser(function(id, done) {
		Users.findById(id, function(err, user) {
            done(err, user)
        })
	})

	passport.use(new LocalStrategy({
		usernameField: 'username',
	    passwordField: 'password',
	    passReqToCallback: true
	    //session: false
	}, 
	function(req, username, password, done) {
		process.nextTick(function() {
			
			Users.findOne({ username: username }, function (err, user) {
				if(err) {
					return done(err)
				}
				
				console.log('Content data User!!')
				console.log(user)

			    if(!user) { 
			    	console.log('El usuario no registrado : ' + username)
			    	//return done(null, false, req.flash('message', 'El usuario ingresado es incorrecto')); 
			    	return done(null, false, {'message': 'El usuario ingresado es incorrecto'}); 
			    	//return done(null, false)
			    	
			    }
	            
	            if(user.password != password) {
		            console.log('Contraseña incorrecta')
		            //return done(null, false, req.flash('message', 'La contraseña ingresada es incorrecta')); // redirect back to login page
		            return done(null, false, {'message': 'La contraseña ingresada es incorrecta'}); // redirect back to login page
			    	//return done(null, false)

	            }
	            
	            console.log('EL usuario es correcto, ACCESO :D')
	            return done(null, user)
			})
		
		})

	}))

	/*
	var isValidPassword = function(user, password){
	    return bCrypt.compareSync(password, user.password);
	}*/
}

module.exports = register
