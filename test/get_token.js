const
    assert = require('assert'),
    get_token = require('../src/utils/get_token');

describe('Get kyc token for user registration at Supported Round', () => {

    it('get_token should return not empty string', done => {
        get_token(token => {
            assert(typeof token === 'string' && token !== '');
            done();
        });
    });

});
