/**
 * Created by mich.bil on 18.05.15.
 */

var AWS = require('aws-sdk');
var nconf = require("./wrio_nconf.js").init();
var keyid = nconf.get("aws:aws_access_key_id"), secret = nconf.get("aws:aws_secret_access_key");
AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'webrunes', Key: 'test'},
    //endpoint: "http://webrunes.s3-website-us-east-1.amazonaws.com/"
});


var params = {
    Body:"Hello!",
    Key:"test/index.html",
    ACL:'public-read',
    ContentType:"text/html"
};

s3.upload(params,function (err,res) {
    if (err) {
        console.log(err);
    }
    console.log(res);
});


var params = {
    Bucket: 'wrio' /* required */
};
s3.getBucketWebsite(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});

module.exports.createRandomID = function () {

}

/*
var params = {
    Bucket: 'webrunes'
};

s3.getBucketWebsite(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});
*/