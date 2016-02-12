module.exports = function(app, db, aws) {
    var nconf = require("./wrio_nconf.js")
        .init();
    var DOMAIN = nconf.get("db:workdomain");

    var wrioLogin = require('./wriologin.js')(db);

    // *******
    // http://storage.webrunes.com/api/save

    // POST PARAMETERS
    // url: target url
    // bodyData : target body

    // POST REQUEST

    app.post('/api/save', function(request, response) {
        console.log("Save API called");
        response.set('Content-Type', 'application/json');
        console.log(request.sessionID);

        var url = request.body.url;
        var bodyData = request.body.bodyData;

        if (!url || !bodyData) {
            console.log("Wrong parameters");
            response.status(403);
            response.send({
                "error": 'Wrong parameters'
            });
            return;
        }

        if (!request.sessionID) {
            console.log("No session data");
            response.status(401);
            response.send({
                "error": 'Not authorized'
            });
            return;
        }

        wrioLogin.loginWithSessionId(request.sessionID, function(err, id) {
            console.log("Got user profile", id);
            aws.saveFile(id, url, bodyData, function(err, res) {
                if (err) {
                    response.send({
                        "error": 'Not authorized'
                    });
                    return;
                }
                response.send({
                    "result": "success",
                    "url": res.replace('https://s3.amazonaws.com/wr.io/', 'https://wr.io/')
                });
            });

        });

    });

    app.get('/api/save_templates',function(request,response) {
        var sid = request.query.sid || '';
        wrioLogin.getLoggedInUser(sid).
            then(function(user) {
                if (!user) {
                    throw new Error("Got no user");
                }
                if (user.wrioID) {
                    console.log("Creating S3 templates for ",user.wrioID);
                    aws.createTemplates(user.wrioID);
                }
                response.send('OK');
            }).
            catch(function(err) {
                console.log("User not logged in");
                response.status(403).send('Failure');
            });
    });

    app.post('/api/delete_templates', wrioLogin.authS2S, function(request,response) {

        var itemsToDelete = request.body.items;
        console.log(itemsToDelete);
        if (itemsToDelete) {
            itemsToDelete.forEach(function(item) {
                console.log("Deleting", item);
                aws.deleteFolder(item);
            });
        }
        response.send('OK');
    });


    app.get('/logoff', function(request, response) {
        console.log("Logoff called");
        response.clearCookie('sid', {
            'path': '/',
            'domain': DOMAIN
        });
        response.redirect('/');

    });
};
