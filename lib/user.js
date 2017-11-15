const VK = require('./vk');
const request = require('./async-request');
const debug = require('debug')('VK.user');

module.exports = class VK_community extends VK{
    constructor(...args){
        super(...args);
    }
    async init(...args){
        await super._init(...args);

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
            ts = data.ts;
            this.handleUpdates(data.updates);
            await this.longPollHelper({server, key, ts});
        }
    }

    handleUpdates(updates){
        const message_ids = updates.filter(data => data[0] === 4).map(data => data[1]).join(',');
        if(message_ids){
            this.call('messages.getById', {message_ids, preview_length: 0}).then(res => {
                debug(res);
                const items = res.slice(1);
                items.forEach(item => this.emit("message_new", item));
            });
        }
    }
};

const dialogFlags = {
    1: 'unread',
    2: 'outbox',
    4: 'replied',
    8: 'important',
    16: 'chat',
    32: 'friends',
    64: 'spam',
    128: 'delеtеd',
    256: 'fixed',
    512: 'media',
    65536: 'hidden'
};

const groupFlags = Object.assign({}, dialogFlags, {
    1: 'important',
    2: 'answered'
});

function parseFlags(sum, type = false) {
    let list = type ? groupFlags : dialogFlags;

    let flags = [];

    for(let i = 0, bit = 1; i < 10; ++i, bit *= 2){
        if((sum & bit) !== 0){
            flags.push(list[bit]);
        }
    }

    return flags;
}