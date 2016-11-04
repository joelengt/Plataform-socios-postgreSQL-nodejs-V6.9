

var $btn_edit_element = document.querySelector('.btn_edit_element')
var $btn_add_element_work_order = document.querySelector('#btn_add_element_work_order')

// Crear nuevo elemento para la orden de trabajo
$btn_add_element_work_order.addEventListener('click', function (element){
	var work_order_id = document.querySelector('#txt_work_order_id').value

	var type_service = document.querySelector('#txt_work_order_type').value

	$.ajax({
		method: 'post',
		url: `http://localhost:5000/plataforma/work-order/${work_order_id}/add-item/${type_service}`,
		success: function (result) {
			
			console.log(result)

			var $box_work_order_element = document.querySelector('.box_work_order_element')

			var item_service = ''

			if(result.type_service === 'poste') {
				// Insertando contenido de template a la lista 
				item_service = `<div data-id="${result.service._id}"  class="Article__read__item" >
										<div style="display: none;">
											<input type="text" value="${result.work_order._id}" id="txt_work_order_id">
											<input type="text" value="${result.type_service}" id="txt_work_order_type">
											<input type="text" value="${result.service._id}" id="txt_elemento_id">

										</div>
										<p>id: ${result.service._id}</p>
										<img src="${result.service.imagen_poste[0].path}" width="100">
										<p>type: ${result.type_service} </p>
										<a class="btn_edit_element"> Editar Elemento </a>
									</div>`

			} else if(result.type_service === 'cliente'){
				// Insertando contenido de template a la lista 
				item_service = `<div data-id="${result.service._id}"  class="Article__read__item" >
										<div style="display: none;">
											<input type="text" value="${result.work_order._id}" id="txt_work_order_id">
											<input type="text" value="${result.type_service}" id="txt_work_order_type">
											<input type="text" value="${result.service._id}" id="txt_elemento_id">

										</div>
										<p>id: ${result.service._id}</p>
										<img src="${result.service.imagen_cliente[0].path}" width="100">
										<p>type: ${result.type_service} </p>
										<a class="btn_edit_element"> Editar Elemento </a>
									</div>`

			} else {
				item_service = `<div>
									<div>
										<p>Parametro no correcto, elemento no añadido</p>
									</div>
								</div>`
			}

			


			$box_work_order_element.innerHTML += item_service


		}
	})
})

//$btn_see_detalles.addEventListener('click', GetMapItem)
var $ArticlesContainer = $('#App_Container').find('.ArticlesContainer')

// Evento editar elemento dentro de una orden de trabajo
$ArticlesContainer.on('click', 'a.btn_edit_element', function (ev) {
  let $this = $(this)
  let $article = $this.closest('.Article__read__item')
  let service_id = $article.data('id')

  var work_order_id = document.querySelector('#txt_work_order_id').value

  var type_service = document.querySelector('#txt_work_order_type').value

  console.log('Work orden')
  console.log(work_order_id)

  console.log('tipo de evento idAaa')
  console.log(type_service)

  console.log('service id')
  console.log(service_id)

  $.ajax({
  	method: 'post',
  	url: `http://localhost:5000/plataforma/work-order/${work_order_id}/edit/${type_service}/${service_id}`,
  	success: function (result) {
  		console.log('Reusltado')
  		console.log(result)

  		document.body.innerHTML = result

  	}
  
  })

})

