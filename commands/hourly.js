const parse = require('parse-duration');

module.exports = {
  name: 'hourly',
  description:
    'reads in earnings and time worked and returns hourly rate achieved',
  execute(message, args) {
    function hourlyRate(earnings, duration) {
      earnings = earnings.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
      duration = duration.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');

      const durationInHours = parse(duration) / 1000 / 60 / 60;

      return Math.round((earnings / durationInHours) * 100) / 100;
    }

    message.channel.send(`You made $${hourlyRate(args[0], args[1])} / hr!`);
  }
};
