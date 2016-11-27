var AWS = require('aws-sdk');
var nconf = require("./wrio_nconf.js").init();
var keyid = nconf.get("aws:aws_access_key_id"), secret = nconf.get("aws:aws_secret_access_key");
AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'wr.io', Key: 'test'}
});

var indexTemplate = "index  loading...";
var coverTemplate = "cover loading...";
var plusTemplate = "plus loading...";
// get templates we will be working on

function download(url,callback) {
    var params = {
        Bucket: 'wrioos.com',
        Key: url
    };
    s3.getObject(params,callback);
}


download("Storage-WRIO-App/default/index.html",function(err,res) {
    if (err) {
        console.log("Can't get index template ",err);
        return;
    }
    indexTemplate = res.Body.toString();
});

download("Storage-WRIO-App/default/cover/index.html", function (err, res) {
    if (err) {
        console.log("Can't get cover template ", err);
        return;
    }
    coverTemplate = res.Body.toString();
});

download("Plus-WRIO-App/default/index.html",function(err,res) {
    if (err) {
        console.log("Can't get index template ",err);
        return;
    }
    plusTemplate = res.Body.toString();
    console.log("Plus template loaded");
});


module.exports.createTemplates = function (userID) {

    var domain = nconf.get("db:workdomain").replace(".",'');
    var userTemplate = indexTemplate.replace(/\{\{domain}}/g,'https://wr.io/'+userID)
        .replace(/\{\{ wrio_id }}/g,userID);

    //console.log("UT:",userTemplate);
    var params = {
        Body:userTemplate,
        Key:userID+"/index.html",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

    params = {
        Body:coverTemplate,
        Key:userID+"/cover/index.html",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

    params = {
        Body:plusTemplate,
        Key:userID+"/Plus-WRIO-App/index.html",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

};

module.exports.saveFile = function (userID,path,file,done) {

    var params = {
        Body:file,
        Key:userID+'/'+path,
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
            done("Cant write file");
            return;
        }
        console.log("File uploaded to s3",res);
        done(null,res.Location);
    });

};


module.exports.deleteFile = function (userID, path,done) {

    var params = {
        Bucket: 'wr.io',
        Key:userID+'/'+path
    };

    s3.deleteObject(params,function (err,res) {
        if (err) {
            console.log(err);
            done("Cant write file");
            return;
        }
        console.log("File uploaded to s3",res);
        done(null,res.Location);
    });

};

module.exports.deleteFolder = function (id) {

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

};