const sampleEmbed = {
  embed: {
    type: 'rich',
    title: `hi there`,
    description: `hi`,
    color: 0x00ffff,
    fields: [
      {
        name: `hi`,
        value: `hi`
      }
    ]
  }
};

const { Client } = require('discord.js');
// const fetch = require('node-fetch');

// const client = new Client();

// client.on('message', async message => {
//   if (message.author.bot) return;

//   // get the file's URL
//   const file = message.attachments.first()?.url;
//   if (!file) return console.log('No attached file found');

//   try {
//     message.channel.send('Reading the file! Fetching data...');

//     // fetch the file from the external URL
//     const response = await fetch(file);

//     // if there was an error send a message with the status
//     if (!response.ok)
//       return message.channel.send(
//         'There was an error with fetching the file:',
//         response.statusText
//       );

//     // take the response stream and read it to completion
//     const text = await response.text();

//     if (text) {
//       // message.channel.send(`\`\`\`${text}\`\`\``);

//       let embeddedJSON = JSON.parse(text);
//       message.channel.send(embeddedJSON);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

// const fetch = require('node-fetch');

// module.exports = {
//   name: 'embed',
//   description: 'creates a message embed with an uploaded text file',
//   async execute(message, args) {
//     if (message.author.bot) return;

//     // get the file's URL
//     const file = message.attachments.first()?.url;
//     if (!file) return console.log('No attached file found');

//     message.delete();

//     try {
//       // message.channel.send('Reading the file! Fetching data...');

//       // fetch the file from the external URL
//       const response = await fetch(file);

//       // if there was an error send a message with the status
//       if (!response.ok)
//         return message.channel.send(
//           'There was an error with fetching the file:',
//           response.statusText
//         );

//       // take the response stream and read it to completion
//       let text = await response.text();

//       text = '{"embeds": [' + text;
//       text = text.concat(']}');

//       if (text) {
//         // message.channel.send(`\`\`\`${text}\`\`\``);

//         let embeddedJSON = JSON.parse(text);
//         message.channel.send(embeddedJSON);
//       }
//     } catch (error) {
//       console.log(error);
//     }

//     // let embedJSON = JSON.parse(message.content.replace('.embed ', ''));
//     // // message.channel.send(embedJSON);
//     // message.channel.send(embedJSON);
//   }
// };
