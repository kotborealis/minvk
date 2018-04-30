const http = require('http');

const debug = require('debug')('VK.ccalback');

module.exports = function(params, callback = () => false){
    http.createServer((req, res) => {
        res.statusCode = 200;

        if(req.url.indexOf(params.secret_key) < 0){
            debug("Wrong secret");
            res.end();
            return;
        }

        const buffer = [];

        req.on('error', (err) => {
            debug('callback server error', err);
            res.statusCode = 200;
            res.write('ok');
            res.end();
        }).on('data', (chunk) => {
            buffer.push(chunk);
        }).on('end', () => {
            const body = Buffer.concat(buffer).toString();
            debug('got', body);

            let data = {};
            try{
                data = JSON.parse(body);
            }
            catch(err){
                debug('callback server error', err);
                res.write('ok');
                res.end();
                return;
            }

            if(data.type === 'confirmation'){
                debug('confirmation');
                if(data.group_id === params.group_id){
                    debug("Send confirm", params.confirmation);
                    res.write(params.confirmation);
                }
                else{
                    debug("Bad data");
                }
            }
            else{
                callback(data.type, data.object);
                res.write('ok');
            }
            res.end();
        });
    }).listen(params.port);
};