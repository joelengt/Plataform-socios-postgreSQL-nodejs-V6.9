
var $btn_see_detalles = document.querySelector('#btn_see_detalles')

console.log('HOlaaaa')

addEventListener('load', function () {
  $.ajax({
    method: 'get',
    url: 'http://localhost:5000/plataforma/work-order/list',
    success: function (result) {

      var work_orders = result.work_orders
      
      // Recorriendo ordenes de trabajo
      for(var i = 0; i <= work_orders.length - 1; i++) {
          var item = work_orders[i]

          // Agregando marcado al mapa

           // Definiendo tipo de servicio
           var template_tarjeta = ''
           var title = ''
           var image = ''
           if(item.tipo_servicio === 'tipo_servicio_P') {
             // Servicio poste
             title = 'Poste'
             image = '../../images/icon-Poste.png'
             template_tarjeta = `<div>
                                   <div>
                                     <img src="../../images/2016-07-07 20-09-58.png" width="40">
                                   </div>
                                   <strong>Servicio: Poste</strong>
                                   <p>codigo_orden: ${item.codigo_orden}</p>
                                   <p>codigo_contrtista: ${item.codigo_contratista}</p>
                                   <p>X: ${item.coordenada_X} Y: ${item.coordenada_Y}</p>
                               </div>`
           } else {
             // Servicio cliente
             title= 'Cliente'
             image = '../../images/icon-Cliente.png'
             template_tarjeta = `<div>
                                   <div>
                                     <img src="../../images/2016-07-07 20-09-58.png" width="40">
                                   </div>
                                   <strong>Servicio: Cliente</strong>
                                   <p>codigo_orden: ${item.codigo_orden}</p>
                                   <p>codigo_contrtista: ${item.codigo_contratista}</p>
                                   <p>X: ${item.coordenada_X} Y: ${item.coordenada_Y}</p>
                               </div>`
           }

           map.addMarker({
             lat: Number(item.coordenada_X),
             lng: Number(item.coordenada_Y),
             title: title,
             click: function(e) {
              
               console.log('You clicked in this marker')
               console.log(e)
            
             },
             infoWindow: {
               content: template_tarjeta
             },
             icon: image
          })

          // Render Template de cada elemento
          var template = `<article class="Article__read__item  box_item" data-id="${item._id}">
                            <img src="../../images/2016-07-07 20-09-58.png" width="250">
                            <p> codigo_orden: ${item.codigo_orden} </p>
                            <p> tipo_servicio: ${item.tipo_servicio} </p>
                            <p> tipo_urgencia: ${item.tipo_urgencia} </p>
                            <p> direccion: ${item.direccion} </p>
                            <p> public: ${item.public} </p>
                            <p> estado: ${item.estado} </p>
                            <p> fecha_publicado: ${item.fecha_publicado} </p>
                            <button class="btn_article_detalles btn btn-lg btn-info"> Ver Detalles </button>
                          </article>`

            $('.ArticlesContainer').append(template)

      }

    }
  })
})

function initMap() {
  map = new GMaps({
    div: '#map',
    zoom: 10,
    lat: -12.043333,
    lng: -77.028333,
    click: function(e) {
      
      console.log('Evento click')

      console.log(e)
      //$box_X.value = e.latLng.lat()
      //$box_Y.value = e.latLng.lng()
    
    }
  })
}

//$btn_see_detalles.addEventListener('click', GetMapItem)
var $ArticlesContainer = $('#App_Container').find('.ArticlesContainer')

// Evento click btn_Like
$ArticlesContainer.on('click', 'button.btn_article_detalles', function (ev) {
  let $this = $(this)
  let $article = $this.closest('.Article__read__item')
  let id = $article.data('id')
  console.log('article')
  console.log(id)
  

    $.ajax({
        type: 'GET',
        url: `http://localhost:5000/plataforma/work-order/${id}`,
        success: function (result) {
            // Mostrando mapa de ubicación
            console.log(result.work_order)

            Wo()

            function Wo() {
                console.log('Ha')
                console.log(result.work_order.coordenada_X)
                console.log(result.work_order.coordenada_Y)

                map = new GMaps({
                  div: '#map',
                  zoom: 16,
                  lat: Number(result.work_order.coordenada_X),
                  lng: Number(result.work_order.coordenada_Y),
                  click: function(e) {
                    
                    console.log('Evento click')

                    console.log(e)

                  }
                })

                // Definiendo tipo de servicio
                var template_tarjeta = ''
                if(result.work_order.tipo_servicio === 'tipo_servicio_P') {
                  // Servicio poste
                  template_tarjeta = `<div>
                                        <div>
                                          <img src="../../images/2016-07-07 20-09-58.png" width="40">
                                        </div>
                                        <strong>Servicio: Poste</strong>
                                        <p>codigo_orden: ${result.work_order.codigo_orden}</p>
                                        <p>codigo_contrtista: ${result.work_order.codigo_contratista}</p>
                                        <p>X: ${result.work_order.coordenada_X} Y: ${result.work_order.coordenada_Y}</p>
                                    </div>`
                } else {
                  // Servicio cliente
                  template_tarjeta = `<div>
                                        <div>
                                          <img src="../../images/2016-07-07 20-09-58.png" width="40">
                                        </div>
                                        <strong>Servicio: Cliente</strong>
                                        <p>codigo_orden: ${result.work_order.codigo_orden}</p>
                                        <p>codigo_contrtista: ${result.work_order.codigo_contratista}</p>
                                        <p>X: ${result.work_order.coordenada_X} Y: ${result.work_order.coordenada_Y}</p>
                                    </div>`
                }

                // añadiendo marcador en la poscion
                map.addMarker({
                  lat: Number(result.work_order.coordenada_X),
                  lng: Number(result.work_order.coordenada_Y),
                  title: 'Here',
                  click: function(e) {
                   
                    console.log('You clicked in this marker')
                    console.log(e)
                 
                  },
                  infoWindow: {
                    content: template_tarjeta
                  }
               })


                // Render template detalles
                var item = result.work_order
                var template = `<article class="Article__read__item  box_item" data-id="${item._id}">
                                  <img src="../../images/2016-07-07 20-09-58.png" width="250">
                                  <p> codigo_orden: ${item.codigo_orden} </p>
                                  <p> codigo_supervisor: ${item.codigo_supervisor}  </p>
                                  <p> codigo_contratista: ${item.codigo_contratista} </p>
                                  <p> tipo_servicio: ${item.tipo_servicio} </p>
                                  <p> detalle_servicio: ${item.detalle_servicio} </p>
                                  <p> tipo_urgencia: ${item.tipo_urgencia} </p>
                                  <p> coordenada_X: ${item.coordenada_X} </p>
                                  <p> coordenada_Y: ${item.coordenada_Y} </p>
                                  <p> direccion: ${item.direccion} </p>
                                  <p> descripcion: ${item.descripcion} </p>
                                  <p> public: ${item.public} </p>
                                  <p class="label label-default"> estado: ${item.estado} </p>
                                  <p> conclusiones: ${item.conclusiones} </p>
                                  <p> fecha_publicado: ${item.fecha_publicado} </p>
                                  <p> fecha_visita_esperada: ${item.fecha_visita_esperada} </p>
                                  <p> fecha_trabajo_realizado: ${item.fecha_trabajo_realizado} </p>
                                  <p> reprogramado_de: ${item.reprogramado_de} </p>
                                  <button class="btn_article_street-view btn btn-lg btn-info"> StreetView </button>
                                </article>`

                  $('.ArticlesContainer').html(template)

            }

        }
    })


})



