const cb = require('../courierbot.js');

module.exports = {
  name: 'setbirthday',
  description:
    'Adds your birthday to the calendar and gives you a birthday message on that day. Format: .setbirthday <month> <day>',
  async execute(message, args) {
    let month = args[0];
    let day = args[1] + 1;
    let today = new Date();

    let thisYear = today.getFullYear();

    console.log(args[0]);

    try {
      let thisBirthday = new Date(`${thisYear}-${month}-${day}`);

      await cb.birthdays.set(message.member.id, thisBirthday);
    } catch (e) {
      message.channel.send(`Error setting birthday`);
    }

    message.channel.send(`Successfully set your birthday!`);
  }
};
