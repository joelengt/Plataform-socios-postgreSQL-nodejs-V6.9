var express = require('express')
var app = express.Router()
var excelbuilder = require('msexcel-builder');

var config = require('../../../../config.js')

var users_type = config.users_access

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

app.get('/test-excel', function (req, res) {

    // Create a new workbook file in current working-path 
    var workbook = excelbuilder.createWorkbook('./', 'sample_table.xlsx')
      
    // Create a new worksheet with 10 columns and 12 rows 
    var sheet1 = workbook.createSheet('sheet1', 10, 12);
      
    // Fill some data 
    sheet1.set(1, 1, 'Title');
    
    for (var i = 2; i < 5; i++) {
        sheet1.set(i, 1, 'test'+i);
    }

    console.log('Termino de imprimir');
      
    // Save it 
    workbook.save(function(err){

    	console.log('Procesando datos');

    	console.log(err);

        if (err) {
            console.log('Algo fallo');
            workbook.cancel();

        } else {
         
          console.log('congratulations, your workbook created');
        	console.log('Lectura');

        	res.status(200).json({
        		status: 'ok'
        	})
        }
    });

})

module.exports = app
