console.log('CARGO EL ELEMTO!!!!')
var socketConnect = io('/connect-io')

var user_id_connect = document.querySelector('#user_id_here')
var dataList = document.querySelectorAll('.UserItem')

socketConnect.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   console.log('Usuario Conectado CLIENTE se CONECTECTO!!!!>>>>>>')
   socketConnect.emit('adduser', user_id_connect.value)
})

socketConnect.on('user status on', function (content) {

	//var point_status_connect = document.querySelector('')

	//if(content.type === 'connected') {

	for(var s = 0; s <= dataList.length - 1; s++) {
		console.log('Iteracion: ' + s)
		console.log('Datos del otro: ' + dataList[s].dataset.id)

		console.log(content.user)

		if(dataList[s].dataset.id === content.user) {
			console.log('VA A ENTRAR!!! >>>>>>>: ' + content.user)

			$(".UserItem").find(".card_id")[s].style.color = "#68e29b"
			console.log('USUARIO CONECTADO RESPUESTA SERVER!!! <<<<<<' +  content.type)
			console.log(content)

			break
		}

	}
	
	//}
})


socketConnect.on('user status off', function (content) {

	for(var s = 0; s <= dataList.length - 1; s++) {
		console.log('Iteracion: ' + s)
		console.log('Datos del otro: ' + dataList[s].dataset.id)

		console.log(content.user)

		if(dataList[s].dataset.id === content.user) {
			console.log('VA A ENTRAR!!! >>>>>>>: ' + content.user)

			$(".UserItem").find(".card_id")[s].style.color = "gray"
			console.log('USUARIO CONECTADO RESPUESTA SERVER!!! <<<<<<' +  content.type)
			console.log(content)

			break
		}

	}

})

