var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
//var jade = require('jade')
//var Hogan = require('hogan.js')
//var fs = require('fs')

// get file
//var template = fs.readFileSync('./views/mail_1.hjs','utf-8')

// compile template
//var compiledTemplate = Hogan.compile(template)

function handleSayHello(user_data_send, callback) {
	// var fn = jade.compile('')

	console.log('DENTRO DEL LLAMADO')

    var transporter = nodemailer.createTransport(smtpTransport({
	    service : 'Gmail',//mail.cromlu.com
	    auth: {
		        user: 'astrumdata3043@gmail.com',   //https://www.google.com/settings/security/lesssecureapps
		        pass: 'coder123'
		    }
		})
	)

    var template_html_get_data_account = `<html>
    					<div>
    						<h3>Hola ${user_data_send.name}</h3>
    					</div>
    					<div>
    						<p> Sabemos que olvidaste tu usuario y contraseña, pero no te preocupes, aqui estan: </p>
    						<div>
	    						<div>
	    							<p>usuario: ${user_data_send.data.username}</p>
	    						</div>
								<div>
	    							<p>usuario: ${user_data_send.data.password}</p>
								</div> 
    						</div>
    						<div>
    							<p> * Si, el usuario y contraseña, te son dificil de recordar, contacta con un usuario de oficina para cambiar tus datos</p>
    							<p> * No compartas tus datos de usuario con otras personas, por seguridad</p>
    						</div>
    					</div>
    				</html>`

    var mailOptions = {
        from: 'Joel  <joelengt@gmail.com>', // sender address
        to: user_data_send.email + ', ' +'joelengt@gmail.com', // list of receivers
        subject: 'Electric: Recuperar tu cuenta', // Subject line
        text: 'Electric: Recuperar tu cuenta',
        html: template_html_get_data_account
        /*html: compiledTemplate.render({
        	name : req.body.nombre,
        	telefono: req.body.telefono,
        	mensaje: req.body.mensaje
        })  */ 
        // render templte
    }

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        
	        console.log('error_Mensaje')

	        console.log(error)
	        // res.send("mensaje no envio: " , error )
	        return callback(error.message)
	    }

	    console.log('Message SEND: ' + info.response)
	    // res.send('mensaje enviado :D')
	    //res.render('send_ok-comprar', { name: req.body.nombre, email : req.body.email})
	    callback(error, { status: 'ok', message: 'Mensaje enviado', info: info.response })
	})
}

module.exports = handleSayHello
