
console.log('Datos lectura')

var socket = io('/tracking-io')

// Datos para enviar por publicación
var $user_id = document.querySelector('#user_id').value
var num = 0

// Evento ciclico de envio de coordenadas: tracking
var intervalo = setInterval('GoInterval()', 4000)

var valor = 0 

function GoInterval() { 
	valor += 1
	
	if(valor === 20){ 
		clearInterval(intervalo)
	
	} else { 
		
		console.log('Iteracion: ' + valor)
				
		// Opteniendo coordenadas de geolocalizacion
		
		var geo = navigator.geolocation

		function geo_ok(position) {
			// console.log(position)
			var lat = position.coords.latitude
			var lon = position.coords.longitude

			// Asignando data a json
			var message_data = {
				user_id: $user_id,
				date: 	 new Date(),
				coordX:  lat,
				coordY:  lon
			}

			console.log(`Coordenada del usuario: ${message_data.user_id}. Fecha: ${message_data.date}. Coordenadas: X: ${message_data.coordX} , Y: ${message_data.coordY}`)

			// Enviando posicion X, Y al servidor
			socket.emit('Track_one_user', message_data)

		}

		function geo_error() {
			console.log('Not Found your position')
		}

		var options = []

		geo.getCurrentPosition(geo_ok, geo_error, options)

	}
}

socket.on('Track_one_user', function (content) {
	console.log('Mensaje de respuesta')
	console.log(content)
})

var trackRoom = document.querySelector('#user_id').value

socket.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   socket.emit('TrackRoom', trackRoom)
})


