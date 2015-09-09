
var nconf = require("../wrio_nconf.js").init();

DOMAIN= nconf.get("db:workdomain");

var AWS = require('../aws.js');


var mongoUrl = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');
require('./db.js').mongo( {url: mongoUrl}).then(function(db) {

    console.log("Updating profiles");
    fix_profiles(db.db);
}).catch(function (err) {
    console.log(err);
});


function fix_profiles(db) {
    console.log(AWS);

    var user_profiles = db.collection('user_profiles');

    user_profiles.find({}).toArray(function (err, records) {
        if (err) {
            console.log("Profile find error", err);
            return;
        }
        if (!records) {
            console.log("No records found");
        }
;
        records.forEach(function(el) {
            console.log(el._id);
            AWS.createTemplates(el._id);
        })

    });


}
