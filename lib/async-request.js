const request = require('request');

module.exports = (...args) =>
    new Promise((resolve, reject) => request(...args, (err, res, body) => (!err) ? resolve(body) : reject(err)));