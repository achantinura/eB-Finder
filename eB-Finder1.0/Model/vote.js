var vote = {
};

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var voteSchema = mongoose.Schema({
	user: {
		userId: ObjectId,
		userName: String,
	},
    //userId: ObjectId,
    startDate: Number,
    endDate: Number,
    start: String,
    end: String
});

var Vote = mongoose.model('Vote', voteSchema);

module.exports = {
    Vote: Vote
};
