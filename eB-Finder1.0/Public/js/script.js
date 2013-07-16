$( document ).ready(function() {

	

	/* Load jQuery.timepicker */
	$('#voteStartDate').timepicker({
		'timeFormat': 'H:i',
		'step': 30,
		'scrollDefaultNow': true,
		'forceRoundTime': true
	});

	$('#voteEndDate').timepicker({
		'timeFormat': 'H:i',
		'step': 30,
		'scrollDefaultNow': true,
		'forceRoundTime': true
	});
	/* End: Load jQuery.timepicker */


	$(".event").each( function () {
		var minStart=1500;
		var maxEnde=0;
		var resultBeforeWidth = 30;
		var resultMainWidth = 15;
		var resultAfterWidth = 100 - (resultBeforeWidth + resultMainWidth);
		var duration;
		var oneHour;

		//minStart und maxEnde berechnen
		$(this).find(".single-vote").each(function() {
			if ($(this).data("start") < minStart) {
				minStart = $(this).data("start");
			}
			if ($(this).data("end") > maxEnde) {
				maxEnde = $(this).data("end");
			}
		});

		//Gesamtdauer und Stundenanteil ausrechnen
		duration = maxEnde - minStart;
		oneHour = 100 / duration;

		//event-result setzen
		//$(".result-before").css("width", resultBeforeWidth + "%");
		var intersectionLength = 0;
		var intersectionStart = -1;
		var intersectionEnd = 1500;
		var beforeStart;

		//single-votes
		$(this).find(".single-vote").each(function () {
		    var start = $(this).data("start");
		    var end = $(this).data("end");
		    var duration = end - start;
		    var main = oneHour * duration;
		    var before = (start - minStart) * oneHour;
		    var after = 100 - (main + before);

		    if (start < intersectionEnd) {
		        if (end > intersectionStart) {
		            if (start >= intersectionStart) {
		                intersectionStart = start;
		            }
		            if (end <= intersectionEnd) {
		                intersectionEnd = end;
		            }
		            intersectionLength = (intersectionEnd - intersectionStart) * oneHour;
		        }
		    }



		    $(this).find(".single-vote-before").css("width", before + "%");
		    $(this).find(".single-vote-main").css("width", main + "%");
		    $(this).find(".single-vote-after").css("width", after + "%");
		});
		var intersectionStartMinute = intersectionStart % 60;
		var intersectionStartHour = (intersectionStart - intersectionStartMinute) / 60;
		var intersectionEndMinute = intersectionEnd % 60;
		var intersectionEndHour = (intersectionEnd - intersectionEndMinute) / 60;
		var intersectionStartMinuteString;
		var intersectionStartHourString;
		var intersectionEndMinuteString;
		var intersectionEndHourString;
		
		if (intersectionStartMinute < 10) {
			intersectionStartMinuteString = '0' + intersectionStartMinute;
		}
		else {
			intersectionStartMinuteString = intersectionStartMinute;
		}
		
		if (parseInt(intersectionStartHour) < 10) {
			intersectionStartHourString = '0' + intersectionStartHour;
		}
		else {
			intersectionStartHourString = intersectionStartHour;
		}
		
		if (intersectionEndMinute < 10) {
			intersectionEndMinuteString = '0' + intersectionEndMinute;
		}
		else {
			intersectionEndMinuteString = intersectionEndMinute;
		}
		
		if (intersectionEndHour < 10) {
			intersectionEndHourString = '0' + intersectionEndHour;
		}
		else {
			intersectionEndHourString = intersectionEndHour;
		}		
		
		$(this).find(".result-main-start").html(intersectionStartHourString + ":" + intersectionStartMinuteString);
		$(this).find(".result-main-end").html(intersectionEndHourString + ":" + intersectionEndMinuteString);
		beforeLength = (intersectionStart - minStart) * oneHour;
		afterLength = (100 - ( beforeLength + intersectionLength));
		$(this).find(".result-before").css("width", beforeLength + "%");
		$(this).find(".result-main").css("width", intersectionLength + "%");
		$(this).find(".result-after").css("width", afterLength + "%");

	});

	// *** user zeugs***

	/* login
	$("#btnLogin").click(function () {

				jAjax.post({
							  userName: $('#userName').val(),
							  password: $('#password').val()
							  },
							  $('#register'),
							  "/login"

				);



	});
	*/


});

var User = {
	login: function () {
	
		if ($('#userName').val().length == 0  || $('#password').val().length == 0 ) {
			$('#info-login').html('Bitte alle Felder ausf&uuml;llen.');
			return false;
		}
	
		jAjax.post({
			userName: $('#userName').val(),
			password: $('#password').val()
		},
		$('#info-login'),
		"/login",
		function (msg) {
			if (msg.indexOf("Erfolg") !== -1) {
				setTimeout(function () {
				location.href = '/';
			}, 1000);
		}});
	},
	isEmailAddress: function (str) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(str);
	},
	register: function () {
		if ($('#userNameRegister').val().length == 0  || $('#userEmailRegister').val().length == 0  || $('#passwordRegister').val().length == 0 ) {
			$('#info-reg').html('Bitte alle Felder ausf&uuml;llen.');
			return false;
		}
		if (!this.isEmailAddress($('#userEmailRegister').val())) {
			$('#info-reg').html('Bitte eine valide E-Mail Adresse eingeben.');
			return false;
		}
		jAjax.post({
			userName: $('#userNameRegister').val(),
			email: $('#userEmailRegister').val(),
			password: $('#passwordRegister').val()
		},
		$('#info-reg'),
		'/login/register',
		function (msg) {
			if (msg.indexOf("Erfolg") !== -1) {
				setTimeout(function () {
				location.href = '/';
			}, 1000);
		}});
	},
	saveSettings: function () {
		var emailAlert = $('#emailAlert').val() == 'on';
		var email = $('#userEmail').val();
		if (!this.isEmailAddress($('#userEmail').val())) {
			$('#info').html('Bitte eine valide E-Mail Adresse eingeben.');
			return false;
		}
		var location = $('#location').val();
		var image = $('#image').val()
		jAjax.post({
			emailAlert: emailAlert,
			email: email,
			location: location,
			image: image

			},
			$('#info'),
			'/user/settings',
			function () {
				if (image) {
					var imgTag = $(document.createElement('img'));
					imgTag.attr('src', image);
					imgTag.attr('max-width', '600px');
					imgTag.attr('width', 'auto');
					imgTag.attr('height', '250px');
					$('#imgResult').html(imgTag);

					sidebarUserIcon = $(document.createElement('img'));
					sidebarUserIcon.attr('src', image);
					$(".sidebar-user-img a").html(sidebarUserIcon);
					
					settingsUserIcon = $(document.createElement('img'));
					settingsUserIcon.attr('src', image);
					settingsUserIcon.attr('width', '75px');
					settingsUserIcon.attr('height', 'auto');
					$(".settings-user-img").html(settingsUserIcon);
				}
				// reload Google Map
				if (location.length > 0) {
					console.log(location.length);
					var mapsImage = '<img src="https://maps.googleapis.com/maps/api/staticmap?center=' + location + '&amp;zoom=14&amp;size=590x250&amp;markers=' + location + '&amp;sensor=false" width="590" height="250">';
					console.log(mapsImage);
					$('.settings-location-map').html(mapsImage);
				}
				return true;
			}
		);
	},
	userVote : function (eventId, userId, isUpvote) {
		jAjax.post({
			eventId: eventId,
			userId: userId,
			isUpvote: isUpvote
			},
			$('#usr-' + userId),
			'/user/vote',
			function (msg) {
			}
		);
	}
};

var Group = {
	create: function () {
		var groupName = $('#groupName').val(),
			groupDescription = $('#groupDescription').val();
		if ( groupName.length == 0
			|| groupDescription.length == 0 ) {
			$('#info').html('Bitte alle Felder ausf&uuml;llen.');
			return false;
		}
		console.log("jAjax.post()");
		jAjax.post({
			groupName: groupName,
			groupDescription: groupDescription
		},
		$('#info'),
		'/group/create',
		location.href = '/'
		);
	},
	userVote : function (eventId, isUpvote) {
		jAjax.post({
			eventId: eventId,
			isUpvote: isUpvote
			},
			$('#info'),
			'/event/vote',
			function (msg) {
				//alert(msg);
				//$('#e-upvote').attr('onClick', '');
				//$('#e-downvote').attr('onClick', '');
				
				$('#e-upvote').hide();
				$('#e-downvote').hide();
				
				var ups = parseInt($('#upv').html());
				var downs = parseInt($('#downv').html());
				
				if (isUpvote == 'true' || isUpvote == true) {
					
					ups++;
					$('#upv').html(ups.toString());
				} else {
					
					downs++;
					$('#downv').html(downs.toString());
				}
				
				$('#negVotes').css({ width: (downs/(downs + ups) * 100).toString() + '%'});
				setTimeout(function () {
					$('#info').fadeOut(1600);
				}, 1000);
			}
		);
	},
	join: function (groupId) {
		jAjax.post({
			groupId: groupId
			},
			$('#info-g').removeAttr("style"),
			'/group/join',
			function (msg) {
				$('#btn-'+groupId).html('verlassen');
				$('#btn-'+groupId).attr('onClick', 'Group.leave("'+groupId+'")'); 
				$('.not-member-info').addClass("hidden");
				$('.list-primary-button').removeClass("hidden");
				$('.group-events').slideDown()
				setTimeout(function () {
					$('#info-g').fadeOut(1600);
				}, 1000);
			}
		);
	},
 
	leave: function (groupId) {
		jAjax.post({
			groupId: groupId
			},
			$('#info-g').removeAttr("style"),
			'/group/leave',
			function (msg) {
				$('#btn-'+groupId).html('beitreten');
				$('#btn-'+groupId).attr('onClick', 'Group.join("'+groupId+'")'); 
				$('.not-member-info').removeClass("hidden");
				$('.list-primary-button').addClass("hidden");
				$('.group-events').slideUp();
				setTimeout(function () {
					$('#info-g').fadeOut(1600);
				}, 1000);
			}
		);
	}
	
	/*getGroupById: function (id) {
		jAjax.get({
			id: id,
		},
		$('#info'),
		"/login",
		function (msg) {
			if (msg.indexOf("Erfolg") !== -1) {
				setTimeout(function () {
				location.href = '/';
			}, 1000);
		}});
	
	}*/
};

var Event = {
	create: function () {
		var voteEndDate = $('#voteEndDate').val(),
			voteStartDate = $('#voteStartDate').val(),
			startSplit = voteStartDate.split(':'),
			endSplit = voteEndDate.split(':'),
			voteStartDateMinute = parseInt(startSplit[0]) * 60 + parseInt(startSplit[1]),
			voteEndDateMinute = parseInt(endSplit[0]) * 60 + parseInt(endSplit[1]);
		
		if ($('#eventName').val().length == 0
			|| $('#eventLocation').val().length == 0
			|| $('#eventDate').val().length == 0
			|| voteStartDate.length == 0
			|| voteEndDate.length == 0)
		{
			$('#info').html('Bitte alle Felder ausf&uuml;llen.');
			return false;
		}

		if (voteEndDateMinute < voteStartDateMinute) {
			$('#info').html('Ende muss spaeter als Anfang sein');
			return false;
		}
		
		var groupId = $('#groupId').val();

		jAjax.post({
			eventName: $('#eventName').val(),
			eventLocation: $('#eventLocation').val(),
			eventDate: $('#eventDate').val(),
			voteStartDateMinute: voteStartDateMinute,
			voteEndDateMinute: voteEndDateMinute,
			voteStartDate: voteStartDate,
			voteEndDate: voteEndDate,
			groupId: groupId // ***++++***
			},
			$('#info'),
			'/event/create',
			function (msg) {
				//$('#info').append('<a href="/group/' + groupId + '">Weiter zur Gruppe</a>');
				location.href = '/group/' + groupId
			}
			);
		},
		
	createComment: function(){
		
		var commentText = $('#eventComment').val();
		
		if (commentText.length < 1) {
			return false;
		}
		
		jAjax.post({
			commentText: commentText,
			eventId: $('.event').data('event-id'),
			}, //data
			null, //element
 			'/event/createComment', //url
			function (msg) {
				$('#eventComments').append('<div class="box-item wrapper clearfix"><label>' + msg + ': <span>"'+ commentText +'"</span></label></div>');
				$('#eventComment').val('');
			});
	},
	
	createVote: function () {
	
		var userId = $('#userId').val();
		
		// wenn user schon gevotet hat
		if( $('#usr-'+userId).length > 0 ) {
			$('#createVoteInfo').removeAttr("style").html('<span style="color: red">Man kann nur einmal voten.</span>');
			setTimeout(function () {
				$('#createVoteInfo').fadeOut(1600);
			}, 1000);
			return false;
		}

		var voteEndDate = $('#voteEndDate').val(),
			voteStartDate = $('#voteStartDate').val(),
			startSplit = voteStartDate.split(':'),
			endSplit = voteEndDate.split(':'),
			voteStartDateMinute = parseInt(startSplit[0]) * 60 + parseInt(startSplit[1]),
			voteEndDateMinute = parseInt(endSplit[0]) * 60 + parseInt(endSplit[1]);

		if (voteStartDate.length == 0
			|| voteEndDate.length == 0)
		{
			$('#createVoteInfo').removeAttr("style").html('<span style="color: red">Bitte alle Felder ausf&uuml;llen.</span>');
			setTimeout(function () {
				$('#createVoteInfo').fadeOut(1600);
			}, 1000);
			return false;
		}

		if (voteEndDateMinute < voteStartDateMinute) {
			$('#createVoteInfo').removeAttr("style").html('Ende muss spaeter als Anfang sein');
			setTimeout(function () {
				$('#createVoteInfo').fadeOut(1600);
			}, 1000);
			return false;
		}

		jAjax.post({
			id: $('.event').data('event-id'),
			voteStartDateMinute: voteStartDateMinute,
			voteEndDateMinute: voteEndDateMinute,
			voteStartDate: voteStartDate,
			voteEndDate: voteEndDate
		},
		null,
		'/event/createVote',
		function (msg) {
			//window.location.reload();
			location.href = '/event/' + $('.event').data('event-id');
		});
	},
	

	getEventById : function(div) {
		console.log(div);
		location.href = '/event/' + $(div[0]).data("event-id")

	}

};


var Vote = {

	create: function () {

		alert(eventStartDateMin);
		if ($('#eventName').val().length == 0
			|| $('#eventLocation').val().length == 0
			|| $('#eventDateDay').val().length == 0
			|| $('#eventDateMonth').val().length == 0 )
		{
			$('#info').html('Bitte alle Felder ausf&uuml;llen.');
			return false;
		}



		//alert($('#userEmail').val());

		jAjax.post({
			name: $('#eventName').val(),
			location: $('#eventLocation').val(),
			dateDay: $('#eventDateDay').val(),
			dateMonth: $('#eventDateMonth').val()
		},
		$('#info'),
		'/event/create',
		location.href = '/event');
	}

};

var jAjax = {

	post: function (data, element, url, callback) {
		if (element) {
			var height = element.height();

			element.css({ height : height });
			element.html('loading ...');
		}


		$.ajax({
			  type: "POST",
			  url: url,
			  data: data
			}).done(function (msg) {
				if (element) {
					element.html(msg);
					element.css({ height : '' });
				}
				if (callback)
					callback(msg);

			});

	},
	get: function (element, url, callback) {

		var height = element.height();
		if (element) {
			element.css({ height : height });
			element.html('<img src="/Public/images/spinner.gif" />');
		}

		$.ajax({
			  type: "GET",
			  url: url,
			  async: false 
			}).done(function( msg ) {
				if (element) {
					element.html(msg);
					element.css({ height : '' });
				}
				if (callback)
					callback(msg);

			}).fail(function() { 
				// retry
				jAjax.get(element, url, callback);
			 });

	}

};

var directionsDisplay;
var directionsService;

/* Load Event Map */
var EventMap = {

	end: null,

	settings: {
		isMapOpen: false
	},

	init: function () {
		s = this.settings;
		//this.initGoogleMap();
		this.bindUIActions();
	},

	bindUIActions: function () {
		$('.event-location-link').on({
			click: function () {
				var currEventId = $(this).data('event-id');
				var currEvent = $('.event-' + currEventId);
				var currEventVotes = currEvent.find('.event-votes');
				var currEventMap = $('.event-map');
				var location = currEvent.data('event-location');
				console.log(currEventId);
				console.log(location);

				if (s.isMapOpen === false) {
					currEventMap.removeClass('hidden');
					s.isMapOpen = true;

					EventMap.initGoogleMap(currEventMap.find('.map-canvas'));
					EventMap.loadMap(location);

				} else {
					currEventMap.addClass('hidden');
					s.isMapOpen = false;
				}
			}
		});
	},

	initGoogleMap: function (currEventMap) {
		directionsDisplay = new google.maps.DirectionsRenderer();
		geocoder = new google.maps.Geocoder();
		directionsService = new google.maps.DirectionsService();
		var latlng = new google.maps.LatLng(-34.397, 150.644);
		var mapOptions = {
			zoom: 15,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(currEventMap[0], mapOptions);
		directionsDisplay.setMap(map);
	},

	loadMap: function (locationString) {
		var address = locationString;
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				
				EventMap.end = results[0].geometry.location;
				
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
			} else {
			alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}, 
	calcRoute: function(start) {

			  
			  geocoder.geocode( { 'address': start}, function(results, status) {
						var request = {
					      origin: results[0].geometry.location,
					      destination: EventMap.end,
					      travelMode: google.maps.DirectionsTravelMode.DRIVING
					  };
					  directionsService.route(request, function(response, status) {
					    if (status == google.maps.DirectionsStatus.OK) {
					      directionsDisplay.setDirections(response);
					    }
			  });
				});
			  
			  
			}
}
/* End: Load Event Map */


