myApp.controller('forgetPassword', ['$scope', '$http', 'Loader', function($scope, $http, Loader){
	angular.extend($scope, {
		doLogin: function(loginForm){
			// console.log($scope.data)
			var data = {
				email: $scope.data.email,
				dni: $scope.data.dni.toString()
			}
			console.log(data)
			// $('.ErrorLogin').html('')
			$('.ErrorLogin').html('')
			Loader.create('.ErrorLogin', 'Login')
			$http({
				method:'POST',
				url:'/get-my-access/send_email/send',
				data: data
			}).then(function(res){
				console.log(res)
				var template = `<p style="color: #a9a8a8">${res.data.message}</p>`
				$('.ErrorLogin').html(template)
				Loader.delete('.ErrorLogin', 'Login')
				// console.log('XD')
			}, function(err){
				Loader.delete('.ErrorLogin', 'Login')
				console.log(err)
				var template = `<p style="color: #e20000">${err.data.message}</p>`
				$('.ErrorLogin').html(template)
			})
		}
	})
	$('#number').on('keypress', validar)
	function validar(){
		nombre=$(this).val()		
	   //Comprobamos la longitud de caracteres
		if (nombre.length<8){
			return true;
		}
		else {
			return false;
			
		}
	}
}])