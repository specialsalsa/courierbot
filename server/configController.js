const cb = require('../courierbot');
const WebSocket = require('ws');
const PORT = process.env.PORT || 3033;
const INDEX = '/index.html';
const express = require('express');

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocket.Server({ server });

// let messageArray = [];

const sendMemberCounts = () => {
  wss.on('connection', function connection(ws) {
    console.log('opened connection');

    // cb.client.on('message', message => {
    //   console.log('received message');
    //   let newMessage = {
    //     content: message.content,
    //     member: message.member.id,
    //     timestamp: Date.now()
    //   };

    //   messageArray.push(newMessage);

    //   setInterval(() => {
    //     let messageLastHourCount = messageArray.filter(msg => {
    //       return (Date.now() - msg.timestamp) / 1000 / 60 <= 60;
    //     }).length;
    //     ws.send(JSON.stringify({ messages: messageLastHourCount }));
    //   }, 10000);
    // });

    const sendCounts = () => {
      let memberCounts = JSON.stringify({
        memberCount:
          cb.client.guilds.cache.get('531182018571141132').memberCount,
        botCount: cb.client.guilds.cache
          .get('531182018571141132')
          .members.cache.filter(member =>
            member.roles.cache.some(r => r.name === 'bots')
          ).size,
        onlineCount: cb.client.guilds.cache
          .get('531182018571141132')
          .members.cache.filter(
            m =>
              m.presence.status === 'online' ||
              m.presence.status === 'idle' ||
              m.presence.status === 'dnd'
          ).size
      });
      ws.send(memberCounts);
    };

    sendCounts();

    let listenerObj = {
      guildMemberAdd: sendCounts,
      guildMemberRemove: sendCounts,
      presenceUpdate: sendCounts
    };

    for (listener in listenerObj) {
      cb.client.on(listener, listenerObj[listener]);
    }

    ws.on('message', function incoming(message) {
      if (message === 'Remove listeners plz') {
        for (listener in listenerObj) {
          cb.client.removeListener(listener, listenerObj[listener]);
        }
      }
    });
  });
};

module.exports = {
  sendMemberCounts,
  wss
};
