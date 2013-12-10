var Crawler = require("crawler").Crawler;
var Firebase = require('firebase');
var firebaseDB = new Firebase('https://berkeleydir.firebaseio.com/users');

var url = 'https://calnet.berkeley.edu/directory/details.pl?uid=';
var urls = [];
var numbers = [];
for(var i = 101205; i < 1200000; i++) {
    urls.push(url + i);
}

var c = new Crawler({
    "maxConnections": 10,

    // This will be called for each crawled page
    "callback": function(error, result ,$) {
        // $ is a jQuery instance scoped to the server-side DOM of the page
        var name = $('#content > p span:nth-child(2)').html();
        if (name) {
            var id = result.window.location._url.query.replace('uid=', '');
            var email = $('#content span:contains("Email:")').next().text();
            var person = {
                id: parseInt(id, 10),
                name: name,
                email: email
            };
            firebaseDB.child(id).set(person);
            console.log(person);
        }
    }
});


// Queue a list of URLs
c.queue(urls);

