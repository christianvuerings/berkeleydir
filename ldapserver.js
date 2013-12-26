var express = require('express');
var app = express();

var ldap = require('ldapjs');
var server = 'ldap://ldap.berkeley.edu';
var searchBase = 'ou=people,dc=berkeley,dc=edu';
var client = ldap.createClient({
  url: server
});


var createFilter = function(query) {
  if (!query) {
    query = '*';
  }

  var options = ['displayName', 'mail', 'uid'];
  var filter = '(&(objectclass=*)';

  if (query !== '*') {
    filter += '(|';
    options.forEach(function optionLoop(option) {
        filter += '(' + option + '=*' + query + '*)';
    });
    filter += ')';
  }

  filter += ')';
  return filter;
};

var exists = function(attribute) {
  return (attribute && attribute[0]);
};

var sendResponse = function(users, query, response) {
  response.send({
    "users": users,
    "query": query
  });
};

var onSearch = function(err, res, query, response) {
  var users = [];

  res.on('searchEntry', function (entry) {
    //var log = JSON.stringify(entry);

    var user = {
      name: '',
      email: [],
      id: 0
    };

    for (var i = 0; i < entry.json.attributes.length; i++) {
      var item = entry.json.attributes[i];

      if (item.type === 'displayName' && exists(item.vals)) {
        user.name = item.vals[0];
      }
      if (item.type === 'uid' && exists(item.vals)) {
        user.id = parseInt(item.vals[0], 10);
      }
      if (item.type === 'mail' && exists(item.vals)) {
        user.email = item.vals;
      }
    }

    if (user.name) {
      users.push(user);
    }
  });

  res.on('error', function(err) {
    console.error('LDAP Search Error: ' + err.message);
    sendResponse(users, query, response);
  });

  res.on('end', function(result) {
    console.log('LDAP Search End: ', result.messageID);
    sendResponse(users, query, response);
  });
};

var performSearch = function(query, response) {
  console.log(createFilter(query));
  var opts = {
    filter: createFilter(query),
    scope: 'sub',
    sizeLimit: 10
  };

  client.search(searchBase, opts, function(err, res){
    onSearch(err, res, query, response);
  });
};


app.get('/api/search/:query?', function(req, res){
  var query = req.params.query;
  performSearch(query, res);
});

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});

app.listen(80);
