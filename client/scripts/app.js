//https://api.parse.com/1/classes/chatterbox
var app = {};
app.allMessages = {};
app.lastUpdate = 0;
app.server = 'http://127.0.0.1:3000/classes/messages';
app.friendList = [];

// pull messages data
app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.populateMessages(data.results, app.lastUpdate);
      app.lastUpdate = new Date();
      app.addRooms();
      $('.message-container-title').text("All Messages");
    },
    error: function (data) {
      console.error('Chatterbox: Failed to get messages');
    }
  });
};

// escape the string
app.sanitize = function (string) {
  return _.escape(string);
};

// add messages to app.AddMessages object if they haven't already been added
// use startTime to determine from what point on we should add messages
app.populateMessages = function(messages, startTime) {
  app.lastUpdate = messages[0].createdAt;
  _.each(messages, function(message) {
    if (moment(message.createdAt).isAfter(startTime)) {
      app.addMessage(message);
    }
  });
  $('.message-username').click(function() {
    var friend = $(this).text();
    if (app.friendList.indexOf(friend) === -1) {
      app.friendList.push(friend);
      app.addFriend(friend);
    }
  });
};

//add message to the message-container div
app.addMessage = function(message) {
  var text = app.sanitize(message.text);
  var username = app.sanitize(message.username);
  var date = moment(app.sanitize(message.createdAt)).fromNow();
  var roomname = app.sanitize(message.roomname);
  roomname = roomname.replace(/^\s+/g, '').replace(/\s+$/g, '');
  if (roomname.length === 0) {
    roomname = "Default";
  }
  if (app.allMessages.hasOwnProperty(roomname)) {
    app.allMessages[roomname].unshift(message);
  } else {
    app.allMessages[roomname] = [message];
  }
  var $message_html =
  "<div class='message' username=" + username.replace(/[ |']/, '-') + " room=" + roomname.replace(/[ |']/, '-') + ">" +
    "<p class='message-text'>" + text + "</p>" +
    "<p class='message-username'>" + username + "</p>" +
    "<p class='message-date'>" + date + "</p>" +
    "<p class='message-room'>" + roomname + "</p></div>";
  $('.message-container').prepend($message_html);
};

//send message from form to the server
app.send = function(messageData) {
  var message = {
    'username': messageData.username,
    'text': messageData.text,
    'roomname': messageData.roomname,
    'createdAt' : new Date()
  };

  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log("SUCCESS");
      //upon success, pull in new data (so you can see your new post)
      $("[type='text']").val('');
      console.log('chatterbox: Message sent');
    },
    error: function (xhr, textStatus, error) {
      console.log(xhr.statusText)
      console.log(textStatus);
      console.log(error);

      // console.log("ERROR");
      console.error('chatterbox: Failed to send message');
    }
  });
};

//remove all messages from DOM
app.clearMessages = function() {
  $('.message').remove();
  app.lastUpdate = 0;
  $('.message-container-title').text('Refresh to See Messages');
  $('.side-bar-room, .side-bar-friend').remove();
};

// add rooms to the side bar
app.addRooms = function() {
  // crate array of all room names
  var rooms = Object.keys(app.allMessages);

  // remove all room names from side bar
  $('.side-bar-room').remove();

  //add each room name to the side bar
  _.each(rooms, function (room){
    var $sidebar_html = "<p class='side-bar-room' room=\'" + room + "\'>" + room + "  (" + app.allMessages[room].length.toString() + ")" + "</p>";
    $('.side-bar-room-div').append($sidebar_html);
  });

  //add jQuery event on new elements so that when you click room name, you will filter messages
  $('.side-bar-room').click(function(e){
    var room = $(this).attr('room');
    app.filterMessagesByRoom(room);
  });
};

// add a friend to friend list (an array attribute of the app object)
app.addFriend = function(username) {
  var $sidebar_html = "<p class='side-bar-friend' username=\'" + username + "\'>" + username + "</p>";
  $('.side-bar-friends-div').append($sidebar_html);
  $('.side-bar-friend').click(function(e){
    var username = $(this).text();
    app.filterMessagesByUsername(username)
  })
};



// show messages of a specific room
app.filterMessagesByRoom = function(room) {
  //show all messages
  $('.message').show();

  //hide messages that are not in the room you want to want to view the messages of
  if (room !== undefined) {
    $('.message').each(function(){
      if ($(this).attr('room') !== room.replace(/[ |']/, '-')) {
        $(this).hide();
      }
    });

    //change the header to the name of the room you want to view the messages of
    $('.message-container-title').text(room);
  }
};

// show messages of a user you a friends with
app.filterMessagesByUsername = function(username) {
  //show all messages
  $('.message').show();

  //hide messages that do not have the username of the user you want to view the messages of
  if (username !== undefined) {
    $('.message').each(function() {
      if ($(this).attr('username') !== username.replace(/[ |']/, '-')) {
        $(this).hide();
      }
    });

    //change the header to the name of the user you want to view the messages of
    $('.message-container-title').text(username);
  }
}

// JQUERY/DESIGN FUNCTIONS

//hide or show the add post form when the post button is clicked on top nav
var togglePostForm = function() {
  if ($('#form-container').is(':visible')) {
    $('#form-container').slideUp();
  }
  else{
    $('#form-container').slideDown();
  }
};

$(document).ready(function(){
  //load messages
  setInterval(app.fetch, 1000);


  // Hide new post form when page loads
  $('#form-container').hide();

  // When you click post button it will show or hide the new post form
  $('.post-button').click(function() {
    togglePostForm();
  });

  // pulls new messages
  $(".refresh-button").click(function() {
    app.clearMessages();
    app.fetch();
  });

  //clears all messages
  $(".clear-button").click(function() {
    app.clearMessages();
  });

  //when you submit a message, send it to server and hide new message form
  $('.message-form').submit(function(e) {
    e.preventDefault();
    var messageData = {};
    messageData.username = $("[name='username']").val();
    messageData.text = $("[name='text']").val();
    messageData.roomname = $("[name='roomname']").val();
    app.send(messageData);
    $('#form-container').hide();
  });


});
