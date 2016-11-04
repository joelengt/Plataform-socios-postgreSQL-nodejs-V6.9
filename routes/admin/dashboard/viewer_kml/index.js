var express = require('express')
var app = express.Router()

var Work_Order = require('../../../../models/orden_trabajo')
var Cliente = require('../../../../models/orden_trabajo/cliente')
var Poste = require('../../../../models/orden_trabajo/poste')
var Usuarios = require('../../../../models/usuarios')
var Contratista = require('../../../../models/usuarios/contratistas/index.js')
var Notificaciones = require('../../../../models/notificaciones/index.js')

var Kmls = require('../../../../models/kml_files/index.js')
var config  = require('../../../../config.js')

var driveNow = require('../../../../controllers/googledrive/sample_google.js') 
var driveNowCreate = require('../../../../controllers/googledrive/sample_google_upload.js') 
var driveNowDelete = require('../../../../controllers/googledrive/sample_google_remove.js') 

// var clientSecretJsonPath  = require('../../../../client_secret.json')

var users_type = config.users_access
var work_order_status = config.status
 
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next()

	   	console.log('El usuario no esta autentificado. Requiere logearse')
	    res.status(403).json({
	       status: 'not_access',
	       message: 'El usuario no esta autentificado. Requiere logearse'
	    })
}

// >> Order de Trabajo

// API: READ - Crear nueva orden de Trabajo y el primer elemento en blanco
app.get('/', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins || 
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		// Leyendo todos los archivos KML en la base de datos
		// res.render('./admin/dashboard/view_kml/index.jade',{
		//  	user: req.user
		// })

		res.status(200).json({
			status: 'ok',
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

// API: READ LIst from google drive
app.get('/list', isLoggedIn, function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins || 
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {

		// Leer kml, kmz guardados en la base de datos
		console.log('CODIGO ANTES DEJECUTAR')
		driveNow(req, res, function (err, response) {
			if(err) {
				return res.status(500).json({
					status: 'error_server',
					message: 'Error al obtener coordenadas del tracking de usuarios',
					error: err
				})
			}
			
			var files = response.files

			if (files.length == 0) {
			  console.log('No files found.')

			} else {
			  console.log('Files:')
			  
			  for (var i = 0; i < files.length; i++) {
			    var file = files[i];

			    console.log('----------------------------')
			    
			    console.log('%s (%s)', file.name, file.id);
			    console.log(file)
			    
			    console.log('----------------------------')
			  } 

			  //
			  var arr = []
			  var uri_kml = ''

			  // Build array
			  for(var d = 0; d <= files.length - 1; d++) {

			      var element_kml_on_drive = files[d]
			      
			      console.log('Element')
			      console.log(element_kml_on_drive)

			      // Build url
			      var uri_kml = {
			        id:    element_kml_on_drive.id,
			        path: 'https://docs.google.com/uc?authuser=0&id=' + element_kml_on_drive.id,
			        name:  element_kml_on_drive.name
			      }

			      // Insertando elemento kml
			      arr.push(uri_kml)

			  }

			  // Devolviendo arreglo 
			  res.status(200).json({
			  	status: 'ok',
			    user: req.user,
			    kml_files: arr
			  })

			}

		})

	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
	     res.status(403).json({
	        status: 'not_access',
	        message: 'El usuario no esta autentificado. Requiere logearse'
	     })
	}

})

// API: CREATE - Añadiendo un nuevo elemento KML
app.post('/new-file-kml', function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		console.log('BODY')
		console.log(req.body)

		console.log('FILS')
		console.log(req.files)

		if(req.files.hasOwnProperty('file_kml')) {
		 	
	 	 	// Actualizando los datos del psote. Con Archivos multimedia
	 	 	console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
	 		
	 	 	// Validando path uploads ----
	 	 	var FilesCover = req.files.file_kml
	 	 	console.log('ARCHIVO SUBIDO')
	 	 	console.log(FilesCover)

	 	 	driveNowCreate(req, res, FilesCover, function(err, response) {
	 	 		if(err) {
	 	 			return res.status(500).json({
						status: 'error_server',
						message: 'Error al subir archivo kml',
						error: err
					})
	 	 		}

	 	 		console.log('Archivo kml guardado')

	 	 		res.status(200).json({
	 	 			status: 'ok',
	 	 			message: 'El archivo kml fue agradado a la lista con exito',
	 	 			kml_file: response
	 	 		})

	 	 	})

		} else {
			res.status(200).json({
				status: 'upload_filed	',
				message: 'El archivo kml no fue detectado ara subir. Error'
			})
			
		}

	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
	     res.status(403).json({
	        status: 'not_access',
	        message: 'El usuario no esta autentificado. Requiere logearse'
	     })
	}
})


// API: UPDATE - PATH - Añadiendo un nuevo elemento KML
app.put('/updated-file-kml/:file_id', function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		var file_id = req.params.file_id

		if(req.files.hasOwnProperty('file2')) {
		 	
	 	 	// Actualizando los datos del psote. Con Archivos multimedia
	 	 	console.log('Actualizando datos de POSTE con nuevo elemento multimedia. Imagen cargada')
	 		
	 	 	// Validando path uploads ----
	 	 	var NewFilesCover = req.files.file2
	 	 	console.log('ARCHIVO SUBIDO - para reemplazar')
	 	 	console.log(NewFilesCover)

	 	 	console.log('BODY')
	 	 	console.log(req.body)

	 	 	console.log('FILS')
	 	 	console.log(req.files)

	 	 	// Eliminando elemento del drive
	 	 	driveNowDelete(req, res, file_id, function (err, response){
	 	 		if(err) {
	 	 			return res.status(500).json({
	 	 				status: 'error_server',
	 	 				message: 'Error al eliminar archivo kml',
	 	 				error: err
	 	 			})
	 	 		}

     			console.log('Archivo kml elimminado')
     			console.log(response)

		 	 	// Creando nuevo elemento
		 	 	driveNowCreate(req, res, NewFilesCover, function (err, date_updated) {
		 	 		if(err) {
		 	 			return res.status(500).json({
		 	 				status: 'error_server',
		 	 				message: 'Error al actualizar archivo kml, en googledrive',
		 	 				error: err
		 	 			})
		 	 		}

		 	 		console.log('Archivo kml Actualizado!!!')

		 	 		console.log('Archivo subio')
		 	 		console.log('File Id: ' + date_updated.id)
		 	 			
		 	 		console.log('RESPUESTA EN EL API')

		 			console.log(date_updated)

		 	 		res.status(200).json({
		 	 			status: 'ok',
		 	 			message: 'El archivo kml fue actualizado con exito',
		 	 			kml_new: date_updated
		 	 		})

	 	 			console.log('Archivo kml Actualizado!!!')

		 	 	})

	 	 	})

		} else {
			res.status(200).json({
				status: 'upload_filed	',
				message: 'El archivo kml no, se pudo actualizar. Error'
			})
		}

	} else {
		console.log('El usuario no esta autentificado. Requiere logearse')
	     res.status(403).json({
	        status: 'not_access',
	        message: 'El usuario no esta autentificado. Requiere logearse'
	     })
	}
})

// API_ DELETE - Remove a element frm google drive
app.delete('/remove-file-kml/:file_id', function (req, res) {
	if(req.user.permiso === users_type.onwers || 
	   req.user.permiso === users_type.admins ||
	   req.user.permiso === users_type.officers ||
	   req.user.permiso === users_type.viewer) {
		
		var fileId = req.params.file_id

 	 	driveNowDelete(req, res, fileId, function(err, response) {
 	 		if(err) {
 	 			return res.status(500).json({
 	 				status: 'error_server',
 	 				message: 'Error al eliminar el archivo de google drive',
 	 				error: err
 	 			})
 	 		}

 	 		console.log('Archivo kml elimminado')
 	 		console.log(response)

 	 		res.status(200).json({
 	 			status: 'ok',
 	 			message: 'El archivo kml fue eliminado de la lista con exito'
 	 		})

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
