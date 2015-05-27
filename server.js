var express = require('express');
var app = require("./wrio_app.js").init(express);
var nconf = require("./wrio_nconf.js").init();
var server = require('http').createServer(app).listen(nconf.get("server:port"));

var aws = require("./aws.js")

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


var wrioLogin = require('./wriologin');

var session = require('express-session');
var SessionStore = require('express-mysql-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');





MYSQL_HOST = nconf.get("db:host");
MYSQL_USER = nconf.get("db:user");
MYSQL_PASSWORD = nconf.get("db:password");
MYSQL_DB = nconf.get("db:dbname");
DOMAIN= nconf.get("db:workdomain");


var session_options = {
    host: MYSQL_HOST,
    port: 3306,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB
};

var cookie_secret = nconf.get("server:cookiesecret");
var sessionStore = new SessionStore(session_options);
app.use(cookieParser(cookie_secret));
app.use(session(
    {

        secret: cookie_secret,
        saveUninitialized: true,
        store: sessionStore,
        resave: true,
        cookie: {
            secure:false,
            domain:DOMAIN,
            maxAge: 1000 * 60 * 24 * 30
        },
        key: 'sid'
    }
));

app.use(bodyParser.urlencoded());

function returndays(response,days,url) {
    url = "webrunes.s3.amazonaws.com/"+url+'/index.htm';
    response.render('index.ejs',{"url":url,"days":30-days});
}

function getUserProfile(sid, done) {
    wrioLogin.checkSessionExists(request.sessionID, function(exists,user_profile) {
        if (!user_profile) {
            console.log("User profile not exists, creating...");
            wrioLogin.storageCreateTempRecord(request.sessionID, function(err,id) {
                if (err) {
                    console.log(err);
                    done("Create record failed");
                    return;
                }
                done(null, id);
            });
        } else {
            done(null,user_profile.id);
        }
    });

}

app.get('/', function (request, response) {

    console.log(request.sessionID);
    createTempAccountForSid(sid,function (err,result) {

    });
    wrioLogin.checkSessionExists(request.sessionID, function(exists,data) {
        if (!exists) {
            console.log("Session not exists");
            wrioLogin.storageCreateTempRecord(request.sessionID, function(err,data) {
                if (err) {
                    console.log(err);
                    return;
                }
                var id = data;
                returndays(response,0,id);
                console.log(id);
                aws.createTemplates(id);
            });
        } else {
            var delta = new Date().getTime() - data.expire_date;
            var deltadays = Math.round(delta / (24*60*60*1000));
            console.log("Session exists",delta,deltadays);
            returndays(response,deltadays,data.id);
        }
    });

});
// *******
// http://storage.webrunes.com/api/save

// POST PARAMETERS
// url: target url
// contents : target body

// POST REQUEST

app.get("/api/test", function (request,response) {

    response.render('api_test.ejs',{});

});

app.post('/api/save', function (request, response) {
    console.log("Save API called");
    response.set('Content-Type', 'application/json');
    console.log(request.sessionID);

    var url = request.body.url;
    var bodyData = request.body.bodyData;

    if (!url || !bodyData) {
        console.log("Wrong parameters");
        response.status(403);
        response.send({"error":'Wrong parameters'});
        return
    }

    if (!request.sessionID) {
        console.log("No session data");
        response.status(401);
        response.send({"error":'Not authorized'});
        return;
    }

    getUserProfile(request.sessionID,function (err,id) {
        console.log("Got user profile",id);
        aws.saveFile(id,url,bodyData,function(err,done) {
            if (err) {
                response.send({"error":'Not authorized'});
                return;
            }
            response.send({"success":'true'});
        });

    });

});


app.get('/logoff',function(request,response) {
    console.log("Logoff called");
    response.clearCookie('sid',{'path':'/','domain':DOMAIN});
    response.redirect('/');

});

module.exports = app;
