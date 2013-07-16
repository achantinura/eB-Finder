var fs = require('fs');
var Mustache = require('mustache');
var Mongoose = require('mongoose');
var connect = require('connect');
var ObjectId = Mongoose.Schema.ObjectId;
var UserController = require('../Controller/userController.js').UserController;

/********************/
/* Constants */
/********************/
var TEMPLATE_SUFFIX = ".mustache.html";
var DB_NAME = "mongodb://localhost/test";

/********************/
/* Templates */
/********************/
var tmpl_base = loadTemplateSync("base");
var tmpl_baseHead = loadTemplateSync("baseHead");

// Sidebar
var tmpl_baseSidebar = loadTemplateSync("baseSidebar");
var tmpl_baseSidebarUser = loadTemplateSync("baseSidebarUser");
var tmpl_baseSidebarUserSettings = loadTemplateSync("baseSidebarUserSettings");
var tmpl_baseSidebarGroups = loadTemplateSync("baseSidebarGroups");

// User
var tmpl_user = loadTemplateSync("user");

// Event
var tmpl_eventBase = loadTemplateSync("baseEvent");
var tmpl_groupEvent = loadTemplateSync("groupEvent");
var tmpl_eventVote = loadTemplateSync("eventVote");
var tmpl_eventParticipants = loadTemplateSync("eventParticipants");
var tmpl_eventCreate = loadTemplateSync("eventCreate");
var tmpl_eventComments = loadTemplateSync("eventComments");
var tmpl_groupEventSingle = loadTemplateSync("groupEventSingle");

/********************/
/* Models */
/********************/
var User = require('../Model/user.js').User;
var Group = require('../Model/group.js').Group;
var GroupEvent = require('../Model/event.js').GroupEvent;
var Vote = require('../Model/vote.js').Vote;
var UserVote = require('../Model/userVote.js').UserVote;


/********************/
/* Helper */
/********************/
function loadTemplateSync(templateName) {
	return fs.readFileSync("./Public/html/" + templateName + TEMPLATE_SUFFIX, "utf8");
}

/********************/
/* Logik */
/********************/
var EventController = {

	// Wenn keine user-session, dann zur login-seite
	loggedIn: function (res, req) {
		console.log('called loggedIn');

		if (req.session && req.session._id) {
			return true;
		}
		res.writeHead(302, {
			'Location': '/login'
		});
		res.end();
		return false;
	},

	createEventForm: function (res, req, groupId) {
		
		
		
		var init = function () {
			console.log('createEventForm: init');
			userGroups();
		}

		var userGroups = function () {
			console.log("createGroupForm: userGroups");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});
			Group.find({}, function(err, groupArray) {
				if (err) {
					console.log('error!!');
					return false;
				}
				if (groupArray == null) {
					console.log('group not found');
					return false;
				}
				// get all Groups for currend user
				var currentUserGroups = new Array();
				groupArray.forEach(function (userGroup) {
					if(userGroup.userIds.indexOf(req.session._id) >= 0) {
						currentUserGroups.push(userGroup);
					}
				});
				Mongoose.disconnect();
				render(currentUserGroups);
			});
		};

		var render = function (currentUserGroups) {
			console.log('createEventForm: render');
			var data = {
				userId: req.session._id,
				userName : req.session.userName,
				userImage : req.session.image,
				userGroups: currentUserGroups,
				groupId: groupId
			};

			var html = Mustache.render(tmpl_eventBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"event": tmpl_eventCreate
			});

			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		};

		init();
	},

	createEvent: function (res, req) {
		console.log('called createEvent');
		
		var groupId = req.body.groupId;
		
		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		var vote = new Vote({
			user: {
				userId: req.session._id,
				userName: req.session.userName
			},
			startDate: req.body.voteStartDateMinute,
			endDate: req.body.voteEndDateMinute,
			start: req.body.voteStartDate,
			end: req.body.voteEndDate
		});

		console.log("vor save");
		console.log(vote._id);

		var check = function (err, e) {
			if (err) {
				res.end('Es ist ein Fehler aufgetreten');
				return false;
			}
			if (e != null) {
				res.end('Ein solches Event existiert bereits');
				return false;
			}
		};

		vote.save(function (err, v) {
			if (err) {
				console.log("vote.save");
				console.log(err);
			}
			//console.log(v._id);
		}); // end: vote.save
		console.log('nach save vote');
		console.log(vote._id);

		var groupEvent = new GroupEvent({
			name: req.body.eventName,
			location: req.body.eventLocation,
			date: req.body.eventDate,
			createUserId: req.session._id,
			voteIds: new Array(),
			eventComments: new Array(),
			userCount: 1,
			groupId: req.body.groupId
		});
		
		groupEvent.voteIds.push(vote._id);
		
		var dateMonthString,
			dateDayString;
			
		var dateSplit = groupEvent.date.split("-");
		
		var months = {
			"01": "Jan.",
			"02": "Feb.",
			"03": "März",
			"04": "Apr.",
			"05": "Mai",
			"06": "Juni",
			"07": "Juli",
			"08": "Aug.",
			"09": "Sep.",
			"10": "Okt.",
			"11": "Nov.",
			"12": "Dez."
		};
		
		dateMonthString = months[dateSplit[1]];
		dateDayString = dateSplit[2] + ".";
		groupEvent.dateDay = dateDayString;
		groupEvent.dateMonth = dateMonthString;
		groupEvent.dateYear = dateSplit[0];
		
		GroupEvent.findOne({ name: req.body.name }, check);
	
		groupEvent.save(function (err) {
			if (err) {
				console.log("save");
				console.log(err);
			}
	
			var callback = function (err, e) {
				if (err) {
					console.log('error!!');
					return false;
				}
				if (res === undefined) {
					console.log('res is undef');
					return false;
				}
				if (e == null) {
					console.log('error getting from db');
					res.end('Error!');
					return false;
				}
	
				res.end('Event erfolgreich angelegt');
				Mongoose.disconnect();
			};
	
			GroupEvent.findOne({ name: req.body.eventName }, callback);
		}); // end: groupEvent.save
		
		console.log("GroupId " + groupId);
		
		
		
		// Notification, can be asynchronious
		if (groupId || groupId != '') {
		
			console.log('called send notification');
		
			Group.findOne({ _id: groupId }, function (err, group) {
							if (err) {
								console.log('loading group after event');
								return false;
							}
							if (group == null) {
								console.log('group not found');
								return false;
							}
							
							console.log('called send notification / group: ' + group);
							
							group.userIds.forEach(function (userId) {
								
								User.findOne({_id: userId}, function (err2, user) {
								
									console.log('called send notification / user: ' + user);
								
									if (err2) {
										console.log('loading user after event');
										return false;
									}
									if (user == null) {
										console.log('user not found');
										return false;
									}
									
									if (user.settings.emailAlert) {
										UserController.sendMail(user, 'Neues Event in Gruppe ' + group.name, 
										'Ein neues Event wurde in der Gruppe ' + group.name + ' gepostet.') 
									}
								
								})
								
							});
							
			});
		
		
		
		}
		
	}, // end: createEvent roup.update({_id: groupId }, { $push: {userIds: userId}},{upsert:true}, function (err) {

	voteEvent: function (res, req) { 
	
		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});
	
		GroupEvent.update({_id: req.body.eventId }, { $push: {eventVotes: {
															userId: req.session._id,
															upvotes: (req.body.isUpvote === 'true')? 1 : 0,
															downvotes: (req.body.isUpvote !== 'true')? 1 : 0
														} } }, {upsert:true}, function (err) {
			res.end('Erfolgreich abgestimmt.');
			Mongoose.disconnect();
		});
	
	},

	getAllEvents: function (res, req) {
		console.log('called getAllEvents');

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		GroupEvent.find({createUserId: req.session._id}, function(err, e) {
			if (err) {
				console.log('error!!');
				return false;
			}
			if (e == null) {
				console.log('event not found');
				return false;
			}

			var data = {
				event : e,
				userName : req.session.userName,
				userImage : req.session.image
			}
		
		
		
			console.log('in vote.find');
			if (err) {
				console.log(err);
				return false;
			}

			var html = Mustache.render(tmpl_eventBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"event": tmpl_groupEvent,
				"eventVote": tmpl_eventVote
			});

			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
			Mongoose.disconnect();
		
			
		}); // end: GroupEvent.find
	}, // end: getAllEvents
	
	createComment: function (res, req){
		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});
		
		GroupEvent.findOne({_id: req.body.eventId}, function (err, e) {
			e.eventComments.push({
				userId: req.session._id,
				userName: req.session.userName,
				commentText: req.body.commentText
			});
			e.save(function (err, ev) {
				if (err) {
					console.log('err bei e.save');
					return false;
				}
			});
			
			var data = {
				event: e
			};
			var html = Mustache.render(tmpl_eventBase, data, {
				"event": tmpl_groupEvent,
				"eventVote": tmpl_eventVote,
				"eventComments": tmpl_eventComments
			});
			res.end(req.session.userName);
			Mongoose.disconnect();
		});
		
/*		console.log(req.body.eventId);
		console.log(req.session._id);
		console.log(req.session.userName);*/
	},

	createVote: function (res, req) {
		console.log('called createVote');
		var id = req.body.id;
		
		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});
		
		GroupEvent.findOne({_id : id}, function (err, e) {
			if (err) {
				console.log('err');
				
			}
			if (e === null) {
				console.log('eve ist null');
			}
			
			UserController.getUserById(req, req.session._id, id, function (nUser) {
				var vote = new Vote({
					user: {
						userId: req.session._id,
						userName: nUser.userName
					},
					startDate: req.body.voteStartDateMinute,
					endDate: req.body.voteEndDateMinute,
					start: req.body.voteStartDate,
					end: req.body.voteEndDate
				});
				console.log(vote.user);
				
				vote.save(function (err, v) {
					if (err) {
						console.log("vote.save");
						console.log(err);
					}
				});
				var userCount = e.userCount;
				e.userCount = userCount + 1;
				e.voteIds.push(vote._id);
				e.save(function (err, ev) {
					if (err) {
						console.log('err bei e.save');
						return false;
					}
				});
				var data = {
					event: e
				};
				
				var html = Mustache.render(tmpl_eventBase, data, {
					"event": tmpl_groupEvent,
					"eventVote": tmpl_eventVote
				});
				res.end(html);
				Mongoose.disconnect();
			});
			
		});
	},
	
	getJsonUser: function (res, req) {
		if (req.session) {
			var userId = req.session._id;
			console.log(userId);
		}
		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});
		if (userId) {
			UserController.getUserById(req, userId, eventId, function (data) {
			res.writeHead( 200, { 'Content-Type': 'application/json' } );
				res.end(data);
				Mongoose.disconnect();
			});
		} else {
			return null;
		}
	}, // end: getJsonUser()

	getEventById: function (eventId, res, req) {

		var init = function () {
			console.log('getEventById: init');
			userGroups();
		}

		var userGroups = function () {
			console.log("getEventById: userGroups");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});

			Group.find({}, function(err, groupArray) {
				if (err) {
					console.log('error!!');
					return false;
				}
				if (groupArray == null) {
					console.log('group not found');
					return false;
				}
				// get all Groups for currend user
				var currentUserGroups = new Array();
				groupArray.forEach(function (userGroup) {
					if(userGroup.userIds.indexOf(req.session._id) >= 0) {
						currentUserGroups.push(userGroup);
					}
				});
				Mongoose.disconnect();
				eventById(currentUserGroups);
			});
		};

		var eventById = function (currentUserGroups) {
			console.log("getEventById: eventById");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});

			GroupEvent.findOne({_id : eventId}, function (err, event) {
				if (err) {
					console.log("singleEvent");
					console.log(err);
					return false;
				}
				if (event == null ) {
					console.log('event not found');
					return false;
				}
				
				var data = {};
				
				var totalUpvotes = 0;
				var totalDownvotes = 0;
				var currentUserVoted = false;
				
				// count votes of group
				event.eventVotes.forEach(function(vote) {
					totalUpvotes += vote.upvotes;
					totalDownvotes += vote.downvotes;

					if (vote.userId == req.session._id) {
						currentUserVoted = true;
					}
				});
				
				data.upvotes = totalUpvotes;
				data.downvotes = totalDownvotes;
				data.notVoted = !currentUserVoted;
				data.userId = req.session._id;
				data.userlocation = (req.session.location == '' || req.session.location == null || req.session.location == undefined)? null:req.session.location;

				Mongoose.disconnect();
				votesByVoteId(currentUserGroups, event, data);
			}); // end: GroupEvent.findOne
		};
		
		var votesByVoteId = function (currentUserGroups, event, data) {
			console.log("getEventById: votesByVoteId");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});

			Vote.find({_id: { $in: event.voteIds}}, function(err, voteArray) {
				data.event = event;
				data.votes = voteArray;
				
				//console.log("Data of vote: \n" + voteArray);

				var userIds = [];
				voteArray.forEach(function (vote) {
					userIds.push(vote.user.userId);
					//console.log("User Id added: " + vote.user.userId);
				});
				data.users = userIds;

				Mongoose.disconnect();
				render(currentUserGroups, event, data);
			});
		};

		var render = function (currentUserGroups, event, data) {

			data.userName = req.session.userName;
			data.userImage = req.session.image;
			data.userGroups = currentUserGroups;

			var html = Mustache.render(tmpl_eventBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"event": tmpl_groupEventSingle,
				"eventVote": tmpl_eventVote,
				"eventComments": tmpl_eventComments,
				//"user" :tmpl_user
			});

			res.writeHead(200, { 'Content-Type' : 'text/html' });
			res.end(html);
		};

		init();
	
	}, // end: getSingleEvent





};

module.exports = {
	EventController: EventController
};
