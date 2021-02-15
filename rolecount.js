module.exports = {
    name: 'rolecount',
    description: 'counts number of users with a certain role',
    execute(message, args) {
        if (args[0]) {
            try {
                const Role = message.guild.roles.cache.find(role => role.name == args[0]);
                const Members = message.guild.members.cache.filter(member => member.roles.cache.find(role => role == Role)).map(member => member.user.tag);
                message.channel.send(`Number of users with ${Role.name}: ${Members.length}`);
            } catch (e) {
                message.channel.send(`Please enter a valid role (roles are case-sensitive).`);
            }
        }
    }
}