# minvk 2.0
Minimalistic NodeJS VK API

## Installation
``
npm i minvk
``

## Usage

```js
// Create new instance of vk.community
const vk = new VK.community({
    access_token, // access_token for community with at least manage and messages rights
    group_id, // id of group
    url, // web-hook url
    server_id, // server id from vk interface
    port // port of callback server
});

// Create new instance of vk.user
const vk = new VK.user({
    username,
    password,
    // OR
    access_token // access_token for user
});

// Initialize api
await vk.init();

// Make vk api call
await vk.call('messages.send', {/* ... */});
await vk.call('user.getInfo');

// Listen to new messages
// works for both users and communities!
vk.on('message_new', (message) => {/* https://vk.com/dev/objects/message */)); // new messages
vk.on('message_reply', (message) => {/* https://vk.com/dev/objects/message */)); // new replies

// Listen to community events
vk.on('some_event_from_callback_api', () => false);
```

