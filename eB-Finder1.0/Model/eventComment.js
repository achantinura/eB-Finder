var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var eventCommentSchema = mongoose.Schema({
    userId: ObjectId,
    eventId: ObjectId,
    commentText: String,
    timestamp: { type: String, default: (new Date()).getTime() }
});

var eventComment = mongoose.model('eventComment', eventCommentSchema);

module.exports = {
		eventComment: eventComment
};
