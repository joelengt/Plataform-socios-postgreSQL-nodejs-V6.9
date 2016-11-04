myApp.factory('Socket', ['socketFactory', function(socketFactory){
	// return socketFactory()
	return socketFactory(
		{
			prefix: 'notifications',
			ioSocket: io.connect('/notificaciones-io')
		},
		// {
		// 	prefix: 'chat',
		// 	ioSocket: io.connect('/chat-io')
		// },
		{
			prefix: 'Track_one_user',
			ioSocket: io.connect('/tracking-io')
		}
	)
}])