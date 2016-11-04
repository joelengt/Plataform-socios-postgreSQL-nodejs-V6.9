console.log('AAA')

var $btn_buscar_poste = document.querySelector('#btn_buscar_poste')

var $txt_type_poste = document.querySelector('#txt_type_poste')
var $txt_altura_poste = document.querySelector('#txt_altura_poste')
var $txt_type_material = document.querySelector('#txt_type_material')
var $txt_type_pastoral = document.querySelector('#txt_type_pastoral')
var $txt_type_luminaria = document.querySelector('#txt_type_luminaria')
var $txt_type_lampara = document.querySelector('#txt_type_lampara')
var $txt_coordenada_X = document.querySelector('#txt_coordenada_X')
var $txt_coordenada_Y = document.querySelector('#txt_coordenada_Y')
var $txt_observaciones = document.querySelector('#txt_observaciones')
var $txt_estado_poste = document.querySelector('#txt_estado_poste')
var $txt_estado_pastoral = document.querySelector('#txt_estado_pastoral')
var $txt_estado_luminaria = document.querySelector('#txt_estado_luminaria')
var $txt_estado_lampara = document.querySelector('#txt_estado_lampara')

var type_service = 'poste'

// Buscando datos de poste en la base de datos del servidor
$btn_buscar_poste.addEventListener('click', function () {
	var $txt_codigo_poste = document.querySelector('#txt_codigo_poste')
	var code_service = $txt_codigo_poste.value
	console.log(code_service)

	$.ajax({
		type: 'post',
		url: `http://localhost:5000/dashboard/ordenes_trabajo/${type_service}`,
		data: {
			code_service: code_service
		},
		success: function (result) {
			if(result.status === 'ok') {

				console.log(result.poste)
				$txt_codigo_poste.value = result.poste.codigo_poste,
				$txt_type_poste.value = result.poste.type_poste,
				$txt_altura_poste.value = result.poste.altura_poste,
				$txt_type_material.value = result.poste.type_material,
				$txt_type_pastoral.value = result.poste.type_pastoral,
				$txt_type_luminaria.value = result.poste.type_luminaria,
				$txt_type_lampara.value = result.poste.type_lampara,
				$txt_coordenada_X.value = result.poste.coordenada_X,
				$txt_coordenada_Y.value = result.poste.coordenada_Y,
				$txt_observaciones.value = result.poste.observaciones,
				$txt_estado_poste.value = result.poste.estado_poste,
				$txt_estado_pastoral.value = result.poste.estado_pastoral,
				$txt_estado_luminaria.value = result.poste.estado_luminaria,
				$txt_estado_lampara.value = result.poste.estado_lampara
			} else {
				$('#msg_busqueda').append('<strong>El poste no fue encontrado. Este poste es nuevo</strong>')
			}
		}
	})
})