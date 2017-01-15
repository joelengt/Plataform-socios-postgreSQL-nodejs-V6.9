var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')

var app = express.Router()

// passport config
app.get('/logout', function(req, res) {
  req.logout()
  
  res.status(200).json({
  	status: 'User logout',
  	message: 'El usuario usuario se ha logout'
  })

})

app.post('/auth/dashboard', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
    	return next(err); 
    }

    console.log('------------')

    console.log('user parametro HERE')
    console.log(user)

    console.log('------------')

    console.log('parametro info')
    console.log(info)


    console.log('------ Req.user')
    console.log(req.user)

    // Si el parametro user es falso
    if (!user) { 

      // Render 
      return res.status(200).render('./login/index.jade', {
        status: 'ok',
        message: info.message
      })
    }

    // Si el usuario es true, lo logea y trae su data
    req.logIn(user, function(err) {
      if (err) {
      	return next(err);
      }

      res.redirect('/dashboard');
    
    });

  })(req, res, next);
});

module.exports = app

