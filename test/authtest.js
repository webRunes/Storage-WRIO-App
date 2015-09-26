/**
 * Created by mich.bil on 27.05.15.
 */
var app = require("../server.js");
var request = require('supertest');
var assert = require('assert');
var should = require('should');
var Promise = require('es6-promise').Promise;

var stdout_write = process.stdout._write,
    stderr_write = process.stderr._write;

process.stdout._write = stdout_write;
process.stderr._write = stderr_write;

var Session = require('supertest-session')({
    app: app
});

var ready = false;
var db;
app.ready = function(database) {
    ready = true;
    db = database;

};


function createDummyUser() {
    return new Promise(function(resolve,reject) {
        var webrunesUsers = db.collection('webRunes_Users');
        var sessions = db.collection('sessions');
        var dummy = {
            _id: 0,
            name: "dummy"
        };

        console.log("COOKIES",session.cookies);

        webrunesUsers.updateOne({_id:0},dummy,{upsert:true},function (err) {
            if (err) {
                reject();
                return;
            }


            var sessionstr = JSON.stringify(
                {
                    passport: {
                        user : 0
                    }
                });

            var session = {
                expires: new Date(Date.now()+1212111),
                session: sessionstr

            };
            sessions.insert(session,function (err,records) {
                if (err) {
                    reject();
                    return;
                }
                if (!records) {
                    reject();
                    return
                }
                resolve(records.insertedIds[0]);

            });


        });
    });
}

describe("Authentificated requests test", function() {
    before(function (done) {
        that = this;
        setInterval(function() {
            if (ready) {
                console.log("App ready, starting tests");
                clearInterval(this);
                that.session = new Session();
                done();
            }

        }, 1000);
    });

    after (function (done) {
       this.session.destroy();
    });

    it('should extract data from dummy profile', function(done) {
        createDummyUser().then(function (sid) {
            console.log("done, sid:", sid);
            this.session
                .post('/api/get_profile')
                .set('Cookie',sid)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    done();

                })
        }).catch(function(err) {
            console.log(err);
            done("error");
        })
    });
});
/**
 * Created by Bilenko on 9/11/2015.
 */
