'use strict';

const request = require('request');
const html_entities=require("html-entities").AllHtmlEntities;

module.exports = function(init){
    if(typeof init !== "object")
        throw new Error("first argument must be an object");

    const user_data = {};
    if(init.mode === "access_token")
        user_data.access_token = init.access_token;
    else if(init.mode === "auth"){
        const uri = `https://oauth.vk.com/token?grant_type=password`+
        `&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH`+
        `&username=${init.username}&password=${init.password}`;
        request(uri,(err,res)=>{
            if(err)
                throw new Error(JSON.stringify(err));
            const data = JSON.parse(res.body);
            user_data.access_token = data.access_token;
            user_data.user_id = data.user_id;
            console.log(user_data);
        });
    }

    this.call = (name,param,callback)=>{
        if(!callback)callback=()=>{};
        param.access_token = param.access_token || user_data.access_token;
        param.version = "5.52";
        request.post(`https://api.vk.com/method/${name}`,{form:param},(err,res)=>{
            if(err)
                callback(err,null);
            else{
                const data = JSON.parse(res.body);
                if(data.error)
                    callback(true,data.error);
                else
                    callback(null,data.response);
            }
        })
    };

    this.longPoll = (callback)=>{
        if(!callback)
            return;
        this.call("messages.getLongPollServer",{},(err,res)=>{
            if(err)
                callback(res,null);
            else
                longPollHelper(res.server,res.key,res.ts,callback);
        });
    };

    const longPollHelper = (server,key,ts,callback)=>{
        request(`https://${server}?act=a_check&key=${key}&ts=${ts}&wait=25&mode=2`,{timeout:25000},(err,res)=>{
            if(!err){
                const data = JSON.parse(res.body);
                ts = data.ts;
                callback(null,data.updates);
            }
            longPollHelper(server,key,ts,callback);
        });
    };

    this.messageGetAttachments = (id,callback)=>{
        this.call("messages.getById",{message_ids:id},(err,res)=> {
            if(err)
                callback(err, res);
            else
                callback(err, res[1].attachments);
        });
    };

    this.uploadPrivateImage = (stream,callback)=>{
        this.call("photos.getMessagesUploadServer",{},(err,res)=>{
            if(err)
                callback(err,res);
            else
                request.post(res.upload_url,{formData:{
                    photo: stream
                }}, (err,res)=>{
                    const data = JSON.parse(res.body);
                    if(err || data.error)
                        callback(true,data.error);
                    else
                        this.call("photos.saveMessagesPhoto",data,callback);
                });
        });
    };

    this.isChatId = (id)=> id - 2e9 >= 0;

    this.sendMessageAuto = (text,id,att,callback)=>{
        const data = {
            message:text,
            attachment: att.join(',')
        };

        if(this.isChatId(id))
            data.chat_id = id - 2e9;
        else
            data.user_id = id;

        this.call("messages.send",data,callback);
    };
};