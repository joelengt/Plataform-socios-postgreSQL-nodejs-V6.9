var $btn_buscar_cliente = document.querySelector('#btn_buscar_cliente')

var type_service = 'cliente'

// Elementos del formulario
var $txt_numero_cliente = document.querySelector('#txt_numero_cliente')
var $txt_codigo_via = document.querySelector('#txt_codigo_via')
var $txt_numero_puerta = document.querySelector('#txt_numero_puerta')
var $txt_numero_interior = document.querySelector('#txt_numero_interior')
var $txt_codigo_localidad = document.querySelector('#txt_codigo_localidad')
var $txt_manzana = document.querySelector('#txt_manzana')
var $txt_lote = document.querySelector('#txt_lote')
var $txt_nombre_de_cliente = document.querySelector('#txt_nombre_de_cliente')
var $txt_type_residencial = document.querySelector('#txt_type_residencial')
var $txt_is_maximetro_bt = document.querySelector('#txt_is_maximetro_bt')
var $txt_suministro_derecha = document.querySelector('#txt_suministro_derecha')
var $txt_suministro_izquierda = document.querySelector('#txt_suministro_izquierda')
var $txt_medidor_derecha = document.querySelector('#txt_medidor_derecha')
var $txt_medidor_izquierda = document.querySelector('#txt_medidor_izquierda')
var $txt_numero_poste_cercano = document.querySelector('#txt_numero_poste_cercano')
var $txt_type_conexion = document.querySelector('#txt_type_conexion')
var $txt_type_acometida = document.querySelector('#txt_type_acometida')
var $txt_type_cable_acometida = document.querySelector('#txt_type_cable_acometida')
var $txt_calibre_cable_acometida = document.querySelector('#txt_calibre_cable_acometida')
var $txt_calibre_cable_matriz = document.querySelector('#txt_calibre_cable_matriz')
var $txt_observaciones = document.querySelector('#txt_observaciones')
var $txt_fecha_ejecucion = document.querySelector('#txt_fecha_ejecucion')
var $txt_coordenada_X = document.querySelector('#txt_coordenada_X')
var $txt_coordenada_Y = document.querySelector('#txt_coordenada_Y')


// Buscando datos de poste en la base de datos del servidor
$btn_buscar_cliente.addEventListener('click', function () {
	var $txt_cliente_id = document.querySelector('#txt_cliente_id')
	var code_service = $txt_cliente_id.value
	console.log(code_service)
	$.ajax({
		method: 'post',
		url: `http://localhost:5000/plataforma/work-order/${type_service}`,
		data: {
			code_service: code_service
		},
		success: function (result) {
			console.log(result)
			if(result.status === 'ok') {
				// Metiendo datos del poste buscado en campos del formulario
				$txt_cliente_id.value =  			  result.cliente.cliente_id,
				$txt_numero_cliente.value =    		  result.cliente.numero_cliente,
				$txt_codigo_via.value =        		  result.cliente.codigo_via,
				$txt_numero_puerta.value =     		  result.cliente.numero_puerta,
				$txt_numero_interior.value =   		  result.cliente.numero_interior,
				$txt_codigo_localidad.value =  		  result.cliente.codigo_localidad,
				$txt_manzana.value = 			      result.cliente.manzana,
				$txt_lote.value = 			          result.cliente.lote,
				$txt_nombre_de_cliente.value =        result.cliente.nombre_de_cliente,
				$txt_type_residencial.value =         result.cliente.type_residencial,
				$txt_is_maximetro_bt.value =          result.cliente.is_maximetro_bt,
				$txt_suministro_derecha.value =       result.cliente.suministro_derecha,
				$txt_suministro_izquierda.value =     result.cliente.suministro_izquierda,
				$txt_medidor_derecha.value =          result.cliente.medidor_derecha,
				$txt_medidor_izquierda.value =        result.cliente.medidor_izquierda,
				$txt_numero_poste_cercano.value =     result.cliente.numero_poste_cercano,
				$txt_type_conexion.value =            result.cliente.type_conexion,
				$txt_type_acometida.value =           result.cliente.type_acometida,
				$txt_type_cable_acometida.value =     result.cliente.type_cable_acometid,
				$txt_calibre_cable_acometida.value =  result.cliente.calibre_cable_acometida,
				$txt_calibre_cable_matriz.value =     result.cliente.calibre_cable_matriz,
				$txt_observaciones.value =            result.cliente.observaciones,
				$txt_fecha_ejecucion.value =          result.cliente.fecha_ejecucion,
				$txt_coordenada_X.value =             result.cliente.coordenada_X,
				$txt_coordenada_Y.value =             result.cliente.coordenada_Y

			} else {
				$('#msg_busqueda').append('<strong>El cliente no fue encontrado. Este es nuevo</strong>')
			}

		}
	})
})


