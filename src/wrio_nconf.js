var exports = module.exports = {};

exports.init = function () {
    var path = require('path');
    var fs = require("fs");

    // nconf config
    var nconf = require('nconf');
    var fs = require('fs');
    // Favor command-line arguments and environment variables.
    nconf.env().argv();

    var basedirPath = path.dirname(require.main.filename); // won't work with unit tests
    nconf.file(path.resolve(__dirname, '../config.json'));

    // end nconf config
    return nconf;
};