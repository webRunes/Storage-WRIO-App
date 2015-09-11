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
    app: require('../server.js')
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

describe("API unit tests", function() {
    before(function (done) {
        setInterval(function() {
            if (ready) {
                console.log("App ready, starting tests");
                done();
                clearInterval(this);
            }

        }, 1000);
    });
    it("should successfully upload file to storage",function(done) {
        postdata = {
            url:"test.html",
            bodyData:"<html>Test pass</html>"
        };
        request(app)
            .post('/api/save')
            .send(postdata)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect('set-cookie', /sid/)
       //     .expect('set-cookie', /user_profile/)
            .end(function(err, res){
                if (err) throw err;
                var resp = res.body;
                console.log("Got save result",resp);
                assert(resp.result,"success");
                done();
            });

    });

    it("should raise error because of wrong parameters",function(done) {
        request(app)
            .post('/api/save')
            .expect('Content-Type', /json/)
            .expect(403,{"error":'Wrong parameters'})
            .end(function (err, res) {
                if (err) throw err;
                done();
            });
    });

    it("should return user temporary profile via api", function (done) {
        request(app)
            .post('/api/get_profile')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                var resp = res.body;
                console.log(resp);

                should(resp).have.property("result","success");
                should(resp).have.property("temporary",true);
                should(resp).have.property("days",30);

                var id = resp.id.toString();
                should(id.length).equal(12); // there must be 12 digit id

                done();
            });
    });
    it('should extract data from dummy profile', function(done) {
        createDummyUser().then(function (sid) {
            console.log("done, sid:", sid);
            request(app)
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
