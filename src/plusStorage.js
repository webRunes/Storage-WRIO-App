/**
 * Created by michbil on 18.05.17.
 */

const PlusRecord = require('./models/plusRecord.js');
const {Router} = require('express');
const {login} = require('wriocommon');



function getRoute(db) {
    const router = new Router();

    router.get('/api/plusData', login.wrioAuth, login.wrap(async function(request, response) {
        response.set('Content-Type', 'application/json');
        console.log("IOS read request");
        if (request.user && request.user.wrioID) {
            const record = new PlusRecord(db);
            response.json(await record.getRecord(request.user.wrioID) || {});
        } else {
            response.send({
                "error": 'Wrong context'
            });
        }
    }));

    router.post('/api/plusData', login.wrioAuth, login.wrap(async function(request, response) {
        console.log("IOS write request");
        response.set('Content-Type', 'application/json');

        const bodyData = request.body.data;

        if (!bodyData) {
            console.log("Wrong parameters");
            response.status(403);
            response.send({
                "error": 'Wrong parameters'
            });
            return;
        }

        if (request.user && request.user.wrioID) {
            const record = new PlusRecord(db);
            await record.create(request.user.wrioID,bodyData);
            response.json({"success":"true"});
        } else {
            response.send({
                "error": 'Wrong context'
            });
        }

    }));

    return router;
}

module.exports = getRoute;
