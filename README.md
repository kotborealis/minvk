# minvk
Minimalistic NodeJS VK API

## Installation
``
npm i --save minvk
``

##Usage
```JS
const MinVK = require('minvk');
const vk = MinVK({
  mode:"token",
  access_token:"..."
});
//OR
const vk = MinVK({
  mode:"auth",
  username:"...",
  password:"..."
});

//Calls method.name with params object
vk.call("method.name",params,(err,res)=>{});

//Starts longPoll
vk.longPoll((err,res)=>{});

//Retunrns message attachments by message id
vk.messageGetAttachments(id,(err,res)=>{});

//Uploads image from stream, returns attachment id
vk.uploadPrivateImage(readableStream,(err,res)=>{});

//Send message to user/chat with attachments
vk.sendMessageAuto(text,id,attachments,(err,res)=>{});

//Checks if given id belongs to chat
vk.isChatId(id);
```
