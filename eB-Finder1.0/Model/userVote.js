/*
* 	Dient zum reddit-likem Bewerten eines einzelnen Users, der bei einem Event mitgemacht hat.
*/

var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var userVoteSchema = mongoose.Schema({
   // _id: ObjectId,
    userId: ObjectId,
    voterId: ObjectId,
    eventId: ObjectId,
    upvotes: Number,
    downvotes: Number
});

var UserVote = mongoose.model('UserVote', userVoteSchema);

module.exports = {
    UserVote: UserVote
};
