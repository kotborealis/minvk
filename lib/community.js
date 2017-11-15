const VK = require('./vk');
const ccallback_api = require('./ccallback_api');
const debug = require('debug')('VK.community');

module.exports = class VK_community extends VK{
    constructor(...args){
        super(...args);
    }
    async init(...args){
        await super.init(...args);

        debug("creating community");

        if(this.account_type !== 'community'){
            throw new Error("Cannot create community with account type " + this.account_type);
        }

        this.ccallback_api = new ccallback_api(this.params);
        this.ccallback_api.on('new_message', (...args) => debug(...args));
    }
};