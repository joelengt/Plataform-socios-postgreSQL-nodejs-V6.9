var socket = io('http://localhost')

var $btn_see_detalles = document.querySelector('#btn_see_detalles')

console.log('HOlaaaa :DDDD')

addEventListener('load', function () {
  $.ajax({
    method: 'get',
    url: 'http://localhost:5000/dashboard/ordenes_trabajo/works_ordeners/list',
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
             image = '../images/icon-Poste.png';
             template_tarjeta = `<div>
                                   <div>
                                     <img src="${item.cover_image.path}" width="40">
                                   </div>
                                   <strong>Servicio: Poste</strong>
                                   <p>codigo_orden: ${item.codigo_orden}</p>
                                   <p>codigo_contrtista: ${item.codigo_contratista}</p>
                                   <p>X: ${item.coordenada_X} Y: ${item.coordenada_Y}</p>
                               </div>`
           } else {
             // Servicio cliente
             title='Cliente'
             image = '../images/icon-Cliente.png';
             template_tarjeta = `<div>
                                   <div>
                                     <img src="${item.cover_image.path}" width="40">
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
                            <img src="${item.cover_image.path}" width="250">
                            <p> codigo_orden: ${item.codigo_orden} </p>
                            <p> tipo_servicio: ${item.tipo_servicio} </p>
                            <p> tipo_urgencia: ${item.tipo_urgencia} </p>
                            <p> direccion: ${item.direccion} </p>
                            <p> public: ${item.public} </p>
                            <p class="label label-default"> estado: ${item.estado} </p>
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

// Evento click detalles de la orden de trabajo
$ArticlesContainer.on('click', 'button.btn_article_detalles', function (ev) {
  let $this = $(this)
  let $article = $this.closest('.Article__read__item')
  let id = $article.data('id')
  console.log('article')
  console.log(id)
  
    $.ajax({
        type: 'GET',
        url: `http://localhost:5000/dashboard/ordenes_trabajo/${id}`,
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

                  },
                  dragend: function(e) {
                      console.log('dragend');
                  }
                })

                // Definiendo tipo de servicio
                var template_tarjeta = ''
                if(result.work_order.tipo_servicio === 'tipo_servicio_P') {
                  // Servicio poste
                  template_tarjeta = `<div>
                                        <div>
                                          <img src="${result.work_order.cover_image.path}" width="40">
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
                                          <img src="${result.work_order.cover_image.path}" width="40">
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

            }

            // Render template detalles
            var item = result.work_order

            console.log('Elementos de una orden de trabajo')
            console.log(item.elementos)

            // Generando template con lista de elemento en la orden de trabajo
            var list_elements = ''
            
            for(var u = 0; u <= item.elementos.length - 1; u ++) {
                var work_order_element = item.elementos[u]

                console.log('Datos del poste insertado')
                console.log(work_order_element)

                var work_order_element_template = `<div>
                                                      <p>${work_order_element._id}</p>
                                                      <img src="${work_order_element.image_element.path}" width="50">
                                                      <p>${work_order_element.type}</p>
                                                      <form action="http://localhost:5000/dashboard/ordenes_trabajo/${item._id}/read/${work_order_element.type}/${work_order_element._id}" method="post">
                                                        <button>Ver detalles</button>
                                                      </form>
                                                  </div>`

                list_elements += work_order_element_template

            }
            
            var template = `<article class="Article__read__item  box_item" data-id="${item._id}">
                              <img src="${item.cover_image.path}" width="250">
                              <button class="btn_article_street-view btn btn-lg btn-info"> StreetView </button>
                              <p id="code_orden"> codigo_orden: ${item.codigo_orden} </p>
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
                              <div>
                                <h3>Elemento de la Orden de trabajo</h3>
                                <div>
                                 ${list_elements}
                                </div>
                              </div>
                              <div>
                                <form action="/dashboard/ordenes_trabajo/edit/${item._id}", method="post">
                                  <button class="btn_article_edit btn btn-lg btn-primary"> Editar </button>
                                </form>
                                <form action="/dashboard/ordenes_trabajo/${item._id}/change-status/cancelado", method="post">
                                  <button class="btn_article_edit btn btn-lg btn-danger"> Cancelar </button>
                                </form>
                              </div>
                              <div>
                            </article>`

              $('.ArticlesContainer').html(template)

        }
    })


})


$ArticlesContainer.on('click','button.btn_article_street-view', function (ev) {
  let $this = $(this)
  let $article = $this.closest('.Article__read__item')
  let id = $article.data('id')
  console.log('article')
  console.log(id)
  $.ajax({
     type: 'GET',
     url: `http://localhost:5000/dashboard/ordenes_trabajo/${id}`,
     success: function (result) {
         // Mostrando mapa de ubicación
         console.log(result.work_order)
         var item = result.work_order
         
         document.querySelector('#streetview').classList.add('streetview')

         panorama = GMaps.createPanorama({
           el: '#streetview',
           lat : item.coordenada_X,
           lng : item.coordenada_Y,
           dragend: function(e) {
               console.log('dragend')
           }
         })

      }
  })
})

// Buscando elemento de servicio
$ArticlesContainer.on('click','button.btn_article_service_details', function (ev) {
    let $this = $(this)
    let $article = $this.closest('.Article__read__item')
    let id = $article.data('id')
    console.log(id)

    // Consultando la orden de trabajopor id de item
    $.ajax({
        type: 'GET',
        url:`http://localhost:5000/dashboard/ordenes_trabajo/${id}`,
        success: function (result) {
          console.log(result.work_order)
          var item = result.work_order
          var type_service = ''

          console.log('orden de trabajo')
          
          console.log(item)
          // consultando busqueda por servicio
          if(item.tipo_servicio === 'tipo_servicio_P') {
            type_service = 'poste'
            

          } else if(item.tipo_servicio === 'tipo_servicio_C') {
            type_service = 'cliente'
            

          } else {
            console.log('Error en el parametro ingresado')
            type_service = 'not_found'
          }

          // Buscando detalles del servicio por esta orden de trabajo
          $.ajax({
            type: 'POST',
            url: `http://localhost:5000/dashboard/ordenes_trabajo/buscar/${type_service}`,
            data: {
              code_work_order: item.codigo_orden
            },
            success: function (result_type_service) {
              console.log('resultado de consulta')
              if(result_type_service.status === 'ok') {

                // Validando el tipo de servicio para template a usar
                  var template_serviec_info

                  console.log('service')
                  console.log(result_type_service)
                  
                if(result_type_service.type === 'poste') {
                  var item = result_type_service.service
                  console.log('POSTE')
                  // Template para el servicio de poste
                  template_serviec_info = `<article class="Article__read__item  box_item" data-id="${item._id}">
                                            <h2> Datos del Poste</h2>
                                            <p> codigo_orden_trabajo: ${item.codigo_poste} </p>
                                            <p> codigo_orden_trabajo: ${item.codigo_orden_trabajo}  </p>
                                            <p> type_poste: ${item.type_poste} </p>
                                            <p> altura_poste: ${item.altura_poste} </p>
                                            <p> type_material: ${item.type_material} </p>
                                            <p> type_pastoral: ${item.type_pastoral} </p>
                                            <p> type_luminaria: ${item.type_luminaria} </p>
                                            <p> type_lampara: ${item.type_lampara} </p>
                                            <p> coordenada_X: ${item.coordenada_X} </p>
                                            <p> coordenada_Y: ${item.coordenada_Y} </p>
                                            <p> imagen_poste: ${item.imagen_poste} </p>
                                            <p> observaciones: ${item.observaciones} </p>
                                            <p> estado_poste: ${item.estado_poste} </p>
                                            <p> estado_pastoral: ${item.estado_pastoral} </p>
                                            <p> estado_luminaria: ${item.estado_luminaria} </p>
                                            <p> estado_lampara: ${item.estado_lampara} </p>
                                            <form action="/dashboard/ordenes_trabajo/edit/poste/${item._id}", method="post">
                                              <button class="btn_article_edit btn btn-lg btn-primary"> Editar </button>
                                            </form>
                                          </article>`

                } else if(result_type_service.type === 'cliente') {
                  var item = result_type_service.service
                  console.log('Cliente')

                  // Template para el servicio de cliente
                  template_serviec_info  = `<article class="Article__read__item  box_item" data-id="${item._id}">
                                            <h2> Datos del Cliente</h2>
                                            <p> cliente_id: ${item.cliente_id} </p>
                                            <p> codigo_orden_trabajo: ${item.codigo_orden_trabajo} </p>
                                            <p> numero_cliente: ${item.numero_cliente} </p>
                                            <p> codigo_via: ${item.codigo_via} </p>
                                            <p> numero_puerta: ${item.numero_puerta} </p>
                                            <p> numero_interior: ${item.numero_interior} </p>
                                            <p> codigo_localidad: ${item.codigo_localidad} </p>
                                            <p> manzana: ${item.manzana} </p>
                                            <p> lote: ${item.lote} </p>
                                            <p> nombre_de_cliente: ${item.nombre_de_cliente} </p>
                                            <p> type_residencial: ${item.type_residencial} </p>
                                            <p> is_maximetro_bt: ${item.is_maximetro_bt} </p>
                                            <p> suministro_derecha: ${item.suministro_derecha} </p>
                                            <p> suministro_izquierda: ${item.suministro_izquierda} </p>
                                            <p> medidor_derecha: ${item.medidor_derecha} </p>
                                            <p> medidor_izquierda: ${item.medidor_izquierda} </p>
                                            <p> numero_poste_cercano: ${item.numero_poste_cercano} </p>
                                            <p> type_conexion: ${item.type_conexion} </p>
                                            <p> type_acometida: ${item.type_acometida} </p>
                                            <p> type_cable_acometida: ${item.type_cable_acometida} </p>
                                            <p> calibre_cable_acometida: ${item.calibre_cable_acometida} </p>
                                            <p> calibre_cable_matriz: ${item.calibre_cable_matriz} </p>
                                            <p> observaciones: ${item.observaciones} </p>
                                            <p> fecha_ejecucion: ${item.fecha_ejecucion} </p>
                                            <div> croquis: 
                                                  <img src="${item.croquis}", width="80">
                                            </div>
                                            <p> coordenada_X: ${item.coordenada_X} </p>
                                            <p> coordenada_Y: ${item.coordenada_Y} </p>
                                            <form action="/dashboard/ordenes_trabajo/edit/cliente/${item._id}", method="post">
                                              <button class="btn_article_edit btn btn-lg btn-primary"> Editar </button>
                                            </form>
                                          </article>`

                } else {
                  template_serviec_info = `<article>El tipo de servicio solicitado, no coincide con la data enviada</article>`
                
                }

                console.log('item')
                console.log(item)

                console.log(result_type_service)

                // Render de la vista de segun el tipo de servicio
                $('.ArticlesContainer').html(template_serviec_info)

              } else {
                console.log('Esta orden de trabajo no tiene datos del servicio asignado')
                
              }

            }
          })

        }
    })
})

var path = []
var markadors = []

socket.on('Track_users', function (content) {
  console.log('Posicion de usuarios')
  console.log(content)

  title='Ericson Quispe'
  image = '../../../../images/tracking/icon_user2x.png';
  template_tarjeta = `<div>
                        <div>
                          <img src="../../../../images/avatar_defect.png" width="40">
                        </div>
                        <strong>Ericson Quispe ${content.user_id}</strong>
                        <p>Contratista: 57a981d33f368bc90cca2abe</p>
                        <p>Supervisor: 57aad49a372ffd7227c7c73f</p>
                        <p> Empresa: Astrum</p>
                        <p>X: ${content.coordX} Y: ${content.coordY}</p>
                    </div>`

   // Quitar Marcador de la ultima posicion de este usuario
   // map.removeMarkers()

  // map.setValues({type: "point", id: content.user_id})

  var mark = {
    lat: content.coordX,
    lng: content.coordY,
    title: content.user_id,
    click: function(e) {
      console.log('you clicked in this marker')
      console.log(e)
    },
    infoWindow: {
      content: template_tarjeta
    },
    icon: image,
    identificador: content.user_id
  }

  map.addMarker(mark)

})
