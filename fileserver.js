var express = require('express');
var fs = require('fs');
var gravatar = require('gravatar');

var app = express();

var users_file;
var users_limit = 10;

var sendResponse = function(users, query, response) {

  responseObject = {
    "users": users,
    "query": query
  };

  response.send(responseObject);
};

var findUser = function(query, user) {
  query = query.toLowerCase();
  if (typeof user === 'object') {
    for (var i in user) {
      if (user.hasOwnProperty(i)) {
        if (Array.isArray(user[i])) {
          for (var j = 0; j < user[i].length; j++) {
            if (findUser(query, user[i][j])) {
              return true;
            }
          }
        }
        else {
          userSearch = user[i] + '';
          if (userSearch.toLowerCase().indexOf(query) !== -1) {
            return true;
          }
        }
      }
    }
  } else {
    user = user + '';
    if (user.toLowerCase().indexOf(query) !== -1) {
      return true;
    }
  }
};

var findUsers = function(query) {

  var users = [];

  for (var i in users_file) {
    if (users.length >= users_limit) {
      return users;
    }
    if (users_file.hasOwnProperty(i)) {
      if (!query) {
        users.push(users_file[i]);
      }
      else {
        var userFound = findUser(query, users_file[i]);
        if (userFound) {
          users.push(users_file[i]);
        }
      }
    }
  }

  return users;
};

var performSearch = function(query, response) {

  var users = findUsers(query);

  sendResponse(users, query, response);
};

var generateImage = function(email) {
  return gravatar.url(email, {
    s: '20',
    d: 'blank'
  });
};

var generateImages = function() {
  for (var i in users_file) {
    if (users_file.hasOwnProperty(i) && users_file[i].email) {
      users_file[i].image = generateImage(users_file[i].email[0]);
    }
  }
};

var init = function() {
  // TODO make this async, this is for prototyping only
  users_file = JSON.parse(fs.readFileSync('public/users.json', 'utf8'));
  generateImages();
};

app.get('/api/search/:query?', function(req, res){
  var query = req.params.query;
  performSearch(query, res);
});

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

init();

var port = process.env.PORT || 3000;
app.listen(port);

