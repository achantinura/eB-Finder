/* See: https://github.com/flatiron/director */

// Imports
var fs = require('fs');
var Director = require('director');
var Controller = require('../Controller/controller.js').Controller;
var UserController = require('../Controller/userController.js').UserController;
var EventController = require('../Controller/eventController.js').EventController;
var GroupController = require('../Controller/groupController.js').GroupController;

// le Router
var Router = new Director.http.Router({
	'/': {
		get: function() {
			if (UserController.loggedIn(this.res, this.req)) {
				GroupController.getAllUserGroups(this.res, this.req);
			}
		}
	},
	'/group': {
		'/': {
			get: function () {
				if (UserController.loggedIn(this.res, this.req)) {
					GroupController.getAllGroups(this.res, this.req);
				}
			}
		},
		'/mygroups': {
		get: function() {
			if (UserController.loggedIn(this.res, this.req)) {
				GroupController.getAllUserGroups(this.res, this.req);
			}
			}
		},
		'/join': {
			post: function () {
				if (UserController.loggedIn(this.res, this.req)) {
					GroupController.addUserGroup(this.res, this.req);
				}
			}
		},
		'/leave': {
			post: function () {
				if (UserController.loggedIn(this.res, this.req)) {
					GroupController.removeUserGroup(this.res, this.req);
				}
			}
		},
		'/create': {
			get: function () {
				if (UserController.loggedIn(this.res, this.req)) {
					GroupController.createGroupForm(this.res, this.req);
				}
			},
			post: function () {
				if (UserController.loggedIn(this.res, this.req)) {
					GroupController.createGroup(this.res, this.req);
				}
			}
		},
		'/:id': {
			get: function(id) {
				if (UserController.loggedIn(this.res, this.req))
					//GroupController.getSingleGroup(id, this.res, this.req);
					GroupController.getGroupById(id, this.res, this.req);
			}
		}
	},
    '/user': {
      '/' : {

            get: function() {
            	if (UserController.loggedIn(this.res, this.req)) // checken ob user eingeloggt ist
               		UserController.getUser(this.res, this.req);
            }
       	},
    	'/json': {
			get: function () {
				if (UserController.loggedIn(this.res, this.req)) {
               		UserController.getUser(this.res, this.req);
               	} else {
               		UserController.getJsonUser(this.res, this.req);
               	}
			}    	
    	},
       	'/settings' : {
       		get: function() {
            	if (UserController.loggedIn(this.res, this.req)) // checken ob user eingeloggt ist
               		UserController.getUserSettings(this.res, this.req);
            },
            post: function () {
            	UserController.saveSettings(this.res, this.req);
            }
       	},
       	'/logout' : {

       		get: function () {
       			if (UserController.loggedIn(this.res, this.req)) {
       				this.req.session.destroy(function(err){
       					console.log(err);
       				}); // deletes session
       				UserController.loggedIn(this.res, this.req); // redirect to login
       			}
       		}

       	},
       	'/vote' : {
       		// Reddit-Style bewertung eines users
       		post: function () {
       			if (UserController.loggedIn(this.res, this.req)) {
       				UserController.voteUser(this.res, this.req); // redirect to login
       			}
       		}

       	},
       	'/:eventid': {
			'/:userid': {
				'/' : {
				get: function(eventid, userid) {
					if (UserController.loggedIn(this.res, this.req))
						UserController.getUserByIdTempl(this.res, this.req, userid, eventid);
					}
				}
			}
		}
    },
	'/event': {
		'/' : {
			get: function() {
				if (UserController.loggedIn(this.res, this.req)) // checken ob user eingeloggt ist
				EventController.getAllEvents(this.res, this.req);
			}
		},
		'/vote' : {
       		// Reddit-Style bewertung eines users
       		post: function () {
       			if (UserController.loggedIn(this.res, this.req)) {
       				EventController.voteEvent(this.res, this.req); // redirect to login
       			}
       		}
       	},
		'/createComment' : {
       		post: function () {
       			if (UserController.loggedIn(this.res, this.req)) {
       				EventController.createComment(this.res, this.req); 
       			}
       		}
       	},
		'/create' : {
			get: function() {
				EventController.createEventForm(this.res, this.req);
			},
			post: function() {
				EventController.createEvent(this.res, this.req);
			},
			'/:id': { // <- groupId
			get: function(id) {
				if (UserController.loggedIn(this.res, this.req))
					EventController.createEventForm(this.res, this.req, id);
			}
		}
		},
		'/createVote' : {
			post: function() {
				EventController.createVote(this.res, this.req);
			}
		},
		'/:id': {
			get: function(id) {
				//EventController.getSingleEvent(id, this.res, this.req);
				if (UserController.loggedIn(this.res, this.req)) {
					EventController.getEventById(id, this.res, this.req);
				}
			}
		}
	},
   '/login': {
         '/register' : {
        	post: function () {
            	UserController.createUser(this.res, this.req);
            },
            get: function () {
            	UserController.registerUser(this.res, this.req);
            }
        },
        '/' : {
        	post: function () {
            	UserController.loginUser(this.res, this.req);
            },
            get: function () {
            	UserController.loginScreen(this.res, this.req);
            }
        }
    },
    '/Public': {
        '/js': {
          '/:fileName': {
            get: function (fileName) {
              var doc = fs.readFileSync("./Public/js/" + fileName);
              this.res.writeHead(200, {'Content-Type': 'text/javascript'});
              this.res.end(doc);
            }
          }
        },
        '/css': {
          '/:fileName': {
            get: function (fileName) {
              var doc = fs.readFileSync("./Public/css/" + fileName);
              this.res.writeHead(200, {'Content-Type': 'text/css'});
              this.res.end(doc);
            }
          }
        },
		'/font': {
			'/:fileName': {
				get: function (fileName) {
					var doc = fs.readFileSync("./Public/font/" + fileName);
					var fileSuffix = fileName.split(".")[1];
					if (fileSuffix === "eot") {
						this.res.writeHead(200, {'Content-Type': 'application/vnd.ms-fontobject'});
						this.res.end(doc);
						return false;
					} else if (fileSuffix === "woff") {
						this.res.writeHead(200, {'Content-Type': 'application/font-woff'});
						this.res.end(doc);
						return false;
					} else if (fileSuffix === "ttf") {
						this.res.writeHead(200, {'Content-Type': 'application/x-font-ttf'});
						this.res.end(doc);
						return false;
					} else if (fileSuffix === "svg" || fileSuffix === "svg#fontawesomeregular") {
						this.res.writeHead(200, {'Content-Type': 'image/svg+xml'});
						this.res.end(doc);
						return false;
					}
				}
			}
        },
        '/images': {
          '/:fileName': {
            get: function (fileName) {
              var doc = fs.readFileSync("./Public/images/" + fileName);
              var fileSuffix = fileName.split(".")[1];

              if (fileSuffix === "gif") {
                    this.res.writeHead(200, {'Content-Type': 'image/gif'});
                    this.res.end(doc);
                    return false;
              } else if (fileSuffix === "png") {
                    this.res.writeHead(200, {'Content-Type': 'image/png'});
                    this.res.end(doc);
                    return false;
              } else if (fileSuffix === "jpg") {
                    this.res.writeHead(200, {'Content-Type': 'image/jpg'});
                    this.res.end(doc);
                    return false;
              }

              this.res.end(doc);
            }
          }
        }
    },
	"/:string": {
		get: function () {
			UserController.badRequest404(this.res, this.req);
		}
	}
});



module.exports = {
    Router: Router
};
