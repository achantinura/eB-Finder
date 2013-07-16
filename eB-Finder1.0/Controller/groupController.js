//noch work in progress

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

// Group
var tmpl_groupCreate = loadTemplateSync("groupCreate");
var tmpl_groupBase = loadTemplateSync("baseGroup");
var tmpl_userGroup = loadTemplateSync("userGroup");
var tmpl_groupSingle = loadTemplateSync("groupSingle");
var tmpl_allGroup = loadTemplateSync("groupAll");

// Event
var tmpl_groupEvent = loadTemplateSync("groupEvent");
var tmpl_groupEventOverview = loadTemplateSync("groupEventOverview");

// User
var tmpl_user = loadTemplateSync("user");

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
var GroupController = {

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

	createGroupForm: function (res, req) {
		
		var init = function () {
			console.log('createGroupForm: init');
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
			console.log("createGroupForm: render");
			var data = {
				userId: req.session._id,
				userName : req.session.userName,
				userImage : req.session.image,
				userGroups: currentUserGroups,
			};
			var html = Mustache.render(tmpl_groupBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"group": tmpl_groupCreate
			});
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		};

		init();
	},

	createGroup: function (res, req) {
		console.log('called createGroup');

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		var check = function (err, g) {
			if (err) {
				res.end('Es ist ein Fehler aufgetreten');
				return false;
			}
			if (g != null) {
				res.end('Ein solches Gruppe existiert bereits');
				return false;
			}
		};

		var group = new Group({
			name: req.body.groupName,
			description: req.body.groupDescription,
			userIds: new Array(req.session._id),
		});


		group.save(function (err) {
			if (err) {
				console.log("save");
				console.log(err);
			}

			var callback = function (err, g) {
				if (err) {
					console.log('error!!');
					return false;
				}
				if (res === undefined) {
					console.log('res is undef');
					return false;
				}
				if (g == null) {
					console.log('error getting from db');
					res.end('Error!');
					return false;
				}

				res.end('Gruppe erfolgreich angelegt');
				Mongoose.disconnect();
			};

			Group.findOne({ name: req.body.groupName }, callback);
			
			
		});
	},

	// Join a group
	addUserGroup: function (res, req) {
		console.log('called addUserGroup');

		var groupId = req.body.groupId;

		var isGroupMember = false;

		if (req.session) {
			var userId = req.session._id;
		}

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		Group.update({_id: groupId }, { $push: {userIds: userId}},{upsert:true}, function (err) {
			if(err){
                console.log(err);
                res.end('Es ist ein Fehler aufgetreten.');
	        }else{
	            res.end('Gruppe beigetreten.');
	        }
		});
	},

	// Leave a group
	removeUserGroup: function (res, req) {
		console.log('called removeUserGroup');

		var groupId = req.body.groupId;

		var isGroupMember = false;

		if (req.session) {
			var userId = req.session._id;
		}

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		/*
		Group.findOne({_id: groupId}, function(err, group) {
			group.userIds(userId)
		});
		*/
		Group.update({_id: groupId }, { $pull: {userIds: userId}}, function (err) {
			if(err){
                console.log(err);
                res.end('Es ist ein Fehler aufgetreten.');
	        }else{
	            res.end('Gruppe verlassen.');
	        }
		});
	},

	getAllUserGroups: function (res, req) {
		console.log('called getAllUserGroups');

		var init = function () {
			console.log("getAllUserGroups: init");
			userGroups();
		}

		var userGroups = function () {
			console.log("getAllUserGroups: userGroups");
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
		}; // end: userGroups

		var render = function (currentUserGroups) {
			console.log("getAllUserGroups: render ");
			var data = {
				userGroups: currentUserGroups,
				userName : req.session.userName,
				userImage : req.session.image,
				userCount: function () {
				    return this.userIds.length;
				  }
			};
			var html = Mustache.render(tmpl_groupBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"group": tmpl_userGroup
			});
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		}; // end: render

		init();
	}, // end: getAllUserGroups()

	getAllGroups: function (res, req) {
		console.log('called getAllGroups');

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
			groupArray.forEach(function (group) {
				if(group.userIds.indexOf(req.session._id) >= 0) {
					currentUserGroups.push(group);
				}
			});

			var data = {
				userGroups: currentUserGroups,
				allGroups : groupArray,
				userName : req.session.userName,
				userImage : req.session.image,
				userCount: function () {
				    return this.userIds.length;
				  }
			};
			var html = Mustache.render(tmpl_groupBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"group": tmpl_allGroup
			});

			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
			Mongoose.disconnect();
		});
	},

	getGroupById: function (groupId, res, req) {

		var init = function () {
			console.log('getGroupById: init');
			userGroups();
		}

		var userGroups = function () {
			console.log("getGroupById: userGroups");
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
				groupById(currentUserGroups);
			});
		}; // end: userGroups

		var groupById = function (currentUserGroups) {
			console.log("getGroupById: groupById");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});
			Group.findOne({_id : groupId}, function (err, group) {
				if (err) {
					console.log("singleGroup");
					console.log(err);
					return false;
				}
				if (group == null ) {
					console.log('group not found');
					return false;
				}
				Mongoose.disconnect();
				groupEvents(currentUserGroups, group);
			});
		}; // end: groupById

		var groupEvents = function (currentUserGroups, group) {
			console.log("getGroupById: groupEvents");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});
			GroupEvent.find({ groupId: group._id }, function (err, events) {
				if (err) {
					console.log("singleGroup - loading event");
					console.log(err);
					return false;
				}
				if (events == null ) {
					console.log('group not found');
					return false;
				}
				Mongoose.disconnect();
				render(currentUserGroups, group, events);
			});
		}; // end: groupEvents

		var render = function (currentUserGroups, group, events) {
			console.log("getGroupById: render");

			var data = {
				userId: req.session._id,
				userName : req.session.userName,
				userImage : req.session.image,
				userGroups: currentUserGroups,
				_id: group._id,
				name : group.name,
				description : group.description,
				userIds : group.userIds,
				isMemberOfGroup : group.userIds.indexOf(req.session._id) >= 0,
				event: events,
				eventsCount: function () {
					if (events < 0) {
						return null;
					} else if (events == 0) {
						return "aber noch keine";
					} else {
						return "und " + events.length;
					}
				},
				userCount: function () {
					return this.userIds.length;
				},
			};

			var html = Mustache.render(tmpl_groupBase, data, {
				"baseHead": tmpl_baseHead,
				"sidebar": tmpl_baseSidebar,
				"sidebarUser": tmpl_baseSidebarUser,
				"sidebarUserSettings": tmpl_baseSidebarUserSettings,
				"sidebarContent": tmpl_baseSidebarGroups,
				"group": tmpl_groupSingle,
				"event": tmpl_groupEventOverview,
			});
			res.writeHead(200, { 'Content-Type' : 'text/html' });
			res.end(html);
		}; // end: render

		init();

	}, // end: getGroupById
};

module.exports = {
	GroupController: GroupController
};
