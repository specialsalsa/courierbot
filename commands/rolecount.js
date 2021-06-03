module.exports = {
    name: 'rolecount',
    description: 'counts number of users with a certain role',
    execute(message, args) {
        try {
            const Role = message.guild.roles.cache.find(role => role.name == args[0]);
            const Members = message.guild.members.cache.filter(member => member.roles.cache
                .find(role => role == Role))
                .map(member => member.user.tag);
            message.channel.send(`Number of users with role "${Role.name}": ${Members.length}`);
        } catch (e) {
            message.channel.send(`Please enter a valid role (roles are case-sensitive).`);
        }
    }
}