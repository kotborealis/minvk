const VK = require('./vk');
const ccallback_api = require('./ccallback_api');
const debug = require('debug')('VK.community');

class VK_community extends VK{
    /**
     * @param params
     * @param {string} params.access_token - access token
     * @param {number} params.group_id - group id
     * @param {string} params.confirmation - confirmation secret
     * @param {string} params.secret - secret
     * @param {number} params.port - callback server port
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

        const {group_id, url, server_id} = this.params;

        debug("creating community");

        if(this.account_type !== 'community'){
            throw new Error("Cannot create community with account type " + this.account_type);
        }

        const secret_key = this.params.secret_key;

        const server = {
            group_id,
            url: url + '/' + secret_key,
            title: "minvk",
            secret_key,
            server_id
        };

        const {count} = await this.call("groups.getCallbackServers", {group_id, server_ids: server_id.toString()});
        if(!count){
            throw new Error("No server with provided id");
        }

        await this.call("groups.editCallbackServer", server);

        if(!this.params.confirmation){
            debug("Get confrimation code");
            const {code} = await this.call("groups.getCallbackConfirmationCode", {group_id});
            this.params.confirmation = code;
        }

        await this.call("groups.setCallbackSettings", {
            group_id,
            server_id,
            message_new: 1,
            message_reply: 1,
            message_allow: 1,
            message_deny: 1
        });

        this.ccallback_api = new ccallback_api(this.params, (...args) => {
            debug("ccalback calback", ...args);
            this.emit(...args);
        });
    }
}

module.exports = VK_community;