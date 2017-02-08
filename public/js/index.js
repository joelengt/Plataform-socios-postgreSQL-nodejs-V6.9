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
      if (contentHtml !== null) {
        contentHtml.innerHTML+= this.buildUserTemplate();
      }
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
    if (contentHtml !== null) {
      contentHtml.innerHTML = '';
    }
    // Evento ciclo
    for(var i = limitStart; i <= limitEnd; i++) {
      console.log(array)
      var elemento_usuario = array[i];

      // Creando nuevo usuario
      let nuevoUsuario = getUser(elemento_usuario);

      // Pegar template de usuario en el html
      nuevoUsuario.setUserTemplate(contentHtml);
    }
  }

  // Template para lista de search
  function runListSearch(array, contentHtml) {
    console.log(array, contentHtml)

    // if (!document.querySelector('.searchContainer')) {
    //   console.log('jajajaja')
    //   var container = document.createElement('div')
    //   container.setAttribute('class', 'searchContainer')
    //   contentHtml.append(container)
    // }

    for (var i = 0; i < array.length; i++) {

      var element_user = array[i]
      console.log(element_user)
      var user_div = document.createElement('div')
      user_div.setAttribute('class', 'searchContainer__item')
      var tpl = `<a class="searchContainer__item--link" href="/dashboard/socios-clientes/item/0/${element_user.id}">${element_user.nombres} ${element_user.apellidos}</a>`

      user_div.innerHTML = tpl

      contentHtml.append(user_div)

    }
  }

  // READ Todos los Usuarios
  function readUsers(limitEachPage, contentHtml) {
    // GET :: READ Lista de usuarios
    $.ajax({
      url: '/dashboard/socios-clientes/list/0',
      method: 'get',
      success: function (listUsuarios) {

        if (contentHtml !== null) {
          contentHtml.innerHTML = '';
        }

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
    if (nameUser !== '') {
      $.ajax({
        url: '/dashboard/socios-clientes/list/0',
        method: 'get',
        success: function (listUsuarios) {
          console.log('Lista obtenida');
          // console.log(listUsuarios);

          console.log('Comparando el .name con ' + nameUser);

          contentHtml.innerHTML = '';

          // Recorre lista y render Template en html
          for(var j = 0; j <= listUsuarios.result.length - 1; j++) {
            // console.log(j);
            var elementoUser = listUsuarios.result[j]
            numero_dni = parseInt(nameUser)
            // console.log(numero_dni)
            var numero = isNaN(numero_dni)
            // console.log(!numero)
            if (!numero) {
              var numberSolicitada = elementoUser.dni
              var coincidenciaMinima = 0;
              numero_dni = numero_dni.toString()
              console.log(numero_dni.length)

              for(var m = 0; m <= numberSolicitada.length - 1; m++) {
                if(numberSolicitada[m] !== numero_dni[m]) {
                    console.log('Ya no coincide')
                    break
                }

                console.log(m)

                coincidenciaMinima++;
              }

              if(coincidenciaMinima === numero_dni.length) {
                listUserFound.push(elementoUser);
              }

            } else {
              var fullName = elementoUser.apellidos + ' ' + elementoUser.nombres;

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
              console.log(nameUser)
              console.log(coincidenciaMinima, nameUser.length)
              if(coincidenciaMinima === nameUser.length) {
                listUserFound.push(elementoUser);
              }
            }
      
          }

          console.log('Resultado del filtrado');
          console.log(listUserFound);

          // Render de kas coincidencias
          if(listUserFound.length === 0) {
            // contentHtml.innerHTML = '<div>No se encontraron elementos con ese nombre</div>';          
          } else {
            // contentHtml.innerHTML = '';
            // getPaginationTemplate(10, listUserFound.length);
            // var valueInit = 0;
            // var valueEnd = 9;

            // Recorre lista y render Template en html
            // runList(listUserFound, valueInit, valueEnd, contentHtml);
            runListSearch(listUserFound, contentHtml)

            // runList(listUserFound, 0, listUserFound.length - 1, contentHtml)
          }

        }
      })
    } else {
      document.querySelector('.searchContainer').innerHTML = ''
    }
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

    if ($boxPagination !== null) {
      $boxPagination.innerHTML = '';
    }

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

      if ($boxPagination !== null) {
        $boxPagination.innerHTML += `<li class="selectPage waves-effect grey lighten-3" data-init="${ value_init }" data-end="${ value_end }"><a>${ g }</a></li>`
      }

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

  // function goresize() {
  //   $('.fix-head').css('width', $('.fix-inner table').outerWidth(true)+'px');
  //   $('.fix-head').css('height', $('.fix-inner table thead').outerHeight(true)+'px');
  // }

  //Resize Table with filter
  function resize(){
    if (resize !== null && resize !== undefined){
      if ($('.Filter').css('left') !==  '-300px') {
        $('.Filter').css({
          'left': '-300px',
        })
        $('.TableList').css({
          'padding-left': '0',
        })
      } else {
        $('.Filter').css({
          'left': '0',
        })
        $('.TableList').css({
          'padding-left': '300px',
        })
      }
    }
  }

  // Paramtros de filtro
  function workFilter(limitEachPage, contentHtml, type_partner, situation_partner, type_payment, situation_work, letter_declaration, onomastic) {

    console.log(type_partner, situation_partner, type_payment, situation_work, letter_declaration, onomastic)
    let listUserFound = [];
    // let limitEachPage = limitEachPage;

    $.ajax({
      url: `/dashboard/socios-clientes/filter/table/0/columns/params?tipo_socio=${type_partner}&situacion_socio=${situation_partner}&tipo_pago=${type_payment}&situacion_trabajo=${situation_work}&carta_declaratoria=${letter_declaration}&onomastico=${onomastic}`,
      method: 'GET',
      success: function(listUsuarios){
        console.log(listUsuarios.list)
        contentHtml.innerHTML = '';

        if (listUsuarios.status !== 'not_found') {
          getPaginationTemplate(limitEachPage, listUsuarios.list.length);
          var valueInit = 0;
          var valueEnd = 9;

          // Recorre lista y render Template en html
          runList(listUsuarios.list, valueInit, valueEnd, contentHtml);
        } else {
          contentHtml.innerHTML = '<tr>No se encontraron elementos con ese nombre</tr>';
        }
      },
      err: function(err){
        console.log(err)
      }
    })

  }

  //Almacenamiento de data de nuevo socio
  function saveData(data, extra){
    // var storage = sessionStorage.getItem('CS')
    var dataForm = JSON.parse(sessionStorage.getItem('CS'))
    console.log(data)
    console.log(extra)
    // console.log(new_Data)
    if (extra) {
      dataForm.datos_extra = {}
      console.log(data)
      console.log(dataForm)
      data = data.split('&')
      for (var i = 0; i < data.length; i++) {
        data[i] = data[i].split('=')
      }
      if (extra === 'spouse') {
        dataForm.datos_extra.conyuge = {}
        console.log(data)
        for (var i = 0; i < data.length; i++) {
          dataForm.datos_extra.conyuge[data[i][0]] = data[i][1] || ''
        }
      } else if(extra === 'afiliatte') {
        dataForm.datos_extra.afiliado = {}
        console.log(data)
        for (var i = 0; i < data.length; i++) {
          dataForm.datos_extra.afiliado[data[i][0]] = data[i][1] || ''
        }
      }
    } else {
      data = data.split('&')
      for (var i = 0; i < data.length; i++) {
        data[i] = data[i].split('=')
      }
      console.log(data)
      for (var i = 0; i < data.length; i++) {
        dataForm[data[i][0]] = data[i][1] || ''
      }
    }
    var dataForm = JSON.stringify(dataForm)
    // console.log(dataForm)
    sessionStorage.setItem('CS', dataForm)
    console.log(JSON.parse(sessionStorage.getItem('CS')))
  }

  // Extraccion de data de formulario
  function meSerialize(form){
    var contentsOptions = form.find('.row')
    console.log(contentsOptions.length)
    var data = ''

    for (var i = 0; i < contentsOptions.length; i++) {
      var options =  contentsOptions[i]
      $options = $(options)
      var inputs = $options.find('input')
      var selects = $options.find('select')
      for (var o = 0; o < inputs.length; o++) {
        if (inputs[o].getAttribute('class') !== 'select-dropdown') {
          if (data === '') {
            data = data + inputs[o].getAttribute('name') + '=' + inputs[o].value
          } else {
            data = data + '&' + inputs[o].getAttribute('name') + '=' + inputs[o].value
          }
        }
      }

      for (var u = 0; u < selects.length; u++) {
        if (data === '') {
          data = data + selects[u].getAttribute('name') + '=' + selects[u].value
        } else {
          data = data + '&' + selects[u].getAttribute('name') + '=' + selects[u].value
        }
      }
    }
    console.log(data)
    return data
  }

  // Accion de boton anterior para template de formulario
  function actionBtnPrev(form, dataBtn, modal_body, btnMore, btnPrev, btnNext) {
    form.remove()
    if (dataBtn === 'tpl_data_civil') {
      tpl_create_partner(modal_body, 'Crear Socio')
      btnMore.css('display', 'block')
      btnPrev.css('display', 'none')
      btnNext.css('display', 'none')
    } else if(dataBtn === 'tpl_data_pnp'){
      tpl_create_partner(modal_body, 'Crear Socio')
      btnMore.css('display', 'block')
      btnPrev.css('display', 'none')
      btnNext.css('display', 'none')
    } else if(dataBtn === 'tpl_data_work'){
      tpl_data_pnp(modal_body, 'Crear Socio')
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    } else if(dataBtn === 'tpl_data_contact'){
      var dataForm = JSON.parse(sessionStorage.getItem('CS'))
      if (dataForm.organizacion === 'Civil') {
        tpl_data_civil(modal_body, 'Crear Socio')
      } else {
        tpl_data_work(modal_body, 'Crear Socio')        
      }
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    } else {
      tpl_data_contact(modal_body, 'Crear Socio')
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    }
  }

  // Accion de boton Siguiente para template de formulario
  function actionBtnNext(form, data, modal_body, btnPrev, btnNext, btnSave){
    form.remove()
    console.log(form, data, modal_body, btnPrev, btnNext)
    if (data === 'tpl_data_pnp') {
      tpl_data_work(modal_body, 'Crear Socio')
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    } else if(data === 'tpl_data_work'){
      tpl_data_contact(modal_body, 'Crear Socio')
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    } else if(data === 'tpl_data_contact'){
      tpl_data_spouse(modal_body, 'Crear Socio')
      btnPrev.css('display', 'block')
      btnNext.css('display', 'block')
    } else if(data === 'tpl_data_spouse'){
      tpl_create_partner(modal_body, 'Crear Socio')
      btnPrev.css('display', 'none')
      btnNext.css('display', 'none')
      btnSave.removeClass('disabled')
    }
  }

  // Accion de boton mas infomacion para template de formulario
  function moreInfo(){
    var btnMore = $(this)
    var parent = $(this).parents('#modalForm')
    var modal_body = parent.find('.ModalForm__content')
    var form = parent.find('[data-form-part="tpl_create_partner"]')
    var btnNext = parent.find('.btn-next')
    var btnPrev = parent.find('.btn-prev')

    var data = meSerialize(form)
    saveData(data)

    btnMore.css('display', 'none')
    form.remove()

    var dataForm = JSON.parse(sessionStorage.getItem('CS'))

    if (dataForm.organizacion === 'Civil') {
      tpl_data_civil(modal_body, 'Crear Socio', 'tpl_create_partner')      
    } else {
      if (dataForm.organizacion === 'P.N.P'){
        tpl_data_pnp(modal_body, 'Crear Socio', 'tpl_create_partner', 'PNP')
      } else{
        tpl_data_pnp(modal_body, 'Crear Socio', 'tpl_create_partner', 'Fuerzas')
      }
    }

    btnNext.css('display', 'block')
    btnPrev.css('display', 'block')
  }

  // Accion de boton en formulario
  function btnPrev() {
    // var btn = $(this)
    var parent = $(this).parents('#modalForm')
    var modal_body = parent.find('.ModalForm__content')
    console.log(modal_body)
    var form = parent.find('.ModalForm__content--part')
    var dataPart = form.attr('data-form-part')
    var btnMore = parent.find('.bt-aditional')
    var btnNext = parent.find('.btn-next')
    var btnPrev = parent.find('.btn-prev')

    var data = meSerialize(form)

    if (form.attr('data-form-part') === 'tpl_data_spouse') {
      saveData(data, 'spouse')
    } else {
      saveData(data)
    }

    actionBtnPrev(form, dataPart, modal_body, btnMore, btnPrev, btnNext)
  }

  // Accion de boton en formulario
  function btnNext() {
    // var btn = $(this)
    var parent = $(this).parents('#modalForm')
    var modal_body = parent.find('.ModalForm__content')
    var form = parent.find('.ModalForm__content--part')
    var dataPart = form.attr('data-form-part')
    var btnNext = parent.find('.btn-next')
    var btnPrev = parent.find('.btn-prev')
    var btnSave = parent.find('.btn-save')

    var data = meSerialize(form)

    if (form.attr('data-form-part') === 'tpl_data_spouse') {
      saveData(data, 'spouse')
    } else {
      saveData(data)
    }
    


    actionBtnNext(form, dataPart, modal_body, btnPrev, btnNext, btnSave)
  }

  // Accion de boton en formulario
  function btnSave() {
    var parent = $(this).parents('#modalForm')
    var modal_body = parent.find('.ModalForm__content')
    var modalFooter = parent.find('.ModalForm__footer')
    var form = parent.find('.ModalForm__content--part')

    var updateData = meSerialize(form)
    saveData(updateData)
    
    var data = JSON.parse(sessionStorage.getItem('CS'))
    var preloader = document.createElement('div')
    preloader.setAttribute('class', 'progress')
    tpl = `<div class="indeterminate"></div>`
    preloader.innerHTML = tpl
    // console.log(parent[0], modalFooter[0])
    modalFooter.append(preloader)
    console.log($('.progress'))

    $.ajax({
      type: 'POST',
      url: '/dashboard/socios-clientes/item/socio/add/0',
      data: data,
      success: function(res){
        console.log(res)
        $('#modalForm').modal('close')
        sessionStorage.removeItem('CS')
      },
      err: function(err){
        console.log(err)
      }
    })
  }

  // Pequeño template para formulario segun tipo de fuerza
  function plt_fource(typeFource, params) {
    var tpl
    if (typeFource === 'PNP') {
      tpl = `<option ${params.tipo_pago==='Directo' ? 'selected' :''} value="Directo">Directo</option>`
    } else {
      tpl = `<option ${params.tipo_pago==='OGCOE' ? 'selected' :''} value="OGCOE">OGCOE</option>
      <option ${params.tipo_pago==='CPMP' ? 'selected' :''} value="CPMP">CPMP</option>
      <option ${params.tipo_pago==='Pago Directo' ? 'selected' :''} value="Pago Directo">Pago Directo</option>`
    }
    return tpl
  }

  // Template para llenado de datos de nuevo socio
  function tpl_create_partner(modal_body, titleModal, params){

    var time = new Date()
    var dia = ("0" +time.getDate()).slice(-2);
    var mes = ("0" + (time.getMonth() + 1)).slice(-2);
    var año = time.getFullYear() ;
    var time = año +'-'+ mes +'-'+ dia

    var dateNow = time

    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_create_partner')
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.nombres || ''}" name="nombres" id="nombres" type="text" class="validate">
              <label for="nombres">Nombre</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.apellidos || ''}" name="apellidos" id="apellidos" type="text" class="validate">
              <label for="apellidos">Apellido</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <select name="organizacion" class="selectForm">
                <option ${data.organizacion==='Ejercito' ? 'selected' : ''} value="Ejercito">Ejercito</option>
                <option ${data.organizacion==='F.A.P' ? 'selected' : ''} value="F.A.P">F.A.P</option>
                <option ${data.organizacion==='Marina' ? 'selected' : ''} value="Marina">Marina</option>
                <option ${data.organizacion==='P.N.P' ? 'selected' : ''} value="P.N.P">P.N.P</option>
                <option ${data.organizacion==='Civil' ? 'selected' : ''} value="Civil">Civil</option>
              </select>
              <label>Organización</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.dni || ''}" name="dni" id="dni" type="number" class="validate">
              <label for="dni">DNI</label>
            </div>
            <div class="input-field col s5">
              <label class="date" for="fecha_nacimiento">Fecha de Nacimiento</label>
              <input value="${data.fecha_nacimiento || dateNow}" name="fecha_nacimiento" id="fecha_nacimiento" type="date" placeholder="" max="${dateNow}">
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.numero_carnet || ''}" name="numero_carnet" id="numero_carnet" type="text" class="validate">
              <label for="numero_carnet">N° Carnet</label>
            </div>
          </div>`


    content.innerHTML = tpl
    modal_body.append(content)

    $('#dni').on('keypress', function(){
      nombre=$(this).val();       
      //Comprobamos la longitud de caracteres
      if (nombre.length<8){
        return true;
      }
      else {
        return false;         
      }
    })

    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  // Template para datos de socio civil
  function tpl_data_civil(modal_body, titleModal, prev, params){
    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_civil')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.grado_profesion || ''}" name="grado_profesion" id="grado_profesion" type="text" class="validate">
              <label for="grado_profesion">Profesión</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <select name="situacion_trabajo" class="selectForm">
                <option ${data.situacion_trabajo==='Actividad' ? 'selected' : ''} value="Actividad">Actividad</option>
                <option ${data.situacion_trabajo==='Retiro' ? 'selected' : ''} value="Retiro">Retiro</option>
              </select>
              <label>Situacion de Trabajo</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <select name="tipo_pago" class="selectForm">
                <option ${data.tipo_pago==='Directo' ? 'selected' : ''} value="Directo">Directo</option>
              </select>
              <label>Tipo de Pago</label>
            </div>
            <div class="input-field col s5">
              <select name="carta_declaratoria" class="selectForm">
                <option ${data.carta_declaratoria==='Si' ? 'selected' : ''} value="Si">Si</option>
                <option ${data.carta_declaratoria==='No' ? 'selected' : ''} value="No">No</option>
              </select>
              <label>Carta Declaratoria</label>
            </div>
          </div>`

    content.innerHTML = tpl
    modal_body.append(content)
    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  // Template para datos de socio PNP
  function tpl_data_pnp(modal_body, titleModal, prev, typeFource, params){
    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    console.log(typeFource)
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_pnp')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.cip || ''}" name="cip" id="cip" type="text" class="validate">
              <label for="cip">CIP</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.grado_profesion || ''}" name="grado_profesion" id="grado_profesion" type="text" class="validate">
              <label for="grado_profesion">Grado</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.arma || ''}" name="arma" id="arma" type="text" class="validate">
              <label for="arma">Arma</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.situacion_trabajo || ''}" name="situacion_trabajo" id="situacion_trabajo" type="text" class="validate">
              <label for="situacion_trabajo">Situacion de Trabajo</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <select name="tipo_pago" class="selectForm">
                ${plt_fource(typeFource, data)}
              </select>
              <label>Tipo de Pago</label>
            </div>
            <div class="input-field col s5">
              <select name="carta_declaratoria" class="selectForm">
                <option ${data.carta_declaratoria==='Si' ? 'selected' :''} value="Si">Si</option>
                <option ${data.carta_declaratoria==='No' ? 'selected' :''} value="No">No</option>
              </select>
              <label>Carta Declaratoria</label>
            </div>
          </div>`

    content.innerHTML = tpl
    modal_body.append(content)
    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  // Template para datos de trabajo 
  function tpl_data_work(modal_body, titleModal, prev, params){
    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_work')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <h6 class="Subtitle">DATOS DEL TRABAJO</h6>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.unidad || ''}" name="unidad" id="unidad" type="text" class="validate">
              <label for="unidad">Unidad</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.gguu || ''}" name="gguu" id="gguu" type="text" class="validate">
              <label for="gguu">Gran Unidad</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.region || ''}" name="region" id="region" type="text" class="validate">
              <label for="region">Región</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.guarnicion || ''}" name="guarnicion" id="guarnicion" type="text" class="validate">
              <label name="guarnicion" for="guarnicion">Guarnición</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.filial || ''}" name="filial" id="filial" type="text" class="validate">
              <label for="filial">Filial</label>
            </div>
          </div>`
    
    content.innerHTML = tpl
    modal_body.append(content)
    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  // Template para datos de contacto
  function tpl_data_contact(modal_body, titleModal, prev, params){
    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_contact')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <h6 class="Subtitle">DATOS DE CONTACTO</h6>
          <div class="row">
            <div class="input-field col s10">
              <input value="${data.direccion || ''}" name="direccion" id="direccion" type="text" class="validate">
              <label for="direccion">Dirección</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.email || ''}" name="email" id="email" type="email" class="validate">
              <label for="email">Email</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.celular1 || ''}" name="celular1" id="celular1" type="number" class="validate">
              <label for="celular1">Celular 1</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.celular2 || ''}" name="celular2" id="celular2" type="number" class="validate">
              <label for="celular2">Celular 2</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.telefono1 || ''}" name="telefono1" id="telefono1" type="number" class="validate">
              <label for="telefono1">Telefono 1</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.telefono2 || ''}" name="telefono2" id="telefono2" type="number" class="validate">
              <label for="telefono2">Telefono 2</label>
            </div>
          </div>`
    
    content.innerHTML = tpl
    modal_body.append(content)
    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  //Template para datos de conyugue de socio
  function tpl_data_spouse(modal_body, titleModal, prev, params){

    var time = new Date()
    var dia = ("0" +time.getDate()).slice(-2);
    var mes = ("0" + (time.getMonth() + 1)).slice(-2);
    var año = time.getFullYear() ;
    var time = año +'-'+ mes +'-'+ dia

    var dateNow = time

    var dataCs

    if (JSON.parse(sessionStorage.getItem('CS'))) {
      // console.log(JSON.parse(sessionStorage.getItem('CS')))
      if (JSON.parse(sessionStorage.getItem('CS')).datos_extra === undefined) {
        dataCS = JSON.parse(sessionStorage.getItem('CS'))
        // console.log(dataCS)
        dataCS.datos_extra =  {}
        dataCS.datos_extra.conyuge =  {nombres:null, apellidos:null, dni:null, fecha_nacimiento:null, email:null, celular: null}
      } else {
        dataCS = JSON.parse(sessionStorage.getItem('CS'))
      }
    }

    var data = params || dataCS.datos_extra.conyuge || null
    console.log(data)
    // var conyuge = data.datos_extra.conyuge
    // {nombres:null, apellidos:null, dni:null, fecha_nacimiento:null, email:null, celular: null}
    // console.log(conyuge)
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_spouse')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <h6 class="Subtitle">DATOS DE CÓNYUGUE</h6>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.nombres || ''}" name="nombres" id="nombres" type="text" class="validate">
              <label for="nombres">Nombre</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.apellidos || ''}" name="apellidos" id="apellidos" type="text" class="validate">
              <label for="apellidos">Apellido</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.dni || ''}" name="dni" id="dni" type="number" class="validate">
              <label for="dni">DNI</label>
            </div>
            <div class="input-field col s5">
              <label class="date" for="fecha_nacimiento">Fecha de Nacimiento</label>
              <input value="${data.fecha_nacimiento || dateNow}" name="fecha_nacimiento" id="fecha_nacimiento" type="date" placeholder="" max="${dateNow}">
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.email || ''}" name="email" id="email" type="text" class="validate">
              <label for="email">Email</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.celular || ''}" name="celular" id="celular" type="number">
              <label class="number" for="celular">Celular</label>
            </div>
          </div>`
    
    content.innerHTML = tpl
    modal_body.append(content)

    $('#dni').on('keypress', function(){
      nombre=$(this).val();       
      //Comprobamos la longitud de caracteres
      if (nombre.length<8){
        return true;
      }
      else {
        return false;         
      }
    })

    $('.selectForm').material_select()
    Materialize.updateTextFields()

  }

  // Template para datos de afiliados
  function tpl_data_afiliatte(modal_body, titleModal, prev, params){
    var time = new Date()
    var dia = ("0" +time.getDate()).slice(-2);
    var mes = ("0" + (time.getMonth() + 1)).slice(-2);
    var año = time.getFullYear() ;
    var time = año +'-'+ mes +'-'+ dia

    var dateNow = time

    var data = params || JSON.parse(sessionStorage.getItem('CS')) || null
    var content = document.createElement('form')
    content.setAttribute('class', 'ModalForm__content--part')
    content.setAttribute('id', 'ModalForm__content--part')
    content.setAttribute('data-form-part', 'tpl_data_afiliatte')
    content.setAttribute('data-form-prev', prev)
    var tpl = `<h5 class="Title">${titleModal}</h5>
          <h6 class="Subtitle">DATOS DE CÓNYUGUE</h6>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.datos_extra.conyugue.nombre || ''}" name="nombre" id="nombre" type="text" class="validate">
              <label for="nombre">Nombre</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.datos_extra.conyugue.apellido || ''}" name="apellido" id="apellido" type="text" class="validate">
              <label for="apellido">Apellido</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.datos_extra.conyugue.dni || ''}" name="dni" id="dni" type="number" class="validate">
              <label for="dni">DNI</label>
            </div>
            <div class="input-field col s5">
              <label class="date" for="fecha_nacimiento">Fecha de Nacimiento</label>
              <input value="${data.datos_extra.conyugue.fecha_nacimiento || dateNow}" name="fecha_nacimiento" id="fecha_nacimiento" type="date" placeholder="" max="${dateNow}">
            </div>
          </div>
          <div class="row">
            <div class="input-field col s5">
              <input value="${data.datos_extra.conyugue.email || ''}" name="email" id="email" type="text" class="validate">
              <label for="email">Email</label>
            </div>
            <div class="input-field col s5">
              <input value="${data.datos_extra.conyugue.celular || ''}" name="celular" id="celular" type="number">
              <label class="number" for="celular">Celular</label>
            </div>
          </div>`
    
    content.innerHTML = tpl
    modal_body.append(content)

    $('#dni_conyugue').on('keypress', function(){
      nombre=$(this).val();       
      //Comprobamos la longitud de caracteres
      if (nombre.length<8){
        return true;
      }
      else {
        return false;         
      }
    })

    $('.selectForm').material_select()
    Materialize.updateTextFields()
  }

  // Actualizacion de datos de socio
  function btnUpdate() {
    var id_socio = $(this).attr('data-idSocio')
    var parent = $(this).parents('#modalForm')
    var modal_body = parent.find('.ModalForm__content')
    var modalFooter = parent.find('.ModalForm__footer')
    var form = parent.find('.ModalForm__content--part')

    var updateData = meSerialize(form)

    if (form.attr('data-form-part') === 'tpl_data_spouse') {
      console.log('jajaja')
      saveData(updateData, 'spouse')
    } else {
      saveData(updateData)
    }
    
    var data = JSON.parse(sessionStorage.getItem('CS'))
    console.log(data)
    var preloader = document.createElement('div')
    preloader.setAttribute('class', 'progress')
    tpl = `<div class="indeterminate"></div>`
    preloader.innerHTML = tpl
    // console.log(parent[0], modalFooter[0])
    modalFooter.append(preloader)
    console.log($('.progress'))

    console.log(data)

    $.ajax({
      type: 'POST',
      url: `/dashboard/socios-clientes/item/update/0/${id_socio}?_method=put`,
      data: data,
      success: function(res){
        console.log(res)
        $('#modalForm').modal('close')
        sessionStorage.removeItem('CS')
        location.reload()
      },
      err: function(err){
        console.log(err)
      }
    })
  }

  // Modal para creacion de nuevo socio
  function CreateFormSocio(contentHtml, params) {

    sessionStorage.setItem('CS', JSON.stringify({}))
    var modal = document.createElement('div')
    modal.setAttribute('class', 'ModalForm modal modal-fixed-footer')
    modal.setAttribute('id', 'modalForm')
    var template = `<div class="ModalForm__content modal-content">       
      </div>
      <div class="ModalForm__footer modal-footer">
        <div class="btns left">
          <a class=" modal-action waves-effect waves-green btn-flat btn-next">Siguiente</a>
          <a class=" modal-action waves-effect waves-green btn-flat btn-prev">Anterior</a>
          <a class=" modal-action waves-effect waves-green btn-flat bt-aditional">Información Adicional</a>
        </div>
        <div class="btns right">
          <a class=" modal-action waves-effect waves-green btn-flat btn-save disabled">Guardar</a>
          <a class=" modal-action modal-close waves-effect waves-green btn-flat btn-cancel">Cancelar</a>
        </div>
      </div>`

    modal.innerHTML = template
    contentHtml.append(modal)

    $('.ModalForm').modal({

      complete: function(ev){
        ev.remove()
        sessionStorage.removeItem('CS')
      }

    })

    $('#modalForm').modal('open');

    var $modal_body = $('.ModalForm__content')

    tpl_create_partner($modal_body, 'Crear Socio')
    // $('.selectForm').material_select();

    var $btn_next = $('.btn-next')
    var $btn_prev = $('.btn-prev')
    var $btn_moreInfo = $('.bt-aditional')
    var $btn_save = $('.btn-save')

    // $btn_prev.on('click', prevForm)
    $btn_moreInfo.on('click', moreInfo)
    $btn_prev.on('click', btnPrev)
    $btn_next.on('click', btnNext)
    $btn_save.on('click', btnSave)

  }

  // Edicion de datos de un socio
  function CreateFormEditSocio (contentHtml, data_infoEdit) {

    sessionStorage.setItem('CS', JSON.stringify({}))
    var modal = document.createElement('div')
    var id_socio = document.querySelector('.data_idSocio').innerHTML
    modal.setAttribute('class', 'ModalForm modal modal-fixed-footer')
    modal.setAttribute('id', 'modalForm')

    var template = `<div class="ModalForm__content modal-content">
        <div class="progress">
          <div class="indeterminate"></div>
        </div>  
      </div>
      <div class="ModalForm__footer modal-footer">
        <div class="btns left">
          <a class=" modal-action waves-effect waves-green btn-flat btn-next">Siguiente</a>
          <a class=" modal-action waves-effect waves-green btn-flat btn-prev">Anterior</a>
          <a class=" modal-action waves-effect waves-green btn-flat bt-aditional">Información Adicional</a>
        </div>
        <div class="btns right">
          <a class=" modal-action waves-effect waves-green btn-flat btn-update disabled" data-idSocio="${id_socio}">Actualizar Datos</a>
          <a class=" modal-action modal-close waves-effect waves-green btn-flat btn-cancel">Cancelar</a>
        </div>
      </div>`

    modal.innerHTML = template
    contentHtml.append(modal)

    $('.ModalForm').modal({
      complete: function(ev){

        ev.remove()
        sessionStorage.removeItem('CS')

      }

    })

    $('#modalForm').modal('open');

    var $modal_body = $('.ModalForm__content')
    var $btn_update = $('.btn-update')

    $.ajax({
      url: `/dashboard/socios-clientes/item/to-json/0/${id_socio}`,
      method: 'GET',
      success: function(res){

        document.querySelector('.progress').remove()
        var data_socio = res.result
        console.log(data_socio)

        if (data_infoEdit === 'editDataUser') {

          var $btn_moreInfo = $('.bt-aditional')
          tpl_create_partner($modal_body, 'Editar Socio', data_socio)

          $btn_moreInfo.on('click', function(){

            var Form =$('.ModalForm__content--part')
            $btn_update.removeClass('disabled')
            console.log(Form)
            var data = meSerialize(Form)
            saveData(data)

            $btn_moreInfo.css({'display':'none'})
            document.querySelector('[data-form-part="tpl_create_partner"').remove()

            if (data_socio.organizacion === 'Civil') {

              console.log('Pertenece a civil')
              tpl_data_civil($modal_body, 'Editar Socio', null, data_socio)

            } else if(data_socio.organizacion === 'P.N.P'){

              console.log('Pertenece a pnp')
              tpl_data_pnp($modal_body, 'Editar Socio', null, 'PNP', data_socio)

            } else {

              console.log('Pertenece a Fuerzas especiales')
              tpl_data_pnp($modal_body, 'Editar Socio', null, 'Fuerzas', data_socio)

            }
          })
        } 
        // else if(data_infoEdit === 'editDataCivil'){
        //   var $btn_moreInfo = $('.bt-aditional')
        //   $btn_moreInfo.css({'display': 'none'})
        //   $btn_update.removeClass('disabled')
        //   tpl_data_civil($modal_body, 'Editar Socio', null, data_socio)
        // } else if(data_infoEdit === 'editDataPNP') {
        //   var $btn_moreInfo = $('.bt-aditional')
        //   $btn_moreInfo.css({'display': 'none'})
        //   $btn_update.removeClass('disabled')
        //   if (data_socio.organizacion === 'PNP') {
        //     tpl_data_pnp($modal_body, 'Editar Socio', null, 'PNP', data_socio)
        //   } else {
        //     tpl_data_pnp($modal_body, 'Editar Socio', null, data_socio.organizacion, data_socio)
        //   }
        // } 
        else if(data_infoEdit === 'editDataWork'){

          var $btn_moreInfo = $('.bt-aditional')
          $btn_moreInfo.css({'display': 'none'})
          $btn_update.removeClass('disabled')
          tpl_data_work($modal_body, 'Editar Socio', null, data_socio)

        } else if(data_infoEdit === 'editDataContact'){

          var $btn_moreInfo = $('.bt-aditional')
          $btn_moreInfo.css({'display': 'none'})
          $btn_update.removeClass('disabled')
          tpl_data_contact($modal_body, 'Editar Socio', null, data_socio)

        } else if(data_infoEdit === 'editDataSpouse'){

          var $btn_moreInfo = $('.bt-aditional')
          $btn_moreInfo.css({'display': 'none'})
          $btn_update.removeClass('disabled')
          tpl_data_spouse($modal_body, 'Editar Socio', null, data_socio.datos_extra.conyuge)

        } else if(data_infoEdit === 'editDataAfiliatte'){

          var $btn_moreInfo = $('.bt-aditional')
          $btn_moreInfo.css({'display': 'none'})
          $btn_update.removeClass('disabled')
          tpl_data_afiliatte($modal_body, 'Editar Socio', null, data_socio)

        } else {

          console.log('corresponde a un template que al parecer no esta definido')
          console.log(data_infoEdit)

        }
      }

    })

    $btn_update.on('click', btnUpdate)

  }

  // Funcion Principal
  function main() {

    // Obteniendo Contenedor html
    var $boxConntentPage = $('.App_Container__box')
    var $boxConntentHtml = document.querySelector('#boxListUsers');
    var $ArticlesContainer = $('#App_Container').find('.Articles_containers');
    var $Filter_resize = document.getElementById('Filter_resize')
    var $EditInfo = $('.EditInfoData')
    var $ArticlesContainerPages = $('#App_Container').find('.Pagination');
    var $ViewboxRender = $('body')[0]

    var $txtBoxSearchByName = document.querySelector('#txt_box_search');
    var $btnBoxSearchByName = document.querySelector('#btn_box_search');
    var nameUserWord = '';

    var $btn_change_order = document.querySelector('.btn_change_order');

    var $type_partner = $('#type_partner');
    var $situation_partner = $('#situation_partner');
    var $type_payment = $('#type_payment');
    var $situation_work = $('#situation_work');
    var $letter_declaration = $('#letter_declaration');
    var $onomastic = $('#onomastic');
    var $newSocio = $('#newSocio');

    // Paginacion
    var limitePage = 10;

    // Reszise Filter
    if ($Filter_resize !== null) {

      $Filter_resize.addEventListener('click', resize)

    }

    // Lectura de Usuarios
    readUsers(limitePage, $boxConntentHtml);

    $txtBoxSearchByName.addEventListener('focus', function(){
      $('.searchContainer').css({'display': 'block'})
    })

    $txtBoxSearchByName.addEventListener('blur', function(){
      setTimeout(function(){
        $('.searchContainer').css({'display': 'none'})
      }, 150)
    })

    // Filtro por caja de texto by name - Por coincidencia de parte de la palabra
    $btnBoxSearchByName.addEventListener('click', function (ev) {

      let nameUser = $txtBoxSearchByName.value;
      var contentHTML = document.querySelector('.searchContainer')
      console.log('BUSQUEDA POR NOMBRE O DNI -> click');
      console.log(nameUser);
      searchByName(nameUser, contentHTML);

    })

    // Filtro por evento key: enter
    $txtBoxSearchByName.addEventListener('keypress', function (event) {
      let nameUser = $txtBoxSearchByName.value;
      console.log('BUSQUEDA POR NOMBRE O DNI -> keypress enter');
      var contentHTML = document.querySelector('.searchContainer')
      console.log(nameUser);
      if(event.charCode === 13) {
        searchByName(nameUser, contentHTML);
      }
    })

    //Activando estilo de caja de Filtros lateral
    $('select').material_select();

    // Filter mientras la caja de texto cambia
    $('#txt_box_search').bind('input', function() { 
      // if($(this).val() === '') {
      //   nameUserWord = '';
      //   readUsers($boxConntentHtml)
      // }

      nameUserWord = $(this).val()

      console.log('BUSQUEDA POR NOMBRE O DNI -> Input change');
      var contentHTML = document.querySelector('.searchContainer')
      console.log(nameUserWord);

      searchByName(nameUserWord, contentHTML);

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

    // Busqueda por Filtro
    function searchFilter(){

      workFilter(limitePage, $boxConntentHtml, $type_partner.val(), $situation_partner.val(), $type_payment.val(), $situation_work.val(), $letter_declaration.val(), $onomastic.val())

    }

    $type_partner.on('change', searchFilter)
    $situation_partner.on('change', searchFilter)
    $type_payment.on('change', searchFilter)
    $situation_work.on('change', searchFilter)
    $letter_declaration.on('change', searchFilter)
    $onomastic.on('change', searchFilter)

    //Creacion de Modal (crear socio)
    function createModal(){

      CreateFormSocio($boxConntentPage)

    }

    $newSocio.on('click', createModal)

    // Creacion de Modal (editar socio)
    function createModalEdit(){

      var data_info = $(this).attr('data-edit')
      CreateFormEditSocio($boxConntentPage, data_info)

    }

    $EditInfo.on('click', createModalEdit)

  }

  // Inicializando Lectura
  window.addEventListener('load', main)

})();
