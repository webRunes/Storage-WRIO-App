const nconf = require("./wrio_nconf.js").init();
const DOMAIN = nconf.get("db:workdomain");
const wrioLogin = require('wriocommon').login;
const localdev = require('./localdev');
const updateListHtml = require('./update_list_html');
const updateCommentId = require('./utils/comment_id/update_comment_id');
const isCoverUrl = require('./utils/is_cover_url');

module.exports = function(app, db, aws) {

    // *******
    // http://storage.webrunes.com/api/save

    // POST PARAMETERS
    // url: target url
    // bodyData : target body

    // POST REQUEST
    console.log(DOMAIN);
    if (DOMAIN === ".wrioos.local") {
        app.post('/api/saveLocal', wrioLogin.wrioAuth, function(request, response) {
            console.log("Save API called");
            response.set('Content-Type', 'application/json');

            const url = request.body.url;
            const bodyData = request.body.bodyData;

            if (!url || !bodyData) {
                console.log("Wrong parameters");
                response.status(403);
                response.send({
                    "error": 'Wrong parameters'
                });
                return;
            }
            const id = request.user;
            //console.log("Got user profile", id);
            localdev.saveFile(id.wrioID, url, bodyData, function(err, res) {
                if (err) {
                    response.send({
                        "error": 'Not authorized'
                    });
                    return;
                }
                response.send({
                    "result": "success",
                    "url": 'http://wrioos.local/hub/'+url
                });
            });
        });
    }

    app.post('/api/save', wrioLogin.wrioAuth, function(request, response) {
        console.log("Save API called");
        response.set('Content-Type', 'application/json');
        console.log(request.sessionID);

        const url = request.body.url;
        const bodyData = request.body.bodyData;

        if (!url || !bodyData) {
            console.log("Wrong parameters");
            response.status(403);
            response.send({
                "error": 'Wrong parameters'
            });
            return;
        }
        const id = request.user;
        const wrioID = id.wrioID;
        //console.log("Got user profile", id);
        aws.saveFile(wrioID, url, bodyData, function(err, res) {
            if (err) {
              response.send({
                error: 'Not authorized'
              });
              return;
            }

            const link = res.replace('https://s3.amazonaws.com/wr.io/', 'https://wr.io/');

            if (isCoverUrl(link)) {
              response.send({
                result: 'success',
                url: link
              });
              return;
            }

            updateListHtml(aws, wrioID, link, err =>
              response.send(
                err
                  ? {
                      error: 'Update list.html failed'
                    }
                  : {
                      result: 'success',
                      url: link
                    }
              )
            );
        });
    });

    app.post('/api/delete', wrioLogin.wrioAuth, function(request, response) {
        console.log("Save API called");
        response.set('Content-Type', 'application/json');
        console.log(request.sessionID);

        const url = request.body.url;

        if (!url) {
            console.log("Wrong parameters");
            response.status(403);
            response.send({
                "error": 'Wrong parameters'
            });
            return;
        }
        const id = request.user;
        aws.deleteFile(id.wrioID,url, function(err, res) {
            if (err) {
                response.send({
                    "error": 'Not authorized'
                });
                return;
            }
            console.log(res);
            response.send({
                "result": "success"
            });
        });
    });

    app.get('/api/overwrite_templates', wrioLogin.wrioAuth, function(request, response) {
        console.log('Inititiaing logs overwrite for ', request.user.wrioID);
        aws.createTemplates(request.user.wrioID);
        response.send('Templates overwritten');
    });

    app.get('/api/save_templates', wrioLogin.authS2S, function(request,response) {
        var wrioID = request.query.wrioID;
        if (!wrioID) {
            return response.status(403).send("Wrong parameters");
        }
        console.log("Creating S3 templates for ",wrioID);
        aws.createTemplates(wrioID);
        response.send('OK');
    });

    app.post('/api/delete_folder', wrioLogin.authS2S, function(request,response) {

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

    app.post('/api/update_comment_id', wrioLogin.authS2S, (request, response) =>
      updateCommentId(
        request.body.url,
        request.body.commentId,
        () => response.end()
      )
    );

    app.get('/logoff', function(request, response) {
        console.log("Logoff called");
        response.clearCookie('sid', {
            'path': '/',
            'domain': DOMAIN
        });
        response.redirect('/');

    });
};
