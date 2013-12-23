var ldap = require('ldapjs');

//console.log(ldap);

var server = 'ldap://ldap.berkeley.edu';
var searchBase = 'ou=people,dc=berkeley,dc=edu';

var client = ldap.createClient({
  url: server
});

//console.log(client);

var opts = {
  //bindDN: 'ou=people,dc=berkeley,dc=edu',
  //filter: '(&(cn=^0)(uid="61889"))'
  //filter: '(objectclass=*)'
  //filter: '#uid=61889'
  //filter: '((objectclass=*)(!(mail=test*)))'
};

client.bind('ou=people', '', function (err) {
  client.search(searchBase, opts, function(err, res) {
    //console.log(err);
    //console.log(res);

    res.on('searchEntry', function (entry) {
      //var log = JSON.stringify(entry);

      // for (var i in entry) {
      //   console.log(i, entry[i]);
      // }
      console.log(entry.toString());
      var user = entry.json;
      //console.log(user.attributes[0].vals);
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
});

// ldapsearch -H ldap://ldap.berkeley.edu -x -b 'ou=people,dc=berkeley,dc=edu'  objectclass=*
