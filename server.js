var nodeio = require('node.io');
var jsdom = require("jsdom");
var jquery = require("jquery");

var numbers = [];
for(var i = 0; i < 40; i++) {
    numbers[i] = i;
}

exports.job = new nodeio.Job({
    input: numbers,
    run: function (id) {
        var that = this;
        var url = 'https://calnet.berkeley.edu/directory/details.pl?uid=' + id;
        /*this.getHtml(url, function(err, $) {
            console.log($);
            var name = $('#content p').innerHTML;
            //var name = $('#content > p span:nth-child(2)').innerHTML;
            this.emit(name);
        });*/
        jsdom.env(
            'https://calnet.berkeley.edu/directory/details.pl?uid=' + id,
            ['http://code.jquery.com/jquery.js'],
            function (errors, window) {
                var name = window.$('#content > p span:nth-child(2)').html();
                if (name) {
                    that.emit({
                        id: id,
                        name: name
                    });
                } else {
                    that.emit('');
                }

            }
        );

    }
});
