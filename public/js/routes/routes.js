myApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: './templates/home/index.html',
			controller: 'userController'
		})
		.when('/forgetpassword', {
			templateUrl: './templates/forgetPassword/index.html',
			controller: 'forgetPassword'
		})
		.when('/dashboard', {
			templateUrl: './templates/dashboard/index.html',
			controller: 'dashboardController',
			authenticated: true
		})
		.when('/dashboard/order/:id', {
			templateUrl: './templates/order_worker/index.html',
			controller: 'orderWorkController',
			authenticated: true
		})
		.when('/users', {
			templateUrl: './templates/users/index.html',
			controller: 'userControllers',
			authenticated: true
		})
		.when('/kml', {
			templateUrl: './templates/kml/index.html',
			controller: 'kmlController',
			authenticated: true
		})
		.when('/logout', {
			templateUrl: './templates/logout/index.html',
			controller: 'orderWorkController',
			authenticated: true
		})
		.otherwise({
			redirectTo: '/404',
			templateUrl: './templates/404/index.html'
		})
}])
myApp.run(['$rootScope', '$location', 'userModel', function($rootScope, $location, userModel){
	$rootScope.$on('$routeChangeStart', function(event, next, current){
		if (next.$$route.authenticated) {
			if (!userModel.getAuthStatus()) {
				$location.path('/')
			}
		}
		if (next.$$route.originalPath == '/') {
			console.log('Login Page');
			if (userModel.getAuthStatus()) {
				$location.path(current.$$route.originalPath)
			}
		}
	})
}])