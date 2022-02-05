const cb = require('../courierbot');

// Enmap configuration

// module.exports = {
//     name: 'throwstone',
//     description: 'throws a stupid stone',
//     execute(message, args) {
//         cb.stones.inc("stones");
//         message.channel.send(`You threw a stone! ${cb.stones.get("stones")} stones have been thrown.`)
//     }
// }

// Endb configuration

module.exports = {
  name: 'throwstone',
  description: 'throws a dumbass stone',
  async execute(message, args) {
    let stones = await cb.stones.get('stones');
    // console.log(cb.stones.set("stones", 0));
    stones++;
    await cb.stones.set('stones', stones);
    message.channel.send(
      `You threw a stone! ${await cb.stones.get(
        'stones'
      )} stones have been thrown.`
    );
  }
};
