/**
 * User Module 
 */

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;
 
var userSchema = mongoose.Schema({
    	//_id : ObjectId,
	groupIds: [Number],
	userName: { type: String, unique: true },
	password: String,
	email: String,
	location: String,
	image: String,
	settings: {
		notification: Number,
		emailAlert: Boolean
		// weitere
	}
});

var User = mongoose.model('User', userSchema);

		
module.exports = {
  User: User
}
