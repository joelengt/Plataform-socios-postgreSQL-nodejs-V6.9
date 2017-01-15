var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')

var config = require('../../config.js');

// var jade = require('jade')
var Hogan = require('hogan.js')
var fs = require('fs')

// get file
var template = fs.readFileSync('../../views/mail/template_mail_forgot_password.hjs','utf-8')

// compile template
var compiledTemplate = Hogan.compile(template)

function handleSayHello(user_data_send, callback) {
    // var fn = jade.compile('')

    var transporter = nodemailer.createTransport(smtpTransport({
        service : 'Gmail', // Gmail 
        auth: {
                user: config.mailing.user,   //https://www.google.com/settings/security/lesssecureapps
                pass: config.mailing.pass
            }
        })
    )

    // var template_html_get_data_account = `<html>
    //                     <table width="600" border="0">
    //                        <tr>
    //                             <td>
    //                                 <h3>Hola ${user_data_send.name}</h3>
    //                             </td>
    //                        </tr>
    //                        <tr>
    //                             <td>
    //                                 <p> Sabemos que olvidaste tu usuario y contraseña, pero no te preocupes, aqui estan: </p>
    //                             </td>
    //                        </tr>
    //                        <tr>
    //                             <td>
    //                                 <table width="100%">
    //                                     <tr>
    //                                        <td>
    //                                             <div>
    //                                                 <p>usuario: ${user_data_send.data.username}</p>
    //                                             </div>
    //                                             <div>
    //                                                 <p>usuario: ${user_data_send.data.password}</p>
    //                                             </div> 
    //                                        </td>
    //                                     </tr>
    //                                     <tr>
    //                                         <td>
    //                                             <p> * Si, el usuario y contraseña, te son dificil de recordar, contacta con un usuario de oficina para cambiar tus datos</p>
    //                                             <p> * No compartas tus datos de usuario con otras personas, por seguridad</p>
    //                                         </td>
    //                                     </tr>
    //                                 </table>
    //                             </td>
    //                        </tr>
    //                     </table>
    //                 </html>`

    var mailOptions = {
        from: 'Joel  <joelengt@gmail.com>', // sender address
        to: user_data_send.email + ', ' +'joelengt@gmail.com', // list of receivers
        subject: 'Caballeria: Recuperar tu cuenta', // Subject line
        text: 'Caballeria: Recuperar tu cuenta',
        // html: template_html_get_data_account
        html: compiledTemplate.render({
            name : user_data_send,
        })
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
