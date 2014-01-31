var express = require('express');
var fs = require('fs');
var app = express();

// TODO make this async, this is for prototyping only
var users_file = JSON.parse(fs.readFileSync('public/users.json', 'utf8'));
var users_limit = 10;

var sendResponse = function(users, query, response) {

  responseObject = {
    "users": users,
    "query": query
  };

  response.send(responseObject);
};

var findSplit = function(query, userSearch) {
  var userSplit = userSearch.toLowerCase().split(' ');
  var querySplit = query.toLowerCase().split(' ');

  for (var i = 0; i < querySplit.length; i++) {
    for (var j = 0; j < userSplit.length; j++) {
      if (userSplit[j].indexOf(querySplit[i]) !== -1) {
        return true;
      }
    }
  }
  return false;
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
          var userSearch = user[i] + '';
          if (findSplit(query, userSearch)) {
            return true;
          }
        }
      }
    }
  } else {
    user = user + '';
    if (findSplit(query, user)) {
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


app.get('/api/search/:query?', function(req, res){
  var query = req.params.query;
  performSearch(query, res);
});

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

var port = process.env.PORT || 3000;
app.listen(port);
