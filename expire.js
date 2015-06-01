
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
    params: {Bucket: 'wr.io', Key: 'test'},
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

            //profileTime();

            var d = new Date().getTime() - 30*24*60*60*1000;  // 30 days
            getExpiredProfiles(d,function(data) {
                if (data) {

                    for (var i in data) {
                        console.log("Deleting ", data[i]);
                        deleteFolder(data[i].id);
                    }

                    deleteExpiredProfiles(d,function() {
                        if (err) {
                            console.log("Delete error");
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


var profileTime = function (time,exists) {
    var query = "SELECT * FROM `user_profiles` ORDER BY `expire_date`";

    connection.query(query, [], function (err, rows) {
        if (err) {
            console.log("Expire error", err);
            exists(null);
            return;
        }
        //  console.log(rows);
        for (var i in rows) {
            var row = rows[i];
            console.log(Math.round(( new Date().getTime() - row.expire_date)/(1000*60*60))+" hours");
        }
        return;
    });
};

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

function deleteFolder(id) {

    var params = {
        Bucket: 'wr.io',
        Prefix: id+'/'
    };

    s3.listObjects(params, function(err, data) {
        if (err) return console.log(err);

        params = {Bucket: 'wr.io'};
        params.Delete = {};
        params.Delete.Objects = [];

        data.Contents.forEach(function(content) {
            params.Delete.Objects.push({Key: content.Key});
        });

        s3.deleteObjects(params, function(err, data) {
            if (err) return console.log(err);

            return console.log(data.Deleted.length);
        });
    });

}



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



