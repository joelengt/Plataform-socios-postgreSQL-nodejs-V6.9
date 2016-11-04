
var socket = io('http://localhost')

var $btn_see_detalles = document.querySelector('#btn_see_detalles')

console.log('HOlaaaa**')

var map 
var markers = []


// CARGA DE MARKER DE ORDENES DE TRABAJO
addEventListener('load', function () {
  $.ajax({
    method: 'get',
    url: '/dashboard/ordenes_trabajo/works_ordeners/list',
    success: function (result) {

      var infowindow = null;

      var work_orders = result.work_orders
      
      // Recorriendo ordenes de trabajo
      for(var i = 0; i <= work_orders.length - 1; i++) {
        var item = work_orders[i]

        var infowindow = null;

        // Agregando marcado al mapa

        // Definiendo tipo de servicio
        var template_tarjeta = ''
        var title = ''
        var image = ''

        if(item.tipo_servicio === 'tipo_servicio_P') {
           
          // Servicio poste
          title = 'Poste'
          image = '../../images/icon-Poste.png';
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
          image = '../../images/icon-Cliente.png'
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


        var myLatLng = {lat: Number(item.coordenada_X), lng:  Number(item.coordenada_Y)};

        var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: title,
          icon: image
        })

        addInfoWindow(marker, template_tarjeta)

        marker.setMap(map)
        markers.push(marker)
      }

      function addInfoWindow(marker1, message) {
        var infoWindow = new google.maps.InfoWindow({
            content: message
        });

        google.maps.event.addListener(marker1, 'click', function () {
            // marker1.infowindow.close()
            infoWindow.open(map, marker1);
        });

      }   

    }
  })
})

function StartKmlDrive() {

  // Obteniendo archivos KML subidos en google drive
  $.ajax({
    method: 'get',
    url: '/dashboard/viewer-kml/list',
    success: function (result) {


      console.log('Lista de KML en google drive')
      console.log(result.kml_files)
      
      var arr = result.kml_files
      
      console.log('ARREGLO KML DE DRIVE JOEEELLLLL')
      console.log(arr)

      for(var i = 0; i <= arr.length - 2; i++) {
        var el = arr[i]
        // Insertando archivo kml en lista
        var template_kml_file_item = `<div class="Box_item_kml" data-id="${el.id}" style="border-top: 1px solid black; border-bottom: 1px solid black;">
                                          <div>
                                            <div>
                                              <a href="${el.path}">
                                               <strong>${i}) ${el.name}</strong>
                                              </a>
                                            </div>
                                            <div>
                                              <label>On/Off</label>
                                              <input type="checkbox" value="${el.id}" class="kml_check" data-id="${i}" checked>
                                            </div>
                                          </div>
                                          <div>
                                            <button class="kml_delete" data-id="${i}">Eliminar</button>
                                            <div> 
                                              <input type="file" data-up="${el.id}" class="file_up" name="file_kml_patch" value="Actualizar kml">
                                              <button class="kml_update" data-id="${i}">Actualizar</button>
                                            </div>
                                          </div>
                                      </div>`

        $('.ArticlesContainer').append(template_kml_file_item)

        // Insertando archivo kml el el mapa  
        loadKmlLayer(arr[i].path, map)
      }


    }
  })

}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: new google.maps.LatLng(-19.257753, 146.823688),
      zoom: 2
  })

  StartKmlDrive()

}

// Evento click: Habiliar macadors o no
document.addEventListener("DOMContentLoaded", function (event) {
    
    // Selector listener clic to marker 
    var _selector = document.querySelector('input[name=myCheckbox]');
    _selector.addEventListener('change', function (event) {
        if (_selector.checked) {
            // do something if checked
            showMarkers() 
        } else {
            // do something else otherwise
            clearMarkers()
        }
    })
})

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var r = 0; r < markers.length; r++) {
    markers[r].setMap(map)
  }

}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  
  setMapOnAll(null)

}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map)

}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers()
  markers = []

}

var KmlCappas = []  
function loadKmlLayer(src, map) {
   var kmlLayer = new google.maps.KmlLayer(src, {
     suppressInfoWindows: true,
     preserveViewport: false,
     map: map
   });

   // google.maps.event.addListener(kmlLayer, 'click', function(event) {
   //   var content = event.featureData.infoWindowHtml;
   //   var testimonial = document.getElementById('capture');
   //   testimonial.innerHTML = content;
   // });

   // Añadiendo arreglo
   kmlLayer.setMap(map)
   KmlCappas.push(kmlLayer) 

}

//$btn_see_detalles.addEventListener('click', GetMapItem)
var $ArticlesContainer = $('#App_Container').find('.ArticlesContainer')

// Evento Subir - upload a new file to server
$('#FormMsg').submit(function () {

    var fd = new FormData($(this)[0]);
    fd.append('file', $('#file')[0].files[0])
    
    // Inicia el Loader
    console.log('Subiendo....')
  
    $.ajax({
       url : 'http://localhost:5000/dashboard/viewer-kml/new-file-kml',
       type : 'POST',
       data : fd,
       async: false,
       cache: false,
       contentType: false,
       enctype: 'multipart/form-data',
       processData: false,
       success : function(data) {

          // Archivo subido
          if(data) {
              console.log('Archivo subido')

              console.log('Repsueas del sevdor')
              console.log('Archivo Cargado')
              console.log(data)

              console.log('Cargando Lectura ...')
              
              setTimeout(function(){
                console.log('Recargando todo')
                  $('.ArticlesContainer')[0].innerHTML = ''
                  StartKmlDrive()
              }, 3000)

          }
           
       }
    })

    return false;

})

// Evento Update - upload a new file to replace the file on the server
$ArticlesContainer.on('click', 'button.kml_update', function (ev) {
  
  let $this = $(this)
  let $article = $this.closest('.Box_item_kml')
  let id = $article.data('id')
  
  var file_to_up = $article.find('.file_up')
  var file_to_upload = file_to_up[0].files[0]

  var fd = new FormData($(this)[0])
  fd.append('file2', file_to_upload)

  // Inicia el Loaders
  console.log('Subiendo Actualziación 11111111111 .......')

    $.ajax({
        url: `http://localhost:5000/dashboard/viewer-kml/updated-file-kml/${id}?_method=put`,
        type: 'POST',
        data : fd,
        async: false,
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function(data) {

          // Archivo subido
          if(data) {
            console.log('Archivo subido aaaHHHHHHHH')
            console.log('Repsueas del servidor')
            console.log('Archivo Cargado')
            console.log(data)
          }

      }
   })

  return false;

})

// Evento Delete - Select a file to delete
$ArticlesContainer.on('click', 'button.kml_delete', function (ev) {

  let $this = $(this)
  let $article = $this.closest('.Box_item_kml')
  let id = $article.data('id')
  console.log('Tocado')
  console.log(id)

  // Inicia el Loader
  $article[0].style.display = 'none'
  console.log('Eliminando...')

 $.ajax({
     url : `http://localhost:5000/dashboard/viewer-kml/remove-file-kml/${id}?_method=delete`,
     type : 'POST',
     async: false,
     cache: false,
     contentType: false,
     enctype: 'multipart/form-data',
     processData: false,
     success : function(data) {

        // Archivo subido
        if(data) {
           console.log('Archivo Eliminado')
          
            console.log('Repsueas del sevdor')
            console.log(data); 
            KmlCappas[Number($this[0].dataset.id)].setMap(null)
        }
         
     }
  })

  return false;

})


// Check to hide or get capa
$ArticlesContainer.on('click', 'input.kml_check', function (ev) {
  let $this = $(this)
  let $article = $this.closest('.Box_item_kml')
  let id = $article.data('id')
  console.log('Tocado')
  console.log(id)

  console.log($this)
  
  if ($this[0].checked === true) {
      // do something if checked
      // Buscando la capa 
      KmlCappas[Number($this[0].dataset.id)].setMap(map)

      // showMarkers()
      console.log('CHECK')

  } else {
      // do something else otherwise
      //clearMarkers()
      console.log('noo CHECK') 
      KmlCappas[Number($this[0].dataset.id)].setMap(null)

  }

})

var path = []
var markers2 = []

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
  var myLatLng = {lat:  content.coordX, lng:  content.coordY};

  var marker2 = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: content.user_id,
    icon: image,
    identificador: content.user_id
  })

  marker2.setMap(map)      
  markers2.push(marker2)


})


