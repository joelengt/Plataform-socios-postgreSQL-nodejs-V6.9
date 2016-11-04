//Modulos y Dependencias
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

var mongoose = require('mongoose')
var passport = require('passport')
var multer = require('multer')
var ss = require('socket.io-stream')

var path = require('path')
var logger = require('morgan')
var favicon  =require('serve-favicon')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var methodOverride = require('method-override')
var session = require('express-session')
var flash = require('connect-flash')

// configuración para correar el servidor
var config = require('./config')

var allowCrossTokenHeader = function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS")
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
	//res.setHeader('Access-Control-Allow-Headers', 'X-ACCESS_TOKEN, Access-Control-Allow-Origin, Authorization, Origin, Content-Length, X-Requested-With, Content-Type, Content-Range, Content-Disposition, Content-Description, token') 
    next()
}

// Configuración del servidor
app.use(allowCrossTokenHeader)

// Prevenir error y mostrar primero en la consola
process.on('uncaughtException', function(err) {
	console.log(err)
})

//Conexión con Mongodb
mongoose.connect(config.mongodb.local , function (err) {
	if(err) {
		return console.log('Error al connectar database: ' + err)
	}
	console.log('Exito base de datos connectada')
})

//Conexión con PostgreSQL
//require('./db/postgresql/index.js')

// middlawares
function middleware (req, res, next) {
  return next()
}

// Configuración del servidor
app.set('port', process.env.PORT || 5000)
app.set('view engine', 'jade')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, './uploads')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.use(flash())


// Session timer estimate Limite: 30 días
app.use(session({ secret: 'usuarioSession', cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 }}))

//app.use(session({ secret: 'usuarioSession'))
app.use(multer({dest: './uploads/news/'}))

/*
app.use(multer({
  dest: './uploads',
  limits: {
    fieldNameSize: 999999999,
    fieldSize: 999999999
  },
  includeEmptyFields: true,
  inMemory: true,
  onFileUploadStart: function(file) {
    console.log('Starting ' + file.fieldname);
  },
  onFileUploadData: function(file, data) {
    console.log('Got a chunk of data!');
  },
  onFileUploadComplete: function(file) {
    console.log('Completed file!');
  },
  onParseStart: function() {
    console.log('Starting to parse request!');
  },
  onParseEnd: function(req, next) {
    console.log('Done parsing!');
    next();
  },
  onError: function(e, next) {
    if (e) {
      console.log(e.stack);
    }
    next();
  }
}));*/

// Middlewares de passport para login
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Controllers
var register_user = require('./controllers/login/passport')
var trackUserRoom = require('./controllers/tracking_user/index.js')
var chatRooms = require('./controllers/chat/index.js') 
var chatUsersConnection = require('./controllers/connection_status/index.js')

register_user(app, passport)
trackUserRoom(io)
chatRooms(io, ss)
chatUsersConnection(io)

// Routes requerimiento

// Routes - user

var login = require('./routes/login')
var plataforma = require('./routes/plataforma')
var plataforma_passport = require('./routes/plataforma/passport')
var plataforma_usurios_tracking_road = require('./routes/plataforma/usuario/tracking_user/index.js')
var plataforma_perfil = require('./routes/plataforma/usuario/perfil/index.js')
var plataforma_chat = require('./routes/plataforma/chat/index.js')
var plataforma_notificaciones = require('./routes/plataforma/notificaciones/index.js')

var plataforma_db_postgre = require('./routes/admin/tablesql/mobile.js')


// Rotes - admin
var dashboard = require('./routes/admin/dashboard')
var dashboard_notificaciones = require('./routes/admin/dashboard/notificaciones')
var dashboard_usurios = require('./routes/admin/dashboard/usuarios')

var dashboard_usurios_tracking_road = require('./routes/admin/dashboard/usuarios/tracking_user/index.js')


var dashboard_kml = require('./routes/admin/dashboard/viewer_kml')
var dashboard_servicios = require('./routes/admin/dashboard/servicios')

var dashboard_perfil = require('./routes/admin/dashboard/perfil/index.js')
var dashboard_chat = require('./routes/admin/dashboard/chat/index.js')

var dashboard_get_my_data = require('./routes/send_email/index.js')

var dashboard_db_postgre = require('./routes/admin/tablesql/index.js')


// Routes usage
app.use('/', login)
app.use('/', plataforma_passport)
app.use('/plataforma', plataforma)
app.use('/plataforma/usuario/tracking', plataforma_usurios_tracking_road)
app.use('/plataforma/perfil', plataforma_perfil)
app.use('/plataforma/chat', plataforma_chat)
app.use('/plataforma/notificaciones', plataforma_notificaciones)
app.use('/plataforma/street-data-map/', plataforma_db_postgre)


app.use('/dashboard', dashboard)
app.use('/dashboard/notificaciones', dashboard_notificaciones)
app.use('/dashboard/usuarios', dashboard_usurios)
app.use('/dashboard/usuarios/tracking', dashboard_usurios_tracking_road)

app.use('/dashboard/servicios', dashboard_servicios)

app.use('/dashboard/viewer-kml', dashboard_kml)

app.use('/dashboard/perfil', dashboard_perfil)
app.use('/dashboard/chat', dashboard_chat)

app.use('/get-my-access/send_email', dashboard_get_my_data)

app.use('/dashboard/street-data-map', dashboard_db_postgre)

app.io = io

// Ordenes de trabajo plataforma
require('./routes/plataforma/work_order/index.js')(app, io)

// Ordenes de trabajo Dashboard
require('./routes/admin/dashboard/ordenes_trabajo')(app, io)
/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})
*/
// Error 404
app.use(function (req, res) {
	res.statusCode = 404
	res.send('Error 404: Pagina No Encontrada')
})

// Error 500
app.use(function (req, res) {
	res.statusCode = 500
	res.send('Error 500: Error del Servidor, Porfavor intentelo más tarde')
})

//Start server
server.listen(app.set('port'), function (err) {
	if(err) {
		return console.log('Error al iniciar server en el puerto: ' + err)
	}
	console.log('Server iniciado en el puerto: ' + app.set('port'))
})
