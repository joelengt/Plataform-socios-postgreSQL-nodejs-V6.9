myApp.factory('Loader', [ function(){
	var Loader = {}

	Loader.create = function(element, id){
		console.log('se creo '+element)
		console.log($(element + ' .'+id))
		if (document.getElementById('Loader'+id) === null) {
			var loader = document.createElement('div')
			loader.setAttribute('class','Loader '+id)
			loader.setAttribute('id','Loader'+id)

			var template = `<div class="Loader__content spinner">
												<div class="double-bounce1"></div>
												<div class="double-bounce2"></div>
											</div>`
			loader.innerHTML = template
			$(element).append(loader)
		}
	}

	Loader.delete = function(element, id){
		console.log('se elimino '+element)
		// console.log($(element + '.Loader'))
		$(element + ' .'+id).remove()
	}

	return Loader
}])