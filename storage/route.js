module.exports = function (app,db,aws) {
    var nconf = require("../wrio_nconf.js").init();
    var DOMAIN= nconf.get("db:workdomain");


    var wrioLogin = require('../wriologin.js')(db);
    var profiles = require('./profiles.js')(db,aws);
    function returndays(j, days, id) {
        j['url'] = "http://wr.io/" + id + '/';
        j['cover'] = j['url'] + 'cover.htm';
        j['days'] = 30 - days;
        return j;
    }

    function returnPersistentProfile(j, id, name) {
        j['temporary'] = false;
        j['id'] = id;
        j['url'] = "http://wr.io/" + id + '/';
        j['cover'] = j['url'] + 'cover.htm';
        j['name'] = name;
        return j;
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

    app.get("/api/test", function (request, response) {

        response.render('api_test.ejs', {});

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
            response.send({"error": 'Wrong parameters'});
            return
        }

        if (!request.sessionID) {
            console.log("No session data");
            response.status(401);
            response.send({"error": 'Not authorized'});
            return;
        }

        profiles.getUserProfile(request.sessionID, function (err, id) {
            console.log("Got user profile", id);
            aws.saveFile(id, url, bodyData, function (err, res) {
                if (err) {
                    response.send({"error": 'Not authorized'});
                    return;
                }
                response.send({
                    "result": "success",
                    "url": res.replace('https://s3.amazonaws.com/wr.io/', 'http://wr.io/') // remove this when switch to https
                });
            });

        });

    });




    app.post('/api/get_profile', function (request, response) {

        console.log(request.sessionID);
        var json_resp = {
            "result": "success"
        };
        response.set('Content-Type', 'application/json');

        function getTempProfile() { // get temporary user profile
            profiles.getUserProfile(request.sessionID, function (err, id, profile) {
                if (err) {
                    response.send({"error": "Can't get user profile"});
                    return;
                }
                console.log("Got user profile", id, " creating templates");
                // return profile expire time
                response.cookie('user_profile', id, {
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                    httpOnly: true,
                    domain: DOMAIN
                });
                aws.createTemplates(id);
                var delta = new Date().getTime() - profile.expire_date;
                var deltadays = Math.round(delta / (24 * 60 * 60 * 1000));
                if (deltadays > 30) {
                    console.log("Profile expired");
                    profiles.deleteTempProfile(id);
                    getTempProfile();
                    return;
                }
                console.log("Session exists", delta, deltadays);
                json_resp['temporary'] = true;
                json_resp['id'] = id;
                returndays(json_resp, deltadays, id);
                response.send(json_resp);

            });
        }

        wrioLogin.loginWithSessionId(request.sessionID, function gotSessionId(err, result) {
            if (err) {
                console.log("User not logged in");
                getTempProfile();
                return;
            }
            if (result.wrioID) {

                var name = result.lastName;

                console.log("User found with wrioID=", result.wrioID);
                response.send(returnPersistentProfile(json_resp, result.wrioID, name));
            } else {
                // try to find wrioID profile from session or from cookie
                console.log("wrioID not found for this profile");

                if (request.cookies.user_profile) {
                    console.log("Got user_profile cookie");
                    profiles.saveWRIOid(result.userID, request.cookies.user_profile, function (err) {
                        if (err) {
                            console.log("Failed to save WRIOid");
                            getTempProfile();
                            return;
                        }
                        response.send(returnPersistentProfile(json_resp, result.userID, name));


                    })
                } else {
                    profiles.getUserProfile(request.sessionID, function (err, id, profile) {
                        if (err) {
                            getTempProfile();
                            return;
                        }
                        profiles.saveWRIOid(result.userID, id, function (err) {
                            response.send(returnPersistentProfile(json_resp, id, name));
                        });
                    });
                }

            }
        });


    });


    app.get('/logoff', function (request, response) {
        console.log("Logoff called");
        response.clearCookie('sid', {'path': '/', 'domain': DOMAIN});
        response.redirect('/');

    });
}