const
    retry_count = 3,
    request = require('request'),
    get_token = (retry, cb) =>
        request(
            {
                method: 'GET',
                url: 'https://pluginst.identitymind.com/api/auth',
                headers: {
                    'x-api-key': 'a8Ue4JVe4s8hIZ3mrbJcw7bFAOHcpIFn6O3VcAD1'
                }
            },
            (error, response, body) => {
                if (error) {
                    if (retry_count) {
                        get_token(retry_count - 1, cb);
                    } else {
                        throw new Error(error);
                    }
                } else {
                    cb(JSON.parse(body).token);
                }
            }
        );

module.exports = cb => get_token(retry_count, cb);
