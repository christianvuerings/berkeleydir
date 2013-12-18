var ldap = require('ldapjs');

//console.log(ldap);

var server = 'ldap://ldap.berkeley.edu';
var searchBase = 'ou=people,dc=berkeley,dc=edu';

var client = ldap.createClient({
  url: server
});

//console.log(client);

var opts = {
  //filter: '(&(cn=^0)(uid="61889"))'
  filter: "(#uid=*)"
};

client.search(searchBase, opts, function(err, res) {
  console.log(err);
  console.log(res);

  res.on('searchEntry', function (entry) {
    console.log(entry);
    var user = entry.object;
    console.log(user);
  });
  res.on('searchReference', function(referral) {
    console.log('referral: ' + referral.uris.join());
  });
  res.on('error', function(err) {
    console.error('error: ' + err.message);
  });
  res.on('end', function(result) {
    console.log('status: ' + result.status);
  });
});
