
console.log('Js admin')

var socket = io('/tracking-io')

// Datos para enviar por publicación
var $user_id = document.querySelector('#user_id').value

console.log('HOlaaaajjjjjj')

addEventListener('load', function () {
  $.ajax({
    method: 'get',
    url: 'http://localhost:5000/dashboard/ordenes_trabajo/works_ordeners/list', // Cambiar URI por busqueda de filtro
    // url: 'http://localhost:5000/dashboard/ordenes_trabajo/dynamic-filter/true/all/all',
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
             image = '../../../../images/icon-Poste.png';
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
             image = '../../../../images/icon-Cliente.png';

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

      // Llamando puntos coords X,Y del tracking de usuario

      var user_id = document.querySelector('#user_id').value

      $.ajax({
        method: 'get',
        url: 'http://localhost:5000/dashboard/usuarios/tracking/' + user_id + '/draw',
        success: function (result) {
            
            // construyendo path

            var path = []

            for(var g = 0; g <= result.tracking_list.track_info.length - 1; g++) {
                var el_coord =  result.tracking_list.track_info[g]
                
                var arr_item = [Number(el_coord.coordX), Number(el_coord.coordY), el_coord.date]

                path.push(arr_item)
            }

            console.log('EPIC ARRAY')
            console.log(path)

            map.drawPolyline({
              path: path,
              strokeColor: '#22b573',
              strokeOpacity: 0.6,
              strokeWeight: 6
            });            

            var coordPathStartX = path[0][0]
            var coordPathStartY = path[0][1]

            // Marcador de la primera posicion
            map.addMarker({
              lat: coordPathStartX,
              lng: coordPathStartY,
              title: 'Inicio',
              click: function(e) {
                 
               console.log('You clicked in this marker')
               console.log(e)
               
              },
                icon: '../../../../images/tracking/41. icon_tracking_partida.png'
            })


             var coordPathX = path[path.length - 1][0]
             var coordPathY = path[path.length - 1][1]

             // Definiendo tipo de servicio
             var template_tarjeta = ''
             var title = ''
             var image = ''
             
             title='Ericson Quispe'
             image = '../../../../images/tracking/icon_tracking_user_inactive2x.png';
             template_tarjeta = `<div>
                                   <div>
                                     <img src="../../../../images/avatar_defect.png" width="40">
                                   </div>
                                   <strong>Ericson Quispe</strong>
                                   <p>Contratista: 57a981d33f368bc90cca2abe</p>
                                   <p>Supervisor: 57aad49a372ffd7227c7c73f</p>
                                   <p> Empresa: Astrum</p>
                                   <p>X: ${coordPathX} Y: ${coordPathY}</p>
                                   <p> Fecha: ${path[path.length - 1][2]}</p>
                               </div>`

             // Marcador de la ultima posicion
            map.addMarker({
               lat: coordPathX,
               lng: coordPathY,
               title: 'Ultima posicion',
               click: function(e) {
                
                 console.log('You clicked in this marker')
                 console.log(e)
              
               },
               infoWindow: {
                 content: template_tarjeta
               },
               icon: image
            })
       
        }
      })

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

var path = []
var coordPathStart1X
var coordPathStart1Y

socket.on('Track_one_user', function (content) {
	console.log('Posicion de usuarios')
	console.log(content)

  title='Ericson Quispe'
  image = '../../../../images/tracking/icon_user2x.png';
  template_tarjeta = `<div>
                        <div>
                          <img src="../../../../images/avatar_defect.png" width="40">
                        </div>
                        <strong>Ericson Quispe</strong>
                        <p>Contratista: 57a981d33f368bc90cca2abe</p>
                        <p>Supervisor: 57aad49a372ffd7227c7c73f</p>
                        <p> Empresa: Astrum</p>
                        <p>X: ${content.coordX} Y: ${content.coordY}</p>
                    </div>`

   // Marcador de la ultima posicion
  map.removeMarkers()

  map.addMarker({
    lat: content.coordX,
    lng: content.coordY,
    title: 'Ultima posicion',
    click: function(e) {      
      console.log('You clicked in this marker')
      console.log(e)
    },
    infoWindow: {
      content: template_tarjeta
    },
     icon: image
  })

    // Contruyendo coordenadas del tecking de usuario
    
  if(path.length >= 0 && path.length <= 1) {
    console.log('+1: ' + path.length)
    // var el_coord =  result.tracking_list.track_info[g]    
    var arr_item = [Number(content.coordX), Number(content.coordY)]

    path.push(arr_item)

  } else {
    path.push([Number(content.coordX), Number(content.coordY)])

    console.log('dibujo')
    // Dibujando el recorrido
    map.drawPolyline({
      path: path,
      strokeColor: '#22b573',
      strokeOpacity: 0.6,
      strokeWeight: 6
    }); 

    // Reseteando 
    path = []
    path.push([Number(content.coordX), Number(content.coordY)])
  }
})

var trackRoom = document.querySelector('#user_id').value

socket.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   socket.emit('TrackRoom', trackRoom)
})

