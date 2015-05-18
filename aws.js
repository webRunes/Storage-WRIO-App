/**
 * Created by mich.bil on 18.05.15.
 */

var AWS = require('aws-sdk');

var s3 = new AWS.S3();
var nconf = require("./wrio_nconf.js").init();
AWS.config.update({accessKeyId: nconf.get("aws:aws_access_key_id"), secretAccessKey: nconf.get("aws:aws_secret_access_key")});

s3.createBucket({Bucket: 'myBucket'}, function() {

    var params = {Bucket: 'myBucket', Key: 'myKey', Body: 'Hello!'};

    s3.putObject(params, function(err, data) {

        if (err)

            console.log(err)

        else       console.log("Successfully uploaded data to myBucket/myKey");

    });

});

