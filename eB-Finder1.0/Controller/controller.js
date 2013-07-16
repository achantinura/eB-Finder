var fs = require('fs');
var Mustache = require('mustache');
var Mongoose = require('mongoose');
var connect = require('connect');

/********************/
/* Constants */
/********************/
var TEMPLATE_SUFFIX = ".mustach.html";


/********************/
/* Templates */
/********************/
var tmpl_base = loadTemplateSync("base");
var tmpl_groupEvent = loadTemplateSync("groupEvent");
var tmpl_eventVote = loadTemplateSync("eventVote");
var tmpl_eventParticipants = loadTemplateSync("eventParticipants");

// User
var tmpl_user = loadTemplateSync("user");
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

/*+++++++++++++*/
/* Mock-Daten */
/*+++++++++++++*/
var group;
var user1, user2, user3, user4, users;
var vote1, vote2, vote3, vote4, votes;
var event1, event2, events;

    group = new Group ({
        _id: this.groupId,
        name: "Basketball Karlsruhe"
    });

// User
    user1 = new User ({
        _id: 1,
        groupIds: this.groupId,
        userName: "Pierre",
        password: "123",
        email: "pierre.bartholomae@googlemail.com",
        settings: {
            notification: 1
        }
    });

    user2 = new User ({
        _id: 2,
        groupIds: this.groupId,
        userName: "Christian",
        password: "123",
        email: "christian.roser@googlemail.com",
        settings: {
            notification: 1
        }
    });

    user3 = new User ({
        _id: 3,
        groupIds: this.groupId,
        userName: "Christoph",
        password: "123",
        email: "christoph.gerdon@googlemail.com",
        settings: {
            notification: 1
        }
    });

    user4 = new User ({
        _id: 4,
        groupIds: this.groupId,
        userName: "J��rg",
        password: "123",
        email: "joerg.hilscher@googlemail.com",
        settings: {
            notification: 1
        }
    });

    users = { user: [user1, user2, user3] };

// Vote
    vote1 = new Vote ({
        id: 1,
        userId: 1,
        startDate: 12,
        endDate: 15,
        eventId: 1
    });

    vote2 = new Vote ({
        id: 2,
        userId: 2,
        startDate: 12,
        endDate: 13,
        eventId: 1
    });

    vote3 = new Vote ({
        id: 3,
        userId: 3,
        startDate: 14,
        endDate: 16,
        eventId: 1
    });

    vote4 = new Vote ({
        id: 4,
        userId: 4,
        startDate: 10,
        endDate: 15,
        eventId: 1
    });

    votes = { vote: [vote1, vote2, vote3] };

// Event
    event1 = new GroupEvent ({
        _id: 1,
        name: "3 gegen 3 Montag",
        userCount: votes.vote.length,
        groupId: this.groupId,
        voteIds: [1, 2, 3, 4]
    });
    /*
    event2 = new GroupEvent ({
        _id: 2,
        name: "OTC Sonntag Mittag",
        groupId: this.groupId,
        voteIds: [2, 3, 4]
    });*/

    events = { event: [event1] };

/*+++++++++++++*/
/* End Mock-Daten */
/*+++++++++++++*/

/********************/
/* Helper */
/********************/
function loadTemplateSync(templateName) {
    // console.log("loadTemplateSync: " + templateName + TEMPLATE_SUFFIX);
    return fs.readFileSync("./Public/html/" + templateName + ".mustache.html", "utf8");
}

/********************/
/* Logik */
/********************/
var Controller = {
    getGroupDetailsByGroupId: function (groupId, res, req) {
        var data, html;
        //var group, users, votes,events;

        data = {
            users: users,
            events: events,
            votes: votes
        };

        html = Mustache.render(tmpl_base, data, {
            "groupEvent": tmpl_groupEvent,
            "eventVote": tmpl_eventVote,
            "eventParticipants": tmpl_eventParticipants
        });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }, // end: getGroupDetailsByGroupId()

	// Wenn keine user-session, dann zur login-seite
	loggedIn: function (res, req) {
	
	
		if (req.session && req.session._id)
			return true;
	
		res.writeHead(302, {
		  'Location': '/login'
		});
		
		res.end();
        return false;
	}

};

module.exports = {
    Controller: Controller
};
