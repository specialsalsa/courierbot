const cb = require("../courierbot");

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
        let stones = await cb.endb.get("stones");
        // console.log(cb.endb.set("stones", 0));
        stones++;
        await cb.endb.set("stones", stones);
        message.channel.send(`You threw a stone! ${await cb.endb.get("stones")} stones have been thrown.`);
    }
}