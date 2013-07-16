var http = require('http');
var fs = require('fs');
var url = require("url");
var Router = require('./Router/router.js').Router;
var connect = require('connect');
//var Director = require('director');
//var Mustache = require('Mustache');
//var Mongoose = require('mongoose');

/********************/
/* Constants */
/********************/
var PORT = 1336;
var MONGODB_URL = "mongodb://localhost/db";
var TEMPLATE_SUFFIX = ".mustach.html";

/********************/
/* Templates */
/********************/
/*
var tmpl_base = loadTemplateSync("base");
var tmpl_groupEvent = loadTemplateSync("groupEvent");
var tmpl_eventVote = loadTemplateSync("eventVote");
var tmpl_eventParticipants = loadTemplateSync("eventParticipants");
*/

/********************/
/* Models */
/********************/
/*
var User = require('./Model/user.js').User;
var Group = require('./Model/group.js').Group;
var GroupEvent = require('./Model/event.js').GroupEvent;
var Vote = require('./Model/vote.js').Vote;
*/

/********************/
/* Server */
/********************/



 connect()
    .use(connect.favicon())
    .use(connect.cookieParser())
    .use(connect.session({ secret: '123', cookie: { userName: '', _id: '' }}))
    .use(function(req, res, next){
    
      	req.chunks = [];
	    req.on('data', function (chunk) {
	      req.chunks.push(chunk.toString());
	    });
		 	
		
		Router.dispatch(req, res, function (err) {
			if (err) {
				console.log(err.status + ' ' + err.message);
				res.writeHead(404);
				res.end();
			}
		});
    }
  ).listen(PORT);


console.log("Server running at http://127.0.0.1:" + PORT + "/");
