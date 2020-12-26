const Keyv = require("keyv")

module.exports = {
    name: 'recurringmessage',
    description: 'Allows staff to set and reset recurring messages.',
    execute(message, args) {
        if (member.roles.cache.some(role => role.name === 'Mod')
        || member.roles.cache.some(role => role.name === 'Admin')
        || member.roles.cache.some(role => role.name === 'Trial Mod')
        || member.roles.cache.some(role => role.name === 'Developer')
        ) {
        let unit = args[0][args[0].length - 1]
        let timer = args[0].slice(0, -1);
        if (unit == 'm') {
            timer = timer * 1000 * 60;
        } else if (unit == 'h') {
            timer = timer * 1000 * 60 * 60;
        } else if (unit == 'd') {
            timer = timer * 1000 * 60 * 60 * 24;
        } else {
            message.channel.send("Please enter a valid interval (units: m, h, d).");
            return;
        };

        interval = setInterval(function() { 
            message.channel.send(message.content.replace(`.recurringmessage ${args[0]}`, '')
            );}, timer);
        }
    }
    };