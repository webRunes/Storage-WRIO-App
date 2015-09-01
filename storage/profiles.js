module.exports = function (db) {

    var user_profiles = db.collection('user_profiles');
    var webrunesUsers = db.collection('webRunes_Users');
    var ObjectID = require('mongodb').ObjectID;
    var Promise =  require('es6-promise').Promise;

    var checkIdExists = function (wrioID, exists) {
        user_profiles.findOne({"_id": wrioID}, function (err, profile) {
            if (err || !profile) {
                console.log("Search profile error", err);
                exists(false);
                return;
            }
            console.log(profile);
            exists(true);
        });
    };


    var checkSessionExists = function (session, exists) {
        user_profiles.findOne({"session": session}, function (err, profile) {
            if (err || !profile) {
                console.log("Search profile by sessionID error", err);
                exists(false);
                return;
            }
            console.log("Found corresponding profile for the session "+session+" : ",profile);
            exists(true, profile);

            return;
        });
    };

    var storageCreateTempRecord = function (session, done) {
        var min = 100000000000;
        var max = 999999999999;
        var id = Math.floor(Math.random() * (max - min) + min);

        checkIdExists(id, function (exists) {
            if (exists) {
                storageCreateTempRecord(session, done); // call ourselves until we find unique ID
            } else {
                var profile = {
                    _id: id,
                    temporary: true,
                    expire_date: new Date().getTime(),
                    "session": session
                };
                user_profiles.insertOne(profile, function (err) {

                    if (err || !profile) {
                        console.log("Create temporary profile error", err);
                        done(err);
                        return;
                    }

                    done(null, profile._id, profile);
                });
            }
        });

    };

    function deleteTempProfile(id) {

        user_profiles.remove({"_id":id},function(err) {
            if (err) {
                console.log("Delete error error", err);
                return;
            }
            return;
        });

    }

    function saveWRIOid(userID, wrioID, done) {
        console.log("Saving wrioID for user ", userID);

        webrunesUsers.updateOne({_id:userID},{$set: {wrioID:wrioID}}, function(err,result) {
            if (err) {
                console.log("Update error", err);
                done("Can't update");
                return;
            }

            console.log("Update query done " + result);
            deleteTempProfile(wrioID);
            return done(null);
        });
    }


    function getUserProfile(sid, done) {
        checkSessionExists(sid, function (exists, user_profile) {
            if (!user_profile) {
                console.log("User profile not exists, creating...");
                storageCreateTempRecord(sid, function (err, id, profile) {
                    if (err) {
                        console.log(err);
                        done("Create record failed");
                        return;
                    }
                    done(null, id, profile);
                });
            } else {
                done(null, user_profile._id, user_profile);
            }
        });
    }

    return {
        storageCreateTempRecord: storageCreateTempRecord,
        checkSessionExists: checkSessionExists,
        deleteTempProfile: deleteTempProfile,
        saveWRIOid: saveWRIOid,
        getUserProfile: getUserProfile
    }
}