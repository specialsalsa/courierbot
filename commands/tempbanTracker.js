const cb = require('../courierbot');

module.exports = {
  name: 'tempbans',
  description: 'tracks tempbans',
  async execute(message, args) {
    if (args[0] == 'show') {
      let allTempbans = await cb.tempbans.all();

      let listOfTempbans = '';

      allTempbans.forEach(tempban => {
        let tempbanLocaleString = new Date(tempban.value).toLocaleString();

        listOfTempbans += `${tempban.key}: ${tempbanLocaleString} \n\n`;
      });

      message.channel.send(`Tempbanned users and their expiration dates:


${listOfTempbans}`);
    }
  }
};
