var express = require('express');
var nconf = require("./wrio_nconf.js")
    .init();
var DOMAIN = nconf.get("db:workdomain");
var aws = require("./aws.js");
var path = require('path');



var wriocommon = require('wriocommon');
var dbLib = wriocommon.db;
var server = wriocommon.server;var dumpError = wriocommon.utils.dumpError;
var db;

//import {server,db,utils,login} from ;
app = express();
app.ready = function() {};
app.custom = {};

dbLib.init().then(function(dbInst) {
    db = dbInst;
    return server.initserv(app,dbInst);
}).then(function() {
    app.listen(nconf.get("server:port"));
    console.log('app listening on port ' + nconf.get('server:port') + '...');
    app.custom.db = db;
    server_setup(db);
    app.ready(db);
}).catch(function(err) {
    dumpError(err);

});;


function server_setup(db) {

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    require('./route')(app, db, aws);
    app.use('/', express.static(path.join(__dirname, '..', '/hub/')));
}

module.exports = app;

//var request = require('supertest');
//var should = require('should');
