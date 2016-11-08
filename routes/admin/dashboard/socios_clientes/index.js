var express = require('express')
var pg = require('pg')
var app = express.Router()
var path = require('path')

var config = require('../../../../config')

var users_type = config.users_access
var connectionString = config.postgresql.local

var data_value_tablas = [
  'habiles_lecabpe_2016',   // 0
  'inhabiles_lecabpe_2016',  // 1
  'personalidades'  // 2
]

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

// READ list all
app.get('/list/:value', isLoggedIn, (req, res, next) => {
  if(req.user.permiso === users_type.onwers ||
    req.user.permiso === users_type.admins ||
    req.user.permiso === users_type.officers ||
    req.user.permiso === users_type.viewer) {

	    var value_select = Number(req.params.value)

	    if(value_select >= 0 && value_select <= 2) {
			const results = [];

			// Get a Postgres client from the connection pool
			pg.connect(connectionString, (err, client, done) => {
				// Handle connection errors
				if(err) {
					done();
					console.log(err);
					return res.status(500).json({
						success: false,
						data: err
					})
				}

				// SQL Query > Select Data
				const query = client.query('SELECT * FROM ' + data_value_tablas[value_select] + ';')

				// Stream results back one row at a time
				query.on('row', (row) => {
					results.push(row)
				})

				// After all data is returned, close connection and return results
				query.on('end', () => {
					done()
					return res.status(200).json({
						status: 'ok',
						result: results,
					})
				})

	      })

	    } else {
	      res.status(200).json({
	        status: 'not_found',
	        message: 'El parametro solicitado no es valida. Rango de consulta: 0 a 5'
	      })
	    }

	} else {
	    console.log('El usuario no esta autentificado. Requiere logearse')
	    res.status(403).json({
	    	status: 'not_access',
	    	message: 'El usuario no esta autentificado. Requiere logearse'
	   	})
	}
});

// CREATE item from list
// app.post('/item/add', isLoggedIn, (req, res, next) => {
//   const results = [];
//   // Grab data from http request
//   const data = {text: req.body.text, complete: false};
//   // Get a Postgres client from the connection pool
//   pg.connect(connectionString, (err, client, done) => {
//     // Handle connection errors
//     if(err) {
//       done();
//       console.log(err);
//       return res.status(500).json({
//         success: false,
//         data: err
//       });
//     }
//     // SQL Query > Insert Data
//     client.query('INSERT INTO items(text, complete) values($1, $2)',
//     [data.text, data.complete]);

//     // SQL Query > Select Data
//     const query = client.query('SELECT * FROM items ORDER BY id ASC');

//     // Stream results back one row at a time
//     query.on('row', (row) => {
//       results.push(row);
//     });

//     // After all data is returned, close connection and return results
//     query.on('end', () => {
//       done();
//       return res.json(results);
//     });

//   });
// });

// READ item from list
app.get('/item/:socio_id', isLoggedIn, (req, res, next) => {
	const results = [];
	
	// Grab data from http request
	const data = {
		text: req.body.text,
		complete: false
	};

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if(err) {
			done();
			console.log(err);
			return res.status(500).json({
				success: false,
				data: err
			});
		}

		// SQL Query > Insert Data
		client.query('INSERT INTO items(text, complete) values($1, $2)',
		[data.text, data.complete]);

		// SQL Query > Select Data
		const query = client.query('SELECT * FROM items ORDER BY id ASC');

		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});

		// After all data is returned, close connection and return results
		query.on('end', () => {
			done();
			return res.json(results);
		});

	});
});

// UPDATE item from list
app.put('/item/:socio_id', isLoggedIn, (req, res, next) => {
	const results = [];
	// Grab data from the URL parameters
	const id = req.params.todo_id;
	
	// Grab data from http request
	const data = {text: req.body.text, complete: req.body.complete};

	// Get a Postgres client from the connection pool
	pg.connect(connectionString, (err, client, done) => {
		// Handle connection errors
		if(err) {
			done();
			console.log(err);
			return res.status(500).json({success: false, data: err});
		}

		// SQL Query > Update Data
		client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
		[data.text, data.complete, id]);
		
		// SQL Query > Select Data
		const query = client.query("SELECT * FROM items ORDER BY id ASC");
		
		// Stream results back one row at a time
		query.on('row', (row) => {
			results.push(row);
		});
		
		// After all data is returned, close connection and return results
		query.on('end', function() {
			done();
			return res.json(results);
		});
	});
});

// DELETE item from list
app.delete('/item/:socio_id', isLoggedIn, (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.todo_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = app


// id_item