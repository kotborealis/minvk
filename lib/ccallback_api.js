const http = require('http');

const debug = require('debug')('VK.ccalback');

module.exports = function(params, callback = () => false){
    http.createServer((req, res) => {
        res.statusCode = 200;

        if(req.url.slice(1) !== params.secret_key){
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
            }

            if(data.type === 'confirmation'){
                debug('confirmation');
                if(data.group_id === params.group_id){
                    res.write(params.confirmation);
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