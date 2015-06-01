var exports = module.exports = {};

exports.init = function (express) {
    var app = express();
    var bodyParser = require('body-parser');
    // Add headers
    app.use(function (request, response, next) {
        var host = request.get('origin');
        console.log(host);

        if (host.match(/^localhost:[0-9]+$/m)) {
            response.setHeader('Access-Control-Allow-Origin', host);
            console.log("Allowing CORS for localhost");
        }

        if (host.match(/\.webrunes\.com$/m)) {
            response.setHeader('Access-Control-Allow-Origin', host);
            console.log("Allowing CORS for webrunes domains");
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