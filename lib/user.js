const VK = require('./vk');
const request = require('./async-request');
const debug = require('debug')('VK.user');

module.exports = class VK_community extends VK{
    constructor(...args){
        super(...args);
    }
    async init(...args){
        await super.init(...args);

        debug("creating user");

        if(this.account_type !== 'user'){
            throw new Error("Cannot create user with account type " + this.account_type);
        }
    }

    async longPoll(){
        debug('longpoll');
        
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


