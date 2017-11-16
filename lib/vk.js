const request = require('request');
const debug = require('debug')('VK');

const util = require('util');
const EventEmitter = require('events').EventEmitter;

/**
 * Default VK implementation
 * for auth and method calls
 */
class VK{
    constructor(params = {}){
        this.params = params;

        this._init = this._init.bind(this);
        this.call = this.call.bind(this);
        this.uploadPrivateImage = this.uploadPrivateImage.bind(this);
    }

    async _init(){

        const params = this.params;
        this.access_token = null;
        this.account_type = "user";

        if(typeof params !== 'object')
            throw new TypeError("Invalid arguments, expected object");

        if(params.access_token){
            this.access_token = params.access_token;
            debug('got access_token');
            await this.call('users.get');
            try{
                await this.call('account.getInfo');
            }
            catch(e){
                debug('account.getInfo failed, it`s a community');
                this.account_type = "community";
            }
        }
        else if(params.username && params.password){
            const uri = `https://oauth.vk.com/token?grant_type=password` +
                        `&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH` +
                        `&username=${params.username}&password=${params.password}`;

            request(uri, (err, res) => {
                if(err){
                    debug('auth error', err);
                    throw new Error(err);
                }
                const data = JSON.parse(res.body);
                debug(data);
                this.access_token = data.access_token;
                debug('auth success');
            });
            debug('Auth init');
        }
    }

    /**
     * Calls vk method with params
     * returns promise to response
     * @param {string} name
     * @param {object} param
     * @returns {Promise}
     */
    call(name, param={}){
        debug('call', name, param);

        return new Promise((resolve, reject) => {
             if(this.access_token === null){
                 reject(new Error("No access token"));
                 return;
             }

             const data = Object.assign({}, param, {
                 version: "5.69",
                 access_token: this.access_token
             });

             request.post(`https://api.vk.com/method/${name}`, {form: data}, (err, res) => {
                if(err){
                    debug("call", name, err);
                    reject(err);
                    return;
                }

                try{
                    const data = JSON.parse(res.body);
                    if(data.error){
                        debug('api error', data.error);
                        reject(data.error);
                        return;
                    }

                    resolve(data.response);
                }
                catch(e){
                    debug("json parse error", e);
                    reject(e);
                }
             });
        });
    }

    /**
     * Upload image from stream
     * @param {Stream} stream
     * @returns {Promise}
     */
    async uploadPrivateImage(stream){
        debug('uploadPrivateImage');
        const {upload_url} = await this.call("photos.getMessagesUploadServer");
        const data = await new Promise((resolve, reject) => {
            request.post(upload_url, {formData: {photo: stream}}, (err, res) => {
                if(err) reject(err);
                if(res.error) reject(err);
                if(res) resolve(res);
            });
        });
        return this.call("photos.saveMessagesPhoto", data);
    }
}
module.exports = VK;

util.inherits(module.exports, EventEmitter);
