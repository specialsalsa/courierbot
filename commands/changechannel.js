const e = require('express');

let ranInLast30Minutes = false;
let timeCommandRan = new Date();
module.exports = {
  name: 'changechannel',
  description: 'renames the change-a-topic channel',
  async execute(message, args) {
    if (ranInLast30Minutes) {
      message.channel.send(
        `Command has been ran in the last 30 minutes, please wait ${
          30 - Math.ceil((Date.now() - timeCommandRan) / 1000 / 60) + 1
        } minutes to run again`
      );
      return;
    }

    if (message.channel.id === '889752147623837776') {
      let threeDayTimerID;
      const threeDayTimer = () => {
        threeDayTimerID = setTimeout(() => {
          message.channel.setName(`☕-choose-a-topic`);
        }, 1000 * 60 * 60 * 72);
      };

      let channelName = args[0];
      if (args.length > 1) {
        channelName = args.join('-');
      }

      if (channelName.length > 100) {
        message.channel.send(
          `Channel name must be between 1 and 100 characters in length`
        );
        return;
      }
      message.channel.setName(`☕-${channelName}`);

      message.channel.send(`\`\`\`
      

      CHANNEL HAS BEEN CHANGED TO: ${channelName.toUpperCase()}

      \`\`\``);

      ranInLast30Minutes = true;
      timeCommandRan = Date.now();

      setTimeout(() => {
        ranInLast30Minutes = false;
      }, 1800000);

      clearTimeout(threeDayTimerID);
      threeDayTimer();
    } else {
      message.channel.send(
        'You can only use this command in the choose-a-topic channel (marked with the ☕ emoji).'
      );
    }
  }
};
