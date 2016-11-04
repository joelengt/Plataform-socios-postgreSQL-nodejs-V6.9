
console.log('HOlaaaaAAAAA')

// Elementos X,Y
var $box_X = document.querySelector('#txt_coordenada_X')
var $box_Y = document.querySelector('#txt_coordenada_Y')
var $address = document.querySelector('#address')

var $btn_goPoints = document.querySelector('#btn_goPoints')

function initMap() {
  map = new GMaps({
    div: '#map',
    zoom: 14,
    lat: $box_X.value || -12.043333,
    lng: $box_Y.value || -77.028333,
    click: function(e) {
      
      console.log('Evento click')

      console.log(e)
      $box_X.value = e.latLng.lat()
      $box_Y.value = e.latLng.lng()
    
    }
  })

  map.addControl({
    position: 'top_right',
    content: 'Marcar',
    style: {
      margin: '5px',
      padding: '1px 6px',
      border: 'solid 1px #717B87',
      background: '#fff'
    },
    events: {
      click: function(){
        map.addMarker({
          lat: $box_X.value,
          lng: $box_Y.value,
          title: 'Here',
          click: function(e) {
            
            console.log('You clicked in this marker')
            console.log(e)
          
          }
        })

      }
    }
  })

  map.addControl({
    position: 'top_right',
    content: 'Limpiar',
    style: {
      margin: '5px',
      padding: '1px 6px',
      border: 'solid 1px #717B87',
      background: '#fff'
    },
    events: {
      click: function(){

        initMap()

      }
    }
  })

}

$btn_goPoints.addEventListener('click', GoPoint)

function GoPoint() {
  map = new GMaps({
    div: '#map',
    zoom: 18,
    lat: $box_X.value || -12.043333,
    lng: $box_Y.value || -77.028333,
    click: function(e) {
      
      console.log('Evento click')

      console.log(e)
      $box_X.value = e.latLng.lat()
      $box_Y.value = e.latLng.lng()
    
    }
  })

  map.addControl({
    position: 'top_right',
    content: 'Marcar',
    style: {
      margin: '5px',
      padding: '1px 6px',
      border: 'solid 1px #717B87',
      background: '#fff'
    },
    events: {
      click: function(){
        map.addMarker({
          lat: $box_X.value,
          lng: $box_Y.value,
          title: 'Here',
          click: function(e) {
            
            console.log('You clicked in this marker')
            console.log(e)
          
          }
        })

      }
    }
  });

  map.addControl({
    position: 'top_right',
    content: 'Limpiar',
    style: {
      margin: '5px',
      padding: '1px 6px',
      border: 'solid 1px #717B87',
      background: '#fff'
    },
    events: {
      click: function(){

        initMap()

      }
    }
  });

  map.addMarker({
    lat: $box_X.value,
    lng: $box_Y.value,
    title: 'Here',
    click: function(e) {
      
      console.log('You clicked in this marker')
      console.log(e)
    
    }
  })
}

