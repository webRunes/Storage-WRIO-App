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
            maxAge: 1000 * 60 * 60 * 24 * 30
        },
        key: 'sid'
    }
));

app.use(bodyParser.urlencoded());

function returndays(j,days,id) {
    j['url'] = "http://wr.io/"+id+'/';
    j['cover'] = j['url']+'cover.htm';
    j['days'] = 30 - days;
    return j;
}

function returnPersistentProfile(j,id,name) {
    j['temporary'] = false;
    j['id'] = id;
    j['url'] = "http://wr.io/"+id+'/';
    j['cover'] = j['url']+'cover.htm';
    j['name'] = name;
    return j;
}


function getUserProfile(sid, done) {
    wrioLogin.checkSessionExists(sid, function(exists,user_profile) {
        if (!user_profile) {
            console.log("User profile not exists, creating...");
            wrioLogin.storageCreateTempRecord(sid, function(err, id, profile) {
                if (err) {
                    console.log(err);
                    done("Create record failed");
                    return;
                }
                done(null, id, profile);
            });
        } else {
            done(null,user_profile.id,user_profile);
        }
    });
}

app.get('/', function (request, response) {

    response.send("<html><body>Use /api/ calls to use storage</body></html>");

});
// *******
// http://storage.webrunes.com/api/save

// POST PARAMETERS
// url: target url
// bodyData : target body

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
        aws.saveFile(id,url,bodyData,function(err,res) {
            if (err) {
                response.send({"error":'Not authorized'});
                return;
            }
            response.send({
                "result":"success",
                "url":res.replace('https://s3.amazonaws.com/wr.io/','http://wr.io/') // remove this when switch to https
            });
        });

    });

});


function deleteTempProfile(id) {

    var query = "DELETE FROM `user_profiles` WHERE id = ?";
    connection.query(query, [id], function (err) {
        if (err) {
            console.log("Delete error error", err);
            return;
        }
        return;
    });

}

function saveWRIOid(userID,wrioID,done) {
    console.log("Saving wrioID for user ",userID);
    var insertQuery = "UPDATE `webRunes_Users` SET wrioID='"+wrioID+ "' WHERE userID = "+userID;
    console.log(insertQuery);
    connection.query(insertQuery, function (err, rows) {
        if (err) {
            console.log("Update error", err);
            done("Can't insert");
            return;
        }

        console.log("Update query done " + rows.insertId);
        deleteTempProfile(wrioID);
        return done(null);
    });
}

app.post('/api/get_profile', function (request, response) {

    console.log(request.sessionID);
    var json_resp = {
        "result":"success"
    };
    response.set('Content-Type', 'application/json');

    function getTempProfile() { // get temporary user profile
        getUserProfile(request.sessionID,function (err, id, profile) {
            if (err) {
                response.send({"error":"Can't get user profile"});
                return;
            }
            console.log("Got user profile",id, " creating templates");
            // return profile expire time
            response.cookie('user_profile', id, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), httpOnly: true, domain:DOMAIN });
            aws.createTemplates(id);
            var delta = new Date().getTime() - profile.expire_date;
            var deltadays = Math.round(delta / (24*60*60*1000));
            if (deltadays > 30) {
                console.log("Profile expired");
                deleteTempProfile(id);
                getTempProfile();
                return;
            }
            console.log("Session exists",delta,deltadays);
            json_resp['temporary'] = true;
            json_resp['id'] = id;
            returndays(json_resp,deltadays,id);
            response.send(json_resp);

        });
    }

    wrioLogin.loginWithSessionId(request.sessionID,function gotSessionId(err,result) {
        if (err) {
            console.log("User not logged in");
            getTempProfile();
            return;
        }
        if (result.wrioID) {

            var name = result.lastName;

            console.log("User found with wrioID=", result.wrioID);
            response.send(returnPersistentProfile(json_resp,result.wrioID,name));
        } else {
            // try to find wrioID profile from session or from cookie
            console.log("wrioID not found for this profile");

            if (request.cookies.user_profile) {
                console.log("Got user_profile cookie");
                saveWRIOid(result.userID,request.cookies.user_profile,function (err) {
                    if (err) {
                        console.log("Failed to save WRIOid");
                        getTempProfile();
                        return;
                    }
                    response.send(returnPersistentProfile(json_resp,result.userID,name));


                })
            } else {
                getUserProfile(request.sessionID,function (err, id, profile) {
                    if (err) {
                        getTempProfile();
                        return;
                    }
                    saveWRIOid(result.userID,id,function (err) {
                        response.send(returnPersistentProfile(json_resp,id,name));
                    });
                });
            }

        }
    });





});


app.get('/logoff',function(request,response) {
    console.log("Logoff called");
    response.clearCookie('sid',{'path':'/','domain':DOMAIN});
    response.redirect('/');

});

module.exports = app;

//var request = require('supertest');
//var should = require('should');
