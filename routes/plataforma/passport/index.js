var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')

var app = express.Router()

//var Users = require('../../../models/usuarios')

// passport config
app.get('/logout', function(req, res) {
  req.logout()
  
  res.status(200).json({
  	status: 'User logout',
  	message: 'El usuario usuario se ha logout'
  })

})


/*
// Auth plataforma cliente mobile
app.post('/auth/plataforma', passport.authenticate('local'), function (req, res) {
	// do something with req.user

	console.log('Data passport: ')
	console.log(req.user)
	
	if(req.user) {
		console.log('Paso auth')
		res.status(200).json({
			user: req.user,
			token_auth: req.user.token_auth
		})

	} else {
		console.log('No Paso auth')

		// El usuario no se encuentra
		res.status(200).json({
			status: 'El usuario No esta autentificado y no tiene permiso'
		})
	}

})*/

/*
app.post('/auth/plataforma', passport.authenticate('local', {
    failureRedirect : '/plataforma/fail', // redirect back to the signup page if there is an error
    failureFlash : true
}), function (req, res) {
		console.log('Entro!!!')

		console.log('Paso auth')
		res.status(200).json({
			user: req.user,
			token_auth: req.user.token_auth
		})
})*/


app.post('/auth/plataforma', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
    	return next(err); 
    }

    console.log('------------')

    console.log('user parametro')
    console.log(user)

    console.log('------------')

    console.log('parametro info')
    console.log(info)


    console.log('------ Req.user')
    console.log(req.user)

    // Si el parametro user es falso
    if (!user) { 
    	return res.status(200).json({
    		status: 'not_access',
    		message: info.message
    	})
    }

    // Si el usuario es true, lo logea y trae su data
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err); 
      }

      return res.status(200).json({
      		user: req.user,
      		token_auth: req.user.token_auth
      })

    });

  })(req, res, next);
});

/*
passport.authenticate('local', function (err, account) {
	    req.logIn(account, function() {
	    	console.log('AUTH')
	        res.status(err ? 500 : 200).send(err ? err : account);
	    });
})(this.req, this.res, this.next);
*/
// Auth dashboard cliente web with session
/*app.post('/auth/dashboard', passport.authenticate('local', {
	successRedirect : '/dashboard', // redirect to the secure profile section
    failureRedirect : '/dashboard/fail', // redirect back to the signup page if there is an error
    failureFlash : true
}))*/

app.post('/auth/dashboard', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
    	return next(err); 
    }

    console.log('------------')

    console.log('user parametro')
    console.log(user)

    console.log('------------')

    console.log('parametro info')
    console.log(info)


    console.log('------ Req.user')
    console.log(req.user)

    // Si el parametro user es falso
    if (!user) { 
    	return res.status(403).json({
    		status: 'not_access',
    		message: info.message
    	})
    }

    // Si el usuario es true, lo logea y trae su data
    req.logIn(user, function(err) {
      if (err) { 
      	return next(err); 
      }

      return res.status(200).json({
      		user: req.user,
      		token_auth: req.user.token_auth
      })

    });

  })(req, res, next);
});

/*
app.post('/auth/dashboard', passport.authenticate('local'), function (req, res) {

	console.log('PASO')
	console.log('------------------')
	console.log(req)
	console.log('-------------------')

	if(req.user) {

		console.log('EXITO, el usuario esta AUTENTIFICADO')

		res.status(200).json({
			user: req.user,
			token_auth: req.user.token_auth
		})

	} else {

		console.log('EL usuario NO ESTA AUTENTIFICADO')
		
		// El usuario no se encuentra
		res.status(200).json({
			status: 'El usuario No esta autentificado y no tiene permiso'
		})

	}

})*/

module.exports = app

