myApp.factory('Auth', ['$http', '$q', 'AuthToken', function($http, $q, AuthToken){
	var authFactory = {}

	authFactory.login = function(username, password){
		return $http.post('/auth/dashboard', {
			username: username,
			password: password
		})
		.success(function(data){
			AuthToken.setToken(data.token)
			return data
		})
	}

	authFactory.logout = function(){
		AuthToken.setToken()
	}

	authFactory.isLoggedIn = function(){
		if (AuthToken.getToken) {
			return true
		} else {
			return false
		}
	}

	authFactory.getUser = function(){
		if (AuthToken.getToken()) {
			return $http.get()
		}
	}
}])