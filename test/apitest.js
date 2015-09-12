/**
 * Created by mich.bil on 27.05.15.
 */
var app = require("../server.js");
var request = require('supertest');
var assert = require('assert');
var should = require('should');

var stdout_write = process.stdout._write,
    stderr_write = process.stderr._write;

process.stdout._write = stdout_write;
process.stderr._write = stderr_write;

var Session = require('supertest-session')({
    app: require('../server.js')
});

var ready = false;
app.ready = function() {
    ready = true;
};

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
});
