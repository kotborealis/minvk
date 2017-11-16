const VK = require('./vk');
const ccallback_api = require('./ccallback_api');
const debug = require('debug')('VK.community');

module.exports = class VK_community extends VK{
    /**
     * @param params
     * @param {string} params.access_token - access token
     * @param {string} params.group_id
     * @param {string} params.confirmation
     * @param {string} params.secret
     * @param {string} params.port
     */
    constructor(params){
        super(params);
    }

    /**
     * Init APi
     * @returns {Promise.<void>}
     */
    async init(){
        await this._init();

        debug("creating community");

        if(this.account_type !== 'community'){
            throw new Error("Cannot create community with account type " + this.account_type);
        }

        this.ccallback_api = new ccallback_api(this.params, (...args) => {
            debug("ccalback calback", ...args);
            this.emit(...args);
        });
    }
};