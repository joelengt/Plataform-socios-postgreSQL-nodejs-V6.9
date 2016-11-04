  
// console.log('HOlaaaajjjjjj')

// addEventListener('load', function () {
//   $.ajax({
//     method: 'get',
//     url: 'http://localhost:5000/dashboard/ordenes_trabajo/works_ordeners/list',
//     success: function (result) {

//       var work_orders = result.work_orders
//       // Recorriendo ordenes de trabajo
//       for(var i = 0; i <= work_orders.length - 1; i++) {
//           var item = work_orders[i]

//           // Agregando marcado al mapa

//            // Definiendo tipo de servicio
//            var template_tarjeta = ''
//            var title = ''
//            var image = ''
//            if(item.tipo_servicio === 'tipo_servicio_P') {
//              // Servicio poste
//              title = 'Poste'
//              image = '../../../../images/icon-Poste.png';
//              template_tarjeta = `<div>
//                                    <div>
//                                      <img src="${item.cover_image.path}" width="40">
//                                    </div>
//                                    <strong>Servicio: Poste</strong>
//                                    <p>codigo_orden: ${item.codigo_orden}</p>
//                                    <p>codigo_contrtista: ${item.codigo_contratista}</p>
//                                    <p>X: ${item.coordenada_X} Y: ${item.coordenada_Y}</p>
//                                </div>`
//            } else {
//              // Servicio cliente
//              title='Cliente'
//              image = '../../../../images/icon-Cliente.png';
//              template_tarjeta = `<div>
//                                    <div>
//                                      <img src="${item.cover_image.path}" width="40">
//                                    </div>
//                                    <strong>Servicio: Cliente</strong>
//                                    <p>codigo_orden: ${item.codigo_orden}</p>
//                                    <p>codigo_contrtista: ${item.codigo_contratista}</p>
//                                    <p>X: ${item.coordenada_X} Y: ${item.coordenada_Y}</p>
//                                </div>`
//            }
           
//            map.addMarker({
//              lat: Number(item.coordenada_X),
//              lng: Number(item.coordenada_Y),
//              title: title,
//              click: function(e) {
              
//                console.log('You clicked in this marker')
//                console.log(e)
            
//              },
//              infoWindow: {
//                content: template_tarjeta
//              },
//              icon: image
//           })
          
//           // Render Template de cada elemento
//           var template = `<article class="Article__read__item  box_item" data-id="${item._id}">
//                             <img src="${item.cover_image.path}" width="250">
//                             <p> codigo_orden: ${item.codigo_orden} </p>
//                             <p> tipo_servicio: ${item.tipo_servicio} </p>
//                             <p> tipo_urgencia: ${item.tipo_urgencia} </p>
//                             <p> direccion: ${item.direccion} </p>
//                             <p> public: ${item.public} </p>
//                             <p class="label label-default"> estado: ${item.estado} </p>
//                             <p> fecha_publicado: ${item.fecha_publicado} </p>
//                             <button class="btn_article_detalles btn btn-lg btn-info"> Ver Detalles </button>
//                           </article>`

//             $('.ArticlesContainer').append(template)

//       }

//       // Llamando puntos coords X,Y del tracking de usuario

//       var user_id = document.querySelector('#user_id').value

//       $.ajax({
//         method: 'get',
//         url: 'http://localhost:5000/dashboard/usuarios/tracking/' + user_id + '/draw',
//         success: function (result) {
            
//             // path = [[-12.044012922866312, -77.02470665341184], 
//             //         [-12.05449279282314, -77.03024273281858], 
//             //         [-12.055122327623378, -77.03039293652341], 
//             //         [-12.075917129727586, -77.02764635449216], 
//             //         [-12.07635776902266, -77.02792530422971], 
//             //         [-12.076819390363665, -77.02893381481931], 
//             //         [-12.088527520066453, -77.0241058385925], 
//             //         [-12.090814532191756, -77.02271108990476]];

//             // construyendo path

//              var path = []

<<<<<<< HEAD
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
=======
//             for(var g = 0; g <= result.tracking_list.track_info.length - 1; g++) {
//                 var el_coord =  result.tracking_list.track_info[g]
>>>>>>> ff5e8aebf259362ef297cae89c6394f77d888d2a
                
//                 var arr_item = [Number(el_coord.coordX), Number(el_coord.coordY)]

//                 path.push(arr_item)
//             }

//             console.log('EPIC ARRAY')
//             console.log(path)

//             map.drawPolyline({
//               path: path,
//               strokeColor: '#131540',
//               strokeOpacity: 0.6,
//               strokeWeight: 6
//             });

//         }
//       })

//     }
//   })
// })

// function initMap() {
//   map = new GMaps({
//     div: '#map',
//     zoom: 10,
//     lat: -12.043333,
//     lng: -77.028333,
//     click: function(e) {
      
//       console.log('Evento click')

//       console.log(e)
//       //$box_X.value = e.latLng.lat()
//       //$box_Y.value = e.latLng.lng()
    
//     }
//   })
// }


// map.travelRoute({
//   origin: [-12.044012922866312, -77.02470665341184],
//   destination: [-12.090814532191756, -77.02271108990476],
//   travelMode: 'driving',
//   step: function(e) {
//     $('#instructions').append('<li>'+e.instructions+'</li>');
//     $('#instructions li:eq(' + e.step_number + ')').delay(450 * e.step_number).fadeIn(200, function() {
//       map.drawPolyline({
//         path: e.path,
//         strokeColor: '#131540',
//         strokeOpacity: 0.6,
//         strokeWeight: 6
//       });
//     });
//   }
// });




