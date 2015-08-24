
var nconf = require("./wrio_nconf.js").init();

DOMAIN= nconf.get("db:workdomain");

var AWS = require('aws-sdk');
var nconf = require("./wrio_nconf.js").init();
var keyid = nconf.get("aws:aws_access_key_id"), secret = nconf.get("aws:aws_secret_access_key");
AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'wr.io', Key: 'test'},
    //endpoint: "http://webrunes.s3-website-us-east-1.amazonaws.com/"
});


var MongoClient = require('mongodb')
    .MongoClient;

var url = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log("Error conecting to mongo database: " + err);
    } else {
        console.log("Connected correctly to mongodb server");
        expire(db);
    }
});



function expire(db) {

    var user_profiles = db.collection('user_profiles');

    var profileTime = function (time, exists) {
        user_profiles.find({}).sort({expire_date:-1}).toArray(function(err,records) {
            if (err) {
                console.log("Expire error", err);
                exists(null);
                return;
            }
            if (!records) {
                console.log("No records found");
                exists(null);
            }
            //  console.log(rows);
            for (var i in rows) {
                var row = rows[i];
                console.log(Math.round(( new Date().getTime() - row.expire_date) / (1000 * 60 * 60)) + " hours");
            }
        });
    };

    var getExpiredProfiles = function (time, exists) {
        user_profiles.find({expire_date: {
            $lt: time
        }}).toArray(function(err,rows) {
            if (err) {
                console.log("Expire error", err);
                exists(null);
                return;
            }
            if (rows == []) {
                console.log("Expired profiles not found");
                exists(null);
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
            Prefix: id + '/'
        };

        s3.listObjects(params, function (err, data) {
            if (err) return console.log(err);

            params = {Bucket: 'wr.io'};
            params.Delete = {};
            params.Delete.Objects = [];

            data.Contents.forEach(function (content) {
                params.Delete.Objects.push({Key: content.Key});
            });

            s3.deleteObjects(params, function (err, data) {
                if (err) return console.log(err);

                return console.log(data.Deleted.length);
            });
        });

    }


    var deleteExpiredProfiles = function (time, exists) {
        user_profiles.remove({expire_date: {
            $lt: time
        }}, function(err,rows) {

            if (err) {
                console.log("Delete error error", err);
                exists(null);
                return;
            }
            exists(true);
            return;
        });
    };

    var d = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;  // 30 days
    getExpiredProfiles(d, function (data) {
        if (data) {

            for (var i in data) {
                console.log("Deleting ", data[i]);
                deleteFolder(data[i].id);
            }

            deleteExpiredProfiles(d, function (err) {
                if (err) {
                    console.log("Delete error");
                    return;
                }
                console.log("Delete successful");
            });


        } else {
            console.log("No expired")
        }
        db.close();

    });
};
