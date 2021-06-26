const cb = require("../courierbot");

module.exports = {
    name: "rolecount",
    description: "counts number of users with a certain role",
    async execute(message, args) {
        let role = args.join(" ");
        let roleID = message.guild.roles.cache.find((r) => r.name === role).id;
        let guildMembers = await message.guild.members.fetch();
        let memberCounter = 0;
        guildMembers.forEach((member) => {
            if (member._roles.includes(roleID)) {
                memberCounter++;
            }
        });
        message.channel.send(
            `Number of members with role "${role}": ${memberCounter}`
        );
    },
};
