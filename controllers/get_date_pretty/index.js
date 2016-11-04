
function GetDatePretty(date_send, cb) {
	var RTime = new Date(date_send)
	var month = RTime.getMonth() + 1   // 0 - 11 *
	var day = RTime.getDate()          // 1- 31  *
	var year = RTime.getFullYear()     // año   *
	var hour = RTime.getHours()		   // 0 - 23  *
	var min  = RTime.getMinutes()      // 0 - 59
	var sec =  RTime.getSeconds()      // 0 - 59

	// Validando el mes 
	var month_string = ''
	if(month === 1) {
		month_string = 'enero'

	} else if (month === 2) {
		month_string = 'febrero'

	} else if (month === 3) {
		month_string = 'marzo'

	} else if (month === 4) {
		month_string = 'abril'

	} else if (month === 5) {
		month_string = 'mayo'

	} else if (month === 6) {
		month_string = 'junio'

	} else if (month === 7) {
		month_string = 'julio'

	} else if (month === 8) {
		month_string = 'agosto'

	} else if (month === 9) {
		month_string = 'septiembre'

	} else if (month === 10) {
		month_string = 'octubre'

	} else if (month === 11) {
		month_string = 'noviembre'

	} else if (month === 12) {
		month_string = 'diciembre'

	} else {
		month_string = String(month)
	}

	// Lectura de fecha por dia, y 24h
	var date_template = ''

	var today = new Date()

	var today_day = today.getDate()
	var today_month = today.getMonth() + 1
	var today_year = today.getFullYear() 
	var today_hour = today.getHours()
	var today_min = today.getMinutes()
	var today_sec = today.getSeconds()

	// Validando si es hoy y en menos de 24h
	if( Number(day) === Number(today_day) && 
	    Number(month) === Number(today_month)  &&
	    Number(year) === Number(today_year) ) {				   
		
		// console.log(' es de hoy ')

		// Filtrando por hora
		if(hour < today_hour) {
			
			// mostrando horas
			hour = today_hour - hour
			date_template = ' hace ' + hour + 'h' 

		} else if ( hour === today_hour && min < today_min ) {
			
			// mostrar minutos
			min = today_min - min
			date_template = ' hace ' + min + 'min'


		} else if ( hour === today_hour && min === today_min ) {

			// mostrar segundos
			sec =  today_sec - sec
			date_template = ' hace ' + sec + 'sec'

		} else {
			// mostrando fechas por defecto
			date_template = ' hace ' + hour + 'h' + min + ':' + sec

		}

	} else {
		// console.log('No es de hoy')
		date_template = day + ' de ' + month_string + ' a las ' + hour + ':' + min + ':' + sec

	}

	cb(date_template)

}

module.exports = GetDatePretty

