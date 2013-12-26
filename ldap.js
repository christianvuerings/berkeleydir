var async = require('async');

var ldap = require('ldapjs');

var Firebase = require('firebase');
var firebaseDB = new Firebase('https://berkeleydir.firebaseio.com/users');

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

    //console.log(user);
    firebaseDB.child(user.id).set(user);
  });
  res.on('end', function(result) {
    console.log(result.messageID);
    if (result.messageID === currentBatchNumber) {
      console.log('next!!!');
      nextBatch(currentBatchNumber);
    }
  });
  res.on('error', function(err) {
    console.error('error: ' + err.message);
  });
};

var search = function(arr) {

  async.each(arr, function(i, callback){

    process.nextTick(function () {

      var opts = {
        filter: '(&(objectclass=*)(uid=' + i + '))',
        scope: 'sub'
      };

      client.search(searchBase, opts, function(err, res){
        onSearch(err, res, i);
      });

      callback();
    });

  });

};

var currentBatchNumber = -1;

var nextBatch = function(arrstart) {

  var arr = [];
  var arrlength = arrstart + 1000;
  currentBatchNumber = arrlength;
  for (var i = arrstart; i < arrlength; i++) {
    arr[i] = i;
  }
  search(arr);

};

nextBatch(0);

