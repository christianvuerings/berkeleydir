var ldap = require('ldapjs');

var server = 'ldap://ldap.berkeley.edu';
var searchBase = 'ou=people,dc=berkeley,dc=edu';

var client = ldap.createClient({
  url: server
});



var exists = function(attribute) {
  return (attribute && attribute[0]);
};

var onSearch = function(err, res) {

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

    console.log(user);
  });
  res.on('error', function(err) {
    console.error('error: ' + err.message);
  });
};

for (var i = 1; i < 100; i++) {

  var opts = {
    filter: '(&(objectclass=*)(uid=' + i + '))',
    scope: 'sub'
  };

  client.search(searchBase, opts, onSearch);
}


