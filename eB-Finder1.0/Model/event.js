var groupEvent = {
};

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var groupEventSchema = mongoose.Schema({
	name: String,
	location: String, // String
	date: String,
	dateDay: String,
	dateMonth: String,
	dateYear: String,
	startDateMax: Number,
	endDateMax: Number,
	startDateMin: Number,
	endDateMin: Number,
	createUserId: ObjectId,
	userCount: Number,
	groupId: [ObjectId],
	voteIds: [ObjectId],
	eventComments: [{
		userId: ObjectId,
		userName: String,
		commentText: String
		//timestamp: { type: String, default: (new Date()).getTime() }
	}],
	eventVotes: [{
		userId: ObjectId,
		upvotes: Number,
		downvotes: Number
	}]
});

var GroupEvent = mongoose.model('GroupEvent', groupEventSchema);

module.exports = {
	GroupEvent: GroupEvent
};
