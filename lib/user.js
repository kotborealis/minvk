const VK = require('./vk');
const request = require('./async-request');
const debug = require('debug')('VK.user');

/**
 * VK implementation for user
 * @type {VK_user}
 */
class VK_user extends VK{
    /**
     * @param params
     * @param {string} [params.access_token]
     * @param {string} [params.username]
     * @param {string} [params.password]
     */
    constructor(params){
        super(params);
    }

    /**
     * Initialize api
     * @returns {Promise.<void>}
     */
    async init(){
        await super._init();

        debug("creating user");

        if(this.account_type !== 'user'){
            throw new Error("Cannot create user with account type " + this.account_type);
        }

        this.longPoll();
    }

    async longPoll(){
        debug('longpoll');
        const data = await this.call('messages.getLongPollServer');

        this.longPollHelper(data).catch(e => this.longPoll());
    }

    async longPollHelper({server, key, ts}){
        const body = await request(`https://${server}?act=a_check&key=${key}&ts=${ts}&wait=25&mode=2&version=2`);
        const data = JSON.parse(body);

        if(data.failed){
            debug('longpollhelper data.failed', data.failed);
            throw new Error(data.failed);
        }
        else{
            debug(data.updates);
            ts = data.ts;
            this.handleUpdates(data.updates);
            await this.longPollHelper({server, key, ts});
        }
    }

    handleUpdates(updates){
        const message_ids_new = updates
            .filter(data => data[0] === 4)
            .filter(data => (data[2] & 2) === 0)
            .map(data => data[1])
            .join(',');

        if(message_ids_new){
            this.call('messages.getById', {message_ids: message_ids_new, preview_length: 0}).then(res => {
                debug(res);
                const items = res.slice(1);
                items.forEach(item => this.emit("message_new", item));
            });
        }

        const message_ids_reply = updates
            .filter(data => data[0] === 4)
            .filter(data => (data[2] & 2) !== 0)
            .map(data => data[1])
            .join(',');

        if(message_ids_reply){
            this.call('messages.getById', {message_ids: message_ids_reply, preview_length: 0}).then(res => {
                debug(res);
                const items = res.slice(1);
                items.forEach(item => this.emit("message_reply", item));
            });
        }
    }
}

module.exports = VK_user;