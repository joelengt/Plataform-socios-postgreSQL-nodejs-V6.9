var $btn_empresa_open = document.querySelector('#btn_empresa_open')
var $btn_empresa_add = document.querySelector('#btn_empresa_add')
var $txt_empresa_add = document.querySelector('#txt_empresa_add')


// Evento btn_empresa_open: open input-empresa-add
$btn_empresa_open.addEventListener('click', function (ev) {
	$('#form_empresa_add').toggle()
})

$btn_empresa_add.addEventListener('click', SendNewEmpresa)

function SendNewEmpresa (ev) {
	// Enviar Dat
	$.ajax({	
		url: '/dashboard/usuarios/empresa-cliente-name/add',
		method: 'post',
		data: {
			empresa: $txt_empresa_add.value
		},
		success: function (result) {
			console.log(result)
			// Insertar visualmente en la lista de arriba y enviar el nuevo campo a la base de datos
			var new_empresa = `<div>
									<input type="radio", name="empresa_admin" value="${result.empresa._id}">
									<label>${result.empresa.name}</label>
								</div>`

			$('#empresa_list').prepend(new_empresa)
			txt_empresa_add.value = ''
			$('#form_empresa_add').toggle()
			
		}
	})

}

