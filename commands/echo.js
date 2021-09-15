module.exports = {
  name: 'echo',
  description: 'repeats given message in the channel it was sent',
  async execute(message, args) {
    let echoedMessage = '';
    let mentionedChannel = '';
    if (args[0].includes('#') || message.content.split(' ')[0].includes('#')) {
      mentionedChannel = message.mentions.channels.first().id;
      echoedMessage = message.content.replace(`.echo ${args[0]} `, '');
      message.delete();
      message.guild.channels.cache.get(mentionedChannel).send(echoedMessage);
    } else {
      echoedMessage = message.content.replace('.echo ', '');
      message.delete();
      message.channel.send(echoedMessage);
    }
  }
};
