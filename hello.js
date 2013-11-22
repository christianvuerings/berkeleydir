var nodeio = require('node.io');
exports.job = new nodeio.Job({
    input: false,
    run: function () {
        this.emit('Hello World!');
    }
});
