module.exports = {
  name: 'unixtime',
  description: 'prints current unix time',
  execute(message, args) {
    message.channel.send(
      `The current Unix time is ${Math.round(Date.now() / 1000)}.`
    );
  }
};
