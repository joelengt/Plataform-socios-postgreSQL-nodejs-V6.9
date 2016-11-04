var $btn_contratista_open = document.querySelector('#btn_contratista_open')
var $btn_contratista_add = document.querySelector('#btn_contratista_add')
var $txt_contratista_add = document.querySelector('#txt_contratista_add')


// Evento btn_contratista_open: open input-contratista-add
$btn_contratista_open.addEventListener('click', function (ev) {
	$('#form_contratista_add').toggle()
})

$btn_contratista_add.addEventListener('click', SendNewContratista)

function SendNewContratista (ev) {
	// Enviar Dat
	$.ajax({	
		url: '/dashboard/usuarios/contratista-name/add',
		method: 'post',
		data: {
			contratista: $txt_contratista_add.value
		},
		success: function (result) {
			console.log(result)
			// Insertar visualmente en la lista de arriba y enviar el nuevo campo a la base de datos
			var new_contratista = `<div>
										<input type="radio", name="contratista" value="${result.contratista._id}">
										<label>${result.contratista.name}</label>
									</div>`

			$('#contratista_list').append(new_contratista)
			txt_contratista_add.value = ''
			$('#form_contratista_add').toggle()
			
		}
	})

}

