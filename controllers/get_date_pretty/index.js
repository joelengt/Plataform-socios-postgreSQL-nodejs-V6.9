
function GetDatePretty(date_send, cb) {
    var RTime = new Date(date_send)
    var month = RTime.getMonth() + 1   // 0 - 11 *
    var day = RTime.getDate()          // 1- 31  *
    var year = RTime.getFullYear()     // año   *

    // Lectura de fecha por dia, y 24h
    var date_template = ''

    // console.log('No es de hoy')
    date_template = `${ year }-${ month }-${ day }`;

    cb(date_template)

}

module.exports = GetDatePretty

