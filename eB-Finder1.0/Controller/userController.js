/**
 * Controller for all user-related stuff
 */

 var fs = require('fs');
var Mustache = require('mustache');
var Mongoose = require('mongoose');
var connect = require('connect');
var ObjectId = Mongoose.Schema.ObjectId;

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
var tmpl_base404 = loadTemplateSync("base404");

// Sidebar
var tmpl_baseSidebar = loadTemplateSync("baseSidebar");
var tmpl_baseSidebarUser = loadTemplateSync("baseSidebarUser");
var tmpl_baseSidebarUserSettings = loadTemplateSync("baseSidebarUserSettings");
var tmpl_baseSidebarGroups = loadTemplateSync("baseSidebarGroups");

// Event
var tmpl_groupEvent = loadTemplateSync("groupEvent");
var tmpl_eventVote = loadTemplateSync("eventVote");
var tmpl_eventParticipants = loadTemplateSync("eventParticipants");

// User
var tmpl_user = loadTemplateSync("user");
var tmpl_userBaseFullscreen = loadTemplateSync("baseUserFullscreen");
var tmpl_userBase = loadTemplateSync("baseUser");
var tmpl_userCreated = loadTemplateSync("userCreated");
var tmpl_userRegister = loadTemplateSync("userRegister");
var tmpl_userLogin = loadTemplateSync("userLogin");
var tmpl_userSettings = loadTemplateSync("userSettings");

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
var UserController = {

	// Wenn keine user-session, dann zur login-seite
	loggedIn: function (res, req) {
		console.log("loggedIn called");


		if (req.session && req.session._id)
			return true;

		res.writeHead(302, {
		  'Location': '/login'
		});

		res.end();
        return false;
	},

	loginUser:  function (res, req) {
		console.log("loginUser called");

		 // Set up db-connection
        var db = Mongoose.connect(DB_NAME);
        Mongoose.connection.on('error', function() {});

         var callback = function (err, u) {
                if (err) {
                    console.log('error!!');
                    return false;
                }
                if (res === undefined) {
                    console.log('res is undef');
                    return false;
                }
                if (u == null) {
                    console.log('error getting from db');
                    res.end('User not Found!');
                    return false;
                }

				if (u.password != req.body.password) {
					console.log('password wrong');
                    res.end('falsches Passwort!');
                    return false;
				}

               var data = {
                    userName: u.userName,
                    _id: u._id
                };

				//var cookies = new Cookies( req, res, keys );
				//cookies.set( "user", u.userName, { signed: true } );

				//console.log(u._id);

				req.session.userName = u.userName;
				req.session._id = u._id;
				req.session.image = u.image;
				req.session.location = u.location;


                res.end("Erfolgreich eingeloggt.");

                Mongoose.disconnect();
            };
            User.findOne({ userName: req.body.userName }, callback);

	},

	/*
	* Fuer das registrieren eines users
	* POST
	*/
	createUser: function (res, req) {
		console.log("createUser called");

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		//console.log("body-Username: " + req.body["userName"]);
		//console.log("body: " + req.body);

		// TEST OUTPUT von request
		for (var key in req.body) {
			if (req.body.hasOwnProperty(key)) {
				console.log(key + " -> " + req.body[key]);
			}
		}

		var user = new User({
			userName: req.body.userName,
			password: req.body.password,
			email: req.body.email,
			settings: {
				emailAlert: false
			}
		});

		// check if username already exists
		User.findOne({ userName: req.body.userName }, function (err, u) {
                if (err) {
                    res.end('Es ist ein Fehler aufgetreten');
                    return false;
                }
                if (u != null) {
                 	 res.end('Der User-Name existiert bereits');
                 	 return false;
                }

              user.save(function (err) {
			          if (err) {
			            console.log('error saving in db ' + err);
			            res.end('Es ist ein Fehler aufgetreten!');
			            return false;
			          }


			         var callback = function (err, userDB) {
			                if (err) {
			                    console.log('error!!');
			                    return false;
			                }
			                if (userDB == null) {
			                    console.log('error getting from db');
			                    res.end('Error!');
			                    return false;
			                }

							req.session.userName = userDB.userName;
							req.session._id = userDB._id;

			                res.end('Erfolgreich registriert!');

			                Mongoose.disconnect();
			            };
			    User.findOne({ userName: req.body.userName }, callback);
		 });


        });


	},

	renderUser: function (res, req, user) {


	},

	// GET
	registerUser: function (res, req) {
		console.log("registerUser called");

		var html = Mustache.render(tmpl_userBaseFullscreen, {}, {
			"baseHead": tmpl_baseHead,
			"user": tmpl_userRegister
		});

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);

	},

	loginScreen: function (res, req) {
		console.log("loginScreen called");
		 // redirect to user
		 if (req.session &&  req.session._id) {
		 	res.writeHead(301,
			  {Location: '/'}
			);
			res.end();
		 }

		var html = Mustache.render(tmpl_userBaseFullscreen, {}, {
			"baseHead": tmpl_baseHead,
			"user": tmpl_userLogin
		});

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);

	},

	saveSettings: function (res, req) {
		console.log("saveSettings called");

		if (req.session) {
        	var id = req.session._id;
        }

        var db = Mongoose.connect(DB_NAME);
        Mongoose.connection.on('error', function() {});


        if (id) {

        	User.findOne({ _id: id }, function (err, user) {

	                if (err || user == null) {
	                    console.log('error!!');
	                    return false;
	                }

	                // *** E-Mail Test: ***
	                //UserController.sendMail(user, "Einstellungen geaendert", "deine Einstellungen wurden geaendert.");

	                console.log("req.body.email: " + req.body.email);
	                console.log("req.body.location: " + req.body.location);

					req.session.image = req.body.image;
					req.session.location = req.body.location;

	                user.update({
	                	email: req.body.email,
	                	location: req.body.location,
	                	image: req.body.image,
	                	settings: {
	                		emailAlert:  req.body.emailAlert
	                	}
	                }, function (err, numberAffected, raw) {
	                	 if (err) {
	                	 	res.end('Fehler!');
	                	 	return false;
	                	 }
	                	res.end('Erfolgreich gespeichert!');

	                });

                });
        }

	},

	getUserSettings:  function (res, req) {

		var init = function () {
			console.log("getUserSettings: init");
			if (req.session._id) {
				render();
			} else {
				res.end('Bitte anmelden!');
			}
		}

		var render = function (currentUserGroups) {
			console.log("getUserSettings: render");

			var eventId = null;
			var userId = req.session._id;

			UserController.getUserById(req, userId, eventId, function (data) {
				var html = Mustache.render(tmpl_userBase, data, {
					"baseHead": tmpl_baseHead,
					"sidebar": tmpl_baseSidebar,
					"sidebarUser": tmpl_baseSidebarUser,
					"sidebarUserSettings": tmpl_baseSidebarUserSettings,
					"sidebarContent": tmpl_baseSidebarGroups,
					"user": tmpl_userSettings
				});

				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(html);
			});
		}

		init();



/*

        if (req.session) {
        	var id = req.session._id;
        }

        var db = Mongoose.connect(DB_NAME);
        Mongoose.connection.on('error', function() {});

        // Send data and end response.
        if (id) {
            var callback = function (err, u) {
                if (err) {
                    console.log('error!!');
                    return false;
                }

                if (u == null) {
                    console.log('user not found');
                    res.end('No user found');
                    return false;
                }

				//console.log("Email" + u.email);

                var data = {
                    userName: u.userName,
                    id: u._id,
                    email: u.email,
                    emailAlert: u.settings.emailAlert,
                    location: u.location,
                    image: u.image,
                    userImage: u.image
                };

                var html = Mustache.render(tmpl_userBase, data, {
					"baseHead": tmpl_baseHead,
					"user": tmpl_userSettings
				});

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
                Mongoose.disconnect();
            };
            User.findOne({ _id: id }, callback);
            // ************************************** bis callback gegen getUserById tauschen.
        } else {
            res.end('Bitte anmelden!');
        }
*/
    },


	/********************/
	/* getUserById */
	/********************/
	// returns User with its Template!
	// So benutzen:
	// getUserById(req, 101001313, 19303131, function (data) {
	//			mach was mit html ...
	//	})
	getUserById: function (req, userId, eventId, callbackFn) {

		var init = function () {
			console.log("getUserById: init");
			if (!userId) {
				return null;
			} else {
				userGroups();
			}
		}

		var userGroups = function () {
			console.log("getUserById: userGroups");
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
					if(userGroup.userIds.indexOf(userId) >= 0) {
						currentUserGroups.push(userGroup);
					}
				});
				Mongoose.disconnect();
				userById(currentUserGroups);
			});
		}; // end: userGroups

		var userById = function (currentUserGroups) {
			console.log("getUserById: userById");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});
			User.findOne({ _id: userId }, function (err, user) {
				if (err) {
                    console.log('error!!');
                    return false;
                }
                if (user == null) {
                    console.log('user not found');
                     if (callbackFn) {
						callbackFn('User nicht gefunden.');
                     }
                    return false;
                }
			Mongoose.disconnect();
			userVotesByUserId(currentUserGroups, user);
			});
		}; // end: userById

		var userVotesByUserId = function (currentUserGroups, user) {
			console.log("getUserById: userVotesByUserId");
			var db = Mongoose.connect(DB_NAME);
			Mongoose.connection.on('error', function() {});
			UserVote.find({ userId:  userId }, function (err, votes) {
				if (err) {
					console.log('error beim laden von userVotes');
					return false;
				}
				// global votes
				var totalUpvotes = 0;
				var totalDownvotes = 0;
				// votes dieses event
				var upvotes = 0;
				var downvotes = 0;

				var currentUserAlreadyVoted = false;

				votes.forEach(function(vote) {
					totalUpvotes += vote.upvotes;
					totalDownvotes += vote.downvotes;
					if (vote.eventId == eventId) {
						upvotes += vote.upvotes;
						downvotes += vote.downvotes;
						// wenn schon gevotet wurde
						if (vote.voterId == req.session._id) {
							currentUserAlreadyVoted = true;
						}
					}
				});

				var result = totalUpvotes - totalDownvotes;
				var title = '';

				if (result <= 0)
				title = "Neuling";
				else if (result < 4)
				title = "Einsteiger";
				else if (result < 10)
				title = "Fortgeschrittener";
				else if (result < 20)
				title = "Aktiver";
				else if (result < 40)
				title = "Weltenwandler"
				else
				title = "Grossmuffti"

				if (result <= 0) {
					result = result;
				} else {
					result = "+" + result.toString();
				}

				Mongoose.disconnect();
				render(currentUserGroups, user, upvotes, downvotes, result, title, currentUserAlreadyVoted);
			});
		}; // end: userVotesByUserId

		var render = function (currentUserGroups, user, upvotes, downvotes, result, title, currentUserAlreadyVoted) {
			console.log("getUserById: render");
			var data = {
				id: user._id,
				userName: user.userName,
				userGroups: currentUserGroups,
				userImage: user.image,
				email: user.email,
				emailAlert: user.settings.emailAlert,
				upvotes: upvotes,
				downvotes: downvotes,
				result: result,
				title: title,
				image: user.image,
				location: user.location,
				eventId: eventId,
				votedNotYet: !currentUserAlreadyVoted
			};
			if (callbackFn) {
				callbackFn(data);
			}
		}

/*

		var callback = function (err, u) {
                if (err) {
                    console.log('error!!');
                    return false;
                }

                if (u == null) {
                    console.log('user not found');
                     if (callbackFn)
	                		callbackFn('User nicht gefunden.');
                    return false;
                }

				var callbackVotes = function (err, votes) {
	                if (err) {
	                    console.log('error beim laden von userVotes');
	                    return false;
	                }

					// global votes
					var totalUpvotes = 0;
					var totalDownvotes = 0;

					// votes dieses event
					var upvotes = 0;
					var downvotes = 0;

					var currentUserAlreadyVoted = false;

					votes.forEach(function(vote) {
			            
			            totalUpvotes += vote.upvotes;
						totalDownvotes += vote.downvotes;

						if (vote.eventId == eventId) {
							upvotes += vote.upvotes;
							downvotes += vote.downvotes;

							// wenn schon gevotet wurde
							if (vote.voterId == req.session._id) {
								currentUserAlreadyVoted = true;
							}
						}
			         });

					var result = totalUpvotes - totalDownvotes;

					var title = '';

					if (result <= 0)
					title = "Neuling";
					else if (result < 4)
					title = "Einsteiger";
					else if (result < 10)
					title = "Fortgeschrittener";
					else if (result < 20)
					title = "Aktiver";
					else if (result < 40)
					title = "Weltenwandler"
					else
					title = "Grossmuffti"

					if (result <= 0)
						result = result;
					else
						result = "+" + result.toString();



	                var data = {
	                    userName: u.userName,
	                    id: u._id,
	                    email: u.email,
	                    upvotes: upvotes,
	                    downvotes: downvotes,
	                    result: result,
	                    title: title,
	                    userImage: u.image,
	                    image: u.image,
	                    location: u.location,
	                    eventId: eventId,
	                    votedNotYet: !currentUserAlreadyVoted
	                };

					//console.log(data);

	                Mongoose.disconnect();

	                if (callbackFn)
	                	callbackFn(data);
	            };

            	// Wenn beim Event, gebe nur die Votes von diesem Event aus
            	//if (eventId) {
            	//	UserVote.find({ userId:  userId, eventId: eventId }, callbackVotes);
            	//} else {
            		UserVote.find({ userId:  userId }, callbackVotes);
            	//}

            };

            User.findOne({ _id: userId }, callback);
*/
			init();
	},

	// post
	voteUser: function (res, req) {
		console.log("voteUser called");

		var db = Mongoose.connect(DB_NAME);
		Mongoose.connection.on('error', function() {});

		var userVote = new  UserVote({
			userId: req.body.userId,
			voterId: req.session._id,
			eventId: req.body.eventId,
			upvotes: (req.body.isUpvote === 'true')? 1 : 0,
			downvotes: (req.body.isUpvote !== 'true')? 1 : 0,
		});

		userVote.save(function (err) {
			if (err) {
				console.log('error saving Vote in db ' + err);
				res.end('Es ist ein Fehler aufgetreten!');
				return false;
			}

			UserController.getUserById(req, req.body.userId, req.body.eventId, function (data) {
			var html = Mustache.render(tmpl_user, data);

			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
			Mongoose.disconnect();
			});
		});
	}, // end: voteUser()

	getUserByIdTempl: function  (res, req, userId, eventId) {
		console.log("getUserByIdTempl called");

		UserController.getUserById(req, userId, eventId, function (data) {
			var html = Mustache.render(tmpl_user, data);
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		});
	}, // end: getUserByIdTempl()

	getUser: function (res, req, eventId) {

		var init = function () {
			console.log("getUser: init");
			if (req.session._id) {
				render();
			} else {
				res.end('Bitte anmelden!');
			}
		}

		var render = function (currentUserGroups) {
			console.log("getUser: render");

			UserController.getUserById(req, req.session._id, eventId, function (data) {
				var html = Mustache.render(tmpl_userBase, data, {
					"baseHead": tmpl_baseHead,
					"sidebar": tmpl_baseSidebar,
					"sidebarUser": tmpl_baseSidebarUser,
					"sidebarUserSettings": tmpl_baseSidebarUserSettings,
					"sidebarContent": tmpl_baseSidebarGroups,
					"user": tmpl_user
				});

				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(html);
			});
		}

		init();
	}, // end: getUser()

	sendMail: function (user, subject, text) {
		console.log("sendMail called");

		var nodemailer = require("nodemailer");

		// create reusable transport method (opens pool of SMTP connections)
		var smtpTransport = nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "ebusi05@gmail.com",
		        pass: "ebusiness"
		    }
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "TeamFinder <ebusi05@gmail.com>", // sender address
		    to: user.email, // list of receivers
		    subject: subject, // Subject line
		    text: "Hallo " + user.userName + "\n\n" + text, // plaintext body
		   // html: "<b>Hello world </b>" // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
		    if(error){
		        console.log(error);
		    }else{
		        console.log("Message sent: " + response.message);
		    }

		    // if you don't want to use this transport object anymore, uncomment following line
		    smtpTransport.close(); // shut down the connection pool, no more messages
		});

    },

    // geht net
    getUserVotes: function(id) {

    	 var callback = function (err, votes) {
                if (err) {
                    console.log('error!!');
                    return false;
                }

                Mongoose.disconnect();

                return votes;
            };

            //console.log(id);

            UserVote.find({ userId: id }, callback);
    }, // end: getUserVotes()

	badRequest404: function (res, req) {
		var init = function () {
			console.log("badRequest404: init");
			render();
		}

		var render = function () {
			console.log("badRequest404: render");

			data = {};

			var html = Mustache.render(tmpl_base404, data, {
				"baseHead": tmpl_baseHead,
			});
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(html);
		}

		init();
	}, // end: badRequest404()

}; // ENDE

module.exports = {
    UserController: UserController
};
