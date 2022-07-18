const cb = require('../courierbot.js');
const mongoose = require('mongoose');

const Birthday = mongoose.model('Birthday', { user: String, date: Date });

module.exports = {
  name: 'setbirthday',
  description:
    'Adds your birthday to the calendar and gives you a birthday message on that day. Format: .setbirthday <month> <day>',
  async execute(message, args) {
    const month = args[0];
    const day = args[1] + 1;
    const today = new Date();

    const thisYear = today.getFullYear();

    console.log(args[0]);

    try {
      const thisBirthday = new Date(thisYear, month, day);
      const thisUser = message.author.id;

      const birthday = new Birthday({ user: thisUser, date: thisBirthday });
      await birthday.save();
    } catch (e) {
      message.channel.send(`Error setting birthday`);
      console.log(e);
    }

    message.channel.send(`Successfully set your birthday!`);
  }
};
