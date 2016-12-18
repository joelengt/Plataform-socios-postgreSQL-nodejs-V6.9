(function () {

  // Clase Usuario
  class Usuario {
    // Atributos
    constructor(socio) {
      this.id = socio.id;
      this.fecha_ingreso = socio.fecha_ingreso;
      this.numero_carnet = socio.numero_carnet;
      this.foto = socio.foto;
      this.grado = socio.grado;
      this.arma = socio.arma;
      this.nombres = socio.nombres;
      this.apellidos = socio.apellidos;
      this.unidad = socio.unidad;
      this.gguu = socio.gguu;
      this.region = socio.region;
      this.guarnicion = socio.guarnicion;
      this.situacion_socio = socio.situacion_socio;
      this.filial = socio.situacion;
      this.cip = socio.cip;
      this.dni = socio.dni;
      this.email = socio.email;
      this.celular1 = socio.celular1;
      this.celular2 = socio.celular2;
      this.rpm1 = socio.rpm1;
      this.rpm2 = socio.rpm2;
      this.telefono1 = socio.telefono1;
      this.telefono2 = socio.telefono2;
      this.cd_leg = socio.cd_leg;
      this.onomastico = socio.onomastico;
      this.cd_esp = socio.cd_esp;
      this.esposa = socio.esposa;
      this.domicilio = socio.domicilio;
      this.carta_declaratoria = socio.carta_declaratoria;
      this.situacion_alerta = socio.situacion_alerta;
    }

    // Metodos

    // Construir Template de Usuario
    buildUserTemplate() {
      // Template de Usuario
      let template_user_item = `<tr class="SocioItem" data-id="${ this.id }">
                    <td class="text-center"><div class="avatar-socio" style="background-image: url(../images/default.jpg)"></div></td>
                    <td class="text-center"><a class="grey-text text-darken-4" href="/dashboard/socios-clientes/item/0/${ this.id }"> ${ this.nombres } ${ this.apellidos } </a></td>
                    <td class="text-center">${ this.situacion_socio }</td>
                    <td class="text-center">${ this.cip }</td>
                    <td class="text-center">${ this.carta_declaratoria }</td>
                    <td class="text-center"><i class="material-icons tag" style="color:${ this.situacion_alerta }">label</i></td>
                    </tr>`;
      return template_user_item
    }

    // Render Template
    setUserTemplate(contentHtml) {
      contentHtml.innerHTML+= this.buildUserTemplate();
    }
  }

  // Obtener usuario como objeto
  function getUser (element){
    let nuevoUsuario = new Usuario(element);
    console.log(nuevoUsuario);
    return nuevoUsuario
  }

  // Recorriendo lista obtenida
  function runList(array, limitStart, limitEnd, contentHtml) {
    contentHtml.innerHTML = '';
    // Evento ciclo
    for(var i = limitStart; i <= limitEnd; i++) {
      var elemento_usuario = array[i];

      // Creando nuevo usuario
      let nuevoUsuario = getUser(elemento_usuario);

      // Pegar template de usuario en el html
      nuevoUsuario.setUserTemplate(contentHtml);
    }
  }

  // READ Todos los Usuarios
  function readUsers(limitEachPage, contentHtml) {
    // GET :: READ Lista de usuarios
    $.ajax({
      url: '/dashboard/socios-clientes/list/0',
      method: 'get',
      success: function (listUsuarios) {

        contentHtml.innerHTML = '';

        getPaginationTemplate(limitEachPage, listUsuarios.result.length);
        var valueInit = 0;
        var valueEnd = 9;

        // Recorre lista y render Template en html
        runList(listUsuarios.result, valueInit, valueEnd, contentHtml);

      }
    })  
  }

  // READ Usuario por id
  function readUserById(user_id, contentHtml) {
    // GET :: READ Lista de usuarios
    $.ajax({
      url: `/dashboard/socios-clientes/item/0/${ user_id }`,
      method: 'get',
      success: function (info) {
        console.log(info);

          contentHtml.innerHTML = '';

          contentHtml.innerHTML = info;
        // Recorre lista y render Template en html
        // let nuevoUser = getUser(info);


      }
    }) 
  }
  
  // Filtrando usuario por nombre
  function searchByName(nameUser, contentHtml) {
    let listUserFound = [];
    $.ajax({
      url: '/dashboard/socios-clientes/list/0',
      method: 'get',
      success: function (listUsuarios) {
        console.log('Lista obtenida');
        console.log(listUsuarios);

        console.log('Comparando el .name con ' + nameUser);

        contentHtml.innerHTML = '';

        // Recorre lista y render Template en html
        for(var j = 0; j <= listUsuarios.result.length - 1; j++) {
          console.log(j);
          var elementoUser = listUsuarios.result[j]

          var fullName = elementoUser.nombres + ' ' + elementoUser.apellidos;

          var wordSolicitada = fullName.toLowerCase();
          nameUser = nameUser.toLowerCase()
          var coincidenciaMinima = 0;

          // Buscando coindicencia de la palabra
          for(var m = 0; m <= wordSolicitada.length - 1; m++) {
            if(wordSolicitada[m] !== nameUser[m]) {
                console.log('Ya no coincide')
                break
            }

            console.log(m)

            coincidenciaMinima++;
            
          }

          if(coincidenciaMinima === nameUser.length) {
            listUserFound.push(elementoUser);
          }
  
        }

        console.log('Resultado del filtrado');
        console.log(listUserFound);

        // Render de kas coincidencias
        if(listUserFound.length === 0) {
          contentHtml.innerHTML = '<tr>No se encontraron elementos con ese nombre</tr>';
          
        } else {
          contentHtml.innerHTML = '';

          runList(listUserFound, 0, listUserFound.length - 1, contentHtml)
        }

      }
    })

  }

  // Obtener Render de Paginacion
  function getPaginationTemplate(limitEachPage, listUsuariosLength) {
    console.log('Impriminedo lista');

    // Obteniendo Template de Paginacion
    var listCantidad = listUsuariosLength;
    console.log('Cantidad: ' + listCantidad);
    var numberPages =  listCantidad/limitEachPage;
    var residuo = listCantidad%limitEachPage;

    var $boxPagination = document.querySelector('.PaginationContent');

    if(residuo > 0 && residuo < 10) {
      console.log('Tiene residuo');
      numberPages = numberPages + 1;
    }

    $boxPagination.innerHTML = '';

    console.log('Pagina a imprimir: ' + numberPages);

    // Generar Template con limites
    for(var g = 1; g <= numberPages; g++) {
      let value_init;
      let value_end;

      if(listCantidad >= 10) {
        console.log('aaa');
        value_init = (g - 1) * limitEachPage;
        value_end = (g * limitEachPage) - 1;

        listCantidad = listCantidad - 10;

      } else {
        console.log('nn');
        value_init = (g - 1) * limitEachPage;
        value_end = (g * limitEachPage) + residuo;
        listCantidad = listCantidad - residuo;
      }

      $boxPagination.innerHTML += `<li class="selectPage waves-effect grey lighten-3" data-init="${ value_init }" data-end="${ value_end }"><a>${ g }</a></li>`

    }


  }

  // Cambiar orden de columna
  function changePosition(htmlContentItems) {
    console.log('Click');
    let ContentItems = document.querySelectorAll('.itemUser');

    console.log(ContentItems);

    console.log('--------------------');
    
    htmlContentItems.innerHTML = '';

    for (var i = ContentItems.length - 1; i >= 0; i--) {
      let $item = ContentItems[i];
      console.log($item.outerHTML);

      htmlContentItems.innerHTML += $item.outerHTML;

    }

    console.log('--------------------');

  }
  
  // Modal de image
  function showModalImage(imagePath, imageAlt) {
    console.log('Imagen path');
    console.log(imagePath);

     // Get the modal
     var modal = document.getElementById('myModal');

     // Get the image and insert it inside the modal - use its "alt" text as a caption
     var modalImg = document.getElementById("img01");
     var captionText = document.getElementById("caption");

     modal.style.display = "block";
     modalImg.src = imagePath;
     captionText.innerHTML = imageAlt;

     // Get the <span> element that closes the modal
     var span = document.getElementsByClassName("close")[0];

     // When the user clicks on <span> (x), close the modal
     span.onclick = function() { 
     modal.style.display = "none";
     }


  }

  function goheadfixed(classtable) {
  
    if($(classtable).length) {
  
      $(classtable).wrap('<div class="fix-inner"></div>'); 
      $('.fix-inner').wrap('<div class="fix-outer" style="position:relative; margin:auto;"></div>');
      $('.fix-outer').append('<div class="fix-head"></div>');
      $('.fix-head').prepend($('.fix-inner').html());
      $('.fix-head table').find('caption').remove();
      $('.fix-head table').css('width','100%');
  
      $('.fix-outer').css('width', $('.fix-inner table').outerWidth(true)+'px');
      $('.fix-head').css('width', $('.fix-inner table').outerWidth(true)+'px');
      $('.fix-head').css('height', $('.fix-inner table thead').height()+'px');
  
      // If exists caption, calculte his height for then remove of total
      var hcaption = 0;
      if($('.fix-inner table caption').length != 0)
        hcaption = parseInt($('.fix-inner table').find('caption').height()+'px');

      // Table's Top
      var hinner = parseInt( $('.fix-inner').offset().top );

      // Let's remember that <caption> is the beginning of a <table>, it mean that his top of the caption is the top of the table
      $('.fix-head').css({'position':'absolute', 'overflow':'hidden', 'top': hcaption+'px', 'left':0, 'z-index':0 });
    
      $(window).scroll(function () {
        var vscroll = $(window).scrollTop();

        if(vscroll >= hinner + hcaption)
          $('.fix-head').css('top',(vscroll-hinner)+'px');
        else
          $('.fix-head').css('top', hcaption+'px');
      });
  
      /*  If the windows resize   */
      $(window).resize(goresize);
  
    }
  }

  function goresize() {
    $('.fix-head').css('width', $('.fix-inner table').outerWidth(true)+'px');
    $('.fix-head').css('height', $('.fix-inner table thead').outerHeight(true)+'px');
  }

  // Funcion Principal
  function main() {
    // Obteniendo Contenedo html
    var $boxConntentHtml = document.querySelector('#boxListUsers');
    var $ArticlesContainer = $('#App_Container').find('.Articles_containers');
    var $ArticlesContainerPages = $('#App_Container').find('.Pagination');
    var $ViewboxRender = $('body')[0]

    var $txtBoxSearchByName = document.querySelector('#txt_box_search');
    var $btnBoxSearchByName = document.querySelector('#btn_box_search');
    var nameUserWord = '';

    var $btn_change_order = document.querySelector('.btn_change_order');

    // Paginacion
    var limitePage = 10;

    // Lectura de Usuarios
    readUsers(limitePage, $boxConntentHtml);

    // Filtro por caja de texto by name - Por coincidencia de parte de la palabra
     $btnBoxSearchByName.addEventListener('click', function (ev) {
      let nameUser = $txtBoxSearchByName.value;
      console.log('BUSQUEDA POR NOMBRE O DNI -> click');
      console.log(nameUser);
      searchByName(nameUser, $boxConntentHtml);
     })

     // Filtro por evento key: enter
     $txtBoxSearchByName.addEventListener('keypress', function (event) {
      let nameUser = $txtBoxSearchByName.value;
      console.log('BUSQUEDA POR NOMBRE O DNI -> keypress enter');
      console.log(nameUser);
      if(event.charCode === 13) {
        searchByName(nameUser, $boxConntentHtml);
      }

     })

     //Activando estilo de caja de Filtros lateral
     $('select').material_select();

     // Evento click -> Cambiar Orden
     // $btn_change_order.addEventListener('click', function () {
     //      console.log('hi');

     //      changePosition($boxConntentHtml)

     // })

     // Filter mientras la caja de texto cambia
     $('#txt_box_search').bind('input', function() { 
      if($(this).val() === '') {
         nameUserWord = '';
         readUsers($boxConntentHtml)
       }

       nameUserWord = $(this).val()

       console.log('BUSQUEDA POR NOMBRE O DNI -> Input change');
       console.log(nameUserWord);

       searchByName(nameUserWord, $boxConntentHtml);
     });      
     
     // Filtro por evento key: enter
     $ArticlesContainerPages.on('click', '.selectPage', function (ev) {
      let $this = $(this)
      console.log(this);

      let $article = $this.closest('.selectPage');
      let dataInit = $article.data('init');
      let dataEnd = $article.data('end');

      console.log('Page');
      console.log(dataInit);
      console.log(dataEnd);

      $.ajax({
        url: '/dashboard/socios-clientes/list/0',
        method: 'get',
        success: function (listUsuarios) {

          // Reset html
          $boxConntentHtml.innerHTML = '';
          
          // Recorre lista y render Template en html
          runList(listUsuarios.result, dataInit, dataEnd, $boxConntentHtml);

        }
      })  

    })

     // /dashboard/socios-clientes/item/0/1

     // $ArticlesContainer.on('click', '.SocioItem', function (ev) {
     //      console.log('DATOSS DEL SOCIO POR ID');
     //      var socio_id = this.dataset.id

     //      readUserById(socio_id, $ViewboxRender);

     //  })


     // $ArticlesContainer.on('click', '.imagenAvatar', function (ev) {
     //  console.log('Click');
     //      var imageUrl = this.src
     //      var imageAlt = this.alt
     //      showModalImage(imageUrl, imageAlt);

     //  })

    // goheadfixed('table.fixed')

  }

  // Inicializando Lectura
  window.addEventListener('load', main);

})();
