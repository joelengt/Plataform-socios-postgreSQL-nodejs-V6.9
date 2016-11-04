var mongoose = require('mongoose')
var Schema = mongoose.Schema

var trackingUserSchema = new Schema({
	user_id: { type: String },
	track_info: [{
		date:  { type: String },
		coordX: { type: String },
		coordY: { type: String }
	}]
})

var tracking = mongoose.model('tracking', trackingUserSchema)

module.exports = tracking

