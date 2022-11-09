const { client } = require('../courierbot');

client.on('messageCreate', message => {
  if (message.content === 'heyoo') {
    message.channel.send('Heyo for Yayo');
  }
});
