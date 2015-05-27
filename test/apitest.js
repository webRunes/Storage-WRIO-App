/**
 * Created by mich.bil on 27.05.15.
 */
var app = require("../server.js");
var request = require('supertest');

var stdout_write = process.stdout._write,
    stderr_write = process.stderr._write;

process.stdout._write = stdout_write;
process.stderr._write = stderr_write;


describe("Save api tests", function() {
    before(function(done) {
        setTimeout(done,2000);
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
            .expect(200,{"success":"true"})
            .expect('set-cookie', /sid/)
            .end(function(err, res){
                if (err) throw err;
                done();
            });

    });

    it("shuld raise error because of wrong parameters",function(done) {
        request(app)
            .post('/api/save')
            .expect('Content-Type', /json/)
            .expect(403,{"error":'Wrong parameters'})
            .end(function (err, res) {
                if (err) throw err;
                done();
            });
    });
});
