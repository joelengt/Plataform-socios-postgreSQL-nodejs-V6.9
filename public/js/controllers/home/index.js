myApp.controller('userController', ['$scope', 'userModel', '$location', 'Loader', function($scope, userModel, $location, Loader){
	angular.extend($scope, {
		doLogin: function(loginForm){
			console.log($scope.login)
			var data = {
				username: $scope.login.username,
				password: $scope.login.password
			}
			$('.ErrorLogin').html('')
			Loader.create('.ErrorLogin', 'Login')
			userModel.doLogin(data).then(function(res){
				// console.log(res)				
				$location.path('/dashboard')
				Loader.delete('.ErrorLogin', 'Login')
				// console.log('XD')
			}, function(err){
				Loader.delete('.ErrorLogin', 'Login')
				var template = `<p>${err.data.message}</p>`
				$('.ErrorLogin').html(template)
			})
		}
	})
}])