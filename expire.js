
var nconf = require("./wrio_nconf.js").init();
var mysql = require('mysql');

MYSQL_HOST = nconf.get("db:host");
MYSQL_USER = nconf.get("db:user");
MYSQL_PASSWORD = nconf.get("db:password");
MYSQL_DB = nconf.get("db:dbname");
DOMAIN= nconf.get("db:workdomain");

var AWS = require('aws-sdk');
var nconf = require("./wrio_nconf.js").init();
var keyid = nconf.get("aws:aws_access_key_id"), secret = nconf.get("aws:aws_secret_access_key");
AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'webrunes', Key: 'test'},
    //endpoint: "http://webrunes.s3-website-us-east-1.amazonaws.com/"
});


function handleDisconnect() {
    connection = mysql.createConnection({
        host     : MYSQL_HOST,
        user     : MYSQL_USER,
        password : MYSQL_PASSWORD
    });



    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } else {
            console.log("Connecting to db...")
            connection.query('USE '+MYSQL_DB);

            var d = new Date().getTime() - 30*24*60*60*1000;  // 30 days
            getExpiredProfiles(d,function(data) {
                if (data) {

                    for (var i in data) {
                        console.log("Deleting ", data[i]);

                        var params = {
                            Bucket: 'webrunes', /* required */
                            Key: data[i].id+"/cover.htm" /* required */
                        }

                        s3.deleteObject(params, function(err, data) {
                            if (err) {
                                console.log("Can't delete object",err, err.stack);
                            } // an error occurred
                            else     console.log("object deleted");           // successful response
                        });
                        var params = {
                            Bucket: 'webrunes', /* required */
                            Key: data[i].id+"/index.htm" /* required */
                        }

                        s3.deleteObject(params, function(err, data) {
                            if (err) {
                                console.log("Can't delete object",err, err.stack);
                            } // an error occurred
                            else     console.log("object deleted");           // successful response
                        });

                    }

                    deleteExpiredProfiles(d,function() {
                        if (err) {
                            console.log("Delte error");
                            return;
                        }
                        console.log("Delete successful");
                    });


                } else {
                    console.log("No expired")
                }
                connection.end();
            });


        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

var getExpiredProfiles = function (time,exists) {
    var query = "SELECT * FROM `user_profiles` WHERE expire_date < ?";

    connection.query(query, [time], function (err, rows) {
        if (err) {
            console.log("Expire error", err);
            exists(null);
            return;
        }
      //  console.log(rows);
        if (rows.length == 0) {
            exists(null);
        } else {
            exists(rows);
        }
        return;
    });
};


var deleteExpiredProfiles = function (time,exists) {
    var query = "DELETE FROM `user_profiles` WHERE expire_date < ?";
    connection.query(query, [time], function (err) {
        if (err) {
            console.log("Delete error error", err);
            exists(null);
            return;
        }
        exists(true);
        return;
    });
};


