module.exports = {
  name: 'eggright',
  description: 'egg is never wrong',
  async execute(message, args) {
    let random = Math.floor(Math.random() * 2) + 1;
    if (random === 1) {
      message.channel.send('https://i.imgur.com/rBUHPcc.jpg');
    } else {
      message.channel.send('https://i.imgur.com/pX0Ad2S.jpg');
    }
  }
};
