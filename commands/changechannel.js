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
      let channelName = args[0];
      if (args.length > 1) {
        channelName = args.join('-');
      }
      message.channel.setName(`☕-${channelName}`);
      ranInLast30Minutes = true;
      timeCommandRan = Date.now();

      setTimeout(() => {
        ranInLast30Minutes = false;
      }, 1800000);

      // resets channel name after 3 days since command last ran
      setTimeout(() => {
        message.channel.setName(`☕-choose-a-topic`);
      }, 1000 * 60 * 60 * 72);
    } else {
      message.channel.send(
        'You can only use this command in the choose-a-topic channel (marked with the ☕ emoji).'
      );
    }
  }
};
