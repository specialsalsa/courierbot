const cb = require("../courierbot");

module.exports = {
    name: "getavatar",
    description: "gets the avatar URL of a user",
    async execute(message, args) {
        if (!args[0]) {
            cb.client.users.fetch(message.member.id).then(thisUser => {
                message.channel.send(thisUser.avatarURL());
            });
        } else {
            let user = message.mentions.users.first();
            message.channel.send(user.avatarURL());
        }
    }
};
