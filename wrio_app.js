var exports = module.exports = {};
var nconf = require("./wrio_nconf.js").init();

exports.init = function (express) {
    var app = express();
    var bodyParser = require('body-parser');
    // Add headers
    app.use(function (request, response, next) {
        var host = request.get('origin');
        if (host == undefined) host = "";
        console.log(host);

        domain = nconf.get("db:workdomain");

        if (host.match(/^localhost:[0-9]+$/m)) {
            response.setHeader('Access-Control-Allow-Origin', host);
            console.log("Allowing CORS for localhost");
        }

        domain = domain.replace(/\./g,'\\.')+'$';
        console.log(domain);

        if (host.match(new RegExp(domain,'m'))) {
            response.setHeader('Access-Control-Allow-Origin', host);
            console.log("Allowing CORS for webrunes domains");
        } else {
            console.log('host not match');
        }

        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        response.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    return app;
};