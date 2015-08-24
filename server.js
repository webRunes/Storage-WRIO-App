var express = require('express');
var app = require("./wrio_app.js").init(express);
var nconf = require("./wrio_nconf.js").init();
var DOMAIN= nconf.get("db:workdomain");
var aws = require("./aws.js")

var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var MongoClient = require('mongodb')
    .MongoClient;
app.custom = {};
var server = require('http')
    .createServer(app)
    .listen(nconf.get("server:port"), function(req, res) {
        console.log('app listening on port ' + nconf.get('server:port') + '...');
        var url = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Error conecting to mongo database: " + err);
            } else {
                app.custom.db = db;
                console.log("Connected correctly to mongodb server");
                server_setup(db);
            }
        });
    });

function server_setup(db) {

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var SessionStore = require('connect-mongo')(session);
    var cookie_secret = nconf.get("server:cookiesecret");
    var sessionStore = new SessionStore({db: app.custom.db});
    app.use(cookieParser(cookie_secret));
    app.use(session(
        {

            secret: cookie_secret,
            saveUninitialized: true,
            store: sessionStore,
            resave: true,
            cookie: {
                secure: false,
                domain: DOMAIN,
                maxAge: 1000 * 60 * 60 * 24 * 30
            },
            key: 'sid'
        }
    ));

    app.use(bodyParser.urlencoded());

    require('./storage/route')(app, db, aws);
}

module.exports = app;

//var request = require('supertest');
//var should = require('should');
