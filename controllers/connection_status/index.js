var ChatsList = require('../../models/chat')
var Users = require('../../models/usuarios')

var config = require('../../config')

var users = [];
var numUsers = 0;

function Connect_user (io) {

	//io.adapter(redis({ host: 'localhost', port: 6379 }))

	//Connetion de todos los sockets
	var connectio = io.of('/connect-io')

	connectio.on('connection', function (socket) {
		console.log(`El usuario ${socket.id} se conecto a /connect-io - OnlineOffRoom`)

		var addedUser = false;

		socket.on('adduser', function (user_id) {
			if (addedUser) return;
			console.log('ANIADIENDO USUAIO A LA LISTA desde el CLIENTE!!')

			var encontrado = false

			// Consultando si esta dentro del array
			for(var g = 0; g <= users.length - 1; g++) {
				var el_user = users[g]

				// Validando coincidencia del usuario dentro del array
				if(user_id === el_user) {
					encontrado = true
					console.log('El usuario ya esta online >>>>>')
					break;
				}

			}

			// El usuario no fue encontrado en el array
			if(encontrado === false) {
				// Se agrega nuevo usuario a la lista de conectados
		    	users.push(user_id)

    			socket.user_id = user_id;

    			++numUsers;
    			addedUser = true;

    			var msg1 = {
    				type: 'connected',
    				cant: numUsers,
    				user: socket.user_id
    			}

    			// Emitiendo usuario Login
    			connectio.emit('user status on', msg1);

    			Users.findById({'_id': user_id}, function (err, user_to_connect) {
    				if(err) {
    					return console.log('Error al conectar usuario: ' + err)
    				}

    				user_to_connect.status_connect = true

    				user_to_connect.save(function (err) {
    					if(err) {
    						return console.log('Error al guardar usuario, como conectado: ' + err)
    						console.log('Usuario CONECTADO en la base de datos ><<<<<<<')
    					}
    				})

    			})

			} else {
				console.log('El usuario ya esta connectado Online')
			}

		});

	    socket.on('disconnect', function () {
	    	if(addedUser) {

		    	console.log('>>>>>>>> el usuario ' + socket.user_id + ' se va a desconectar!!')

		    	var encontrado2 = false

		    	// Consultando si esta dentro del array
		    	for(var g = 0; g <= users.length - 1; g++) {
		    		var el_user = users[g]

		    		// Validando coincidencia del usuario dentro del array
		    		if(socket.user_id === el_user) {
		    			encontrado2 = true

						users.splice(g,1)

		    			console.log('El usuario ya se desconecto!!! >>>>>')
		    			break;
		    		}

		    	}

		    	if(encontrado2 === true) {

		    		Users.findById({'_id': socket.user_id}, function (err, user_to_connect) {
		    			if(err) {
		    				return console.log('Error al conectar usuario: ' + err)
		    			}

		    			console.log('Usuario ENCONTRADO PARA DESCONECTAR')

		    			user_to_connect.status_connect = false

		    			user_to_connect.save(function (err) {
		    				if(err) {
		    					return console.log('Error al guardar usuario, como conectado: ' + err)
		    					console.log('Usuario DESCONECTADO en la base de datos ><<<<<<<')
		    				}
		    			})

		    		})

		    		--numUsers;
		    		
		    		var msg1 = {
		    			type: 'disconnected',
		    			cant: numUsers,
		    			user: socket.user_id
		    		}

		    		// echo globally that this client has left
		    		connectio.emit('user status off', msg1);

		    	} else {
		    		console.log('Error en desconectar el usuario ' + socket.user_id + ' sigue conectado')
		    	}



	    	}
	  
	    });


	})

}

module.exports = Connect_user
