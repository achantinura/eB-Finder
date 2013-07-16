var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var groupSchema = mongoose.Schema({
    //id: ObjectId,
	name: String,
	description: String,
	userIds: [ObjectId],
	googlePlusApiReference: String
});

var Group = mongoose.model('Group', groupSchema);


module.exports = {
  Group: Group
};
