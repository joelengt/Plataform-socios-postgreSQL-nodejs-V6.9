
console.log('HA2')

var socket = io('/chat-io')

/*
var count = 0
socket.on('chat', function (content) {
	console.log('Mensaje Llego al chatRoom')
	console.log(content)
	
	var id = $('.ContentChats').find('[data-id="'+ content.chat_content_id +'"]')[0]

	console.log(id)

	count = count + 1

	console.log('chat: ' + content.chat_content_id)
	console.log(count)

})*/

// var Chatroom = document.querySelector('#chatRoom_id').value

// Ultimo mensaje
socket.on('chatListUltimaMsg', function (content) {
	console.log('ULTIMO MENSAJE')
	console.log(content)

	var data = document.querySelectorAll('.ChatItem')

	for(var s = 0; s <= data.length - 1; s++) {
		
		if(data[s].dataset.id === content.chat_room_id) {
			console.log('Va a entrar en: ' + content.chat_room_id)

			$(".ChatItem").find(".u_msg")[s].innerHTML =  content.message
			$(".ChatItem").find(".u_user_id")[s].innerHTML =  content.user_id
			$(".ChatItem").find(".u_date")[s].innerHTML =  content.date_send

			break
		}

	}
	
})

// Counter
socket.on('chatListCounter', function (content) {
	console.log('ULTIMO COUNTER ITEM')
	console.log(content)

	var data = document.querySelectorAll('.ChatItem')

	for(var e = 0; e <= data.length - 1; e++) {
		
		if(data[e].dataset.id === content.chat_room_id) {
			console.log('Va a entrar en: ' + content.chat_room_id)

			$(".ChatItem").find(".u_counter")[e].innerHTML =  content.counter
			// false --> no read
			if(content.status_read === false) {
				console.log('El lado es falso')
				$(".ChatItem")[e].style.background = '#68e29b'

			}

			break;
		}

	}
})

socket.on('counterChat', function (content) {
	console.log('Content COUNTER GENERAL')
	console.log(content)
	var $counterMax = document.querySelector('#counterMax')
	$counterMax.innerHTML = content

})

var user_id = document.querySelector('#user_id_here').value

socket.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   socket.emit('Chatroom', user_id)
})
