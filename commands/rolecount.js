module.exports = {
  name: 'rolecount',
  description: 'counts number of users with a certain role',
  async execute(message, args) {
    let role = args.join(' ');
    let roleID;
    let roleOriginalCase;
    try {
      roleID = message.guild.roles.cache.find(
        r => r.name.toLowerCase() === role.toLowerCase()
      ).id;
      roleOriginalCase = message.guild.roles.cache.find(
        r => r.name.toLowerCase() === role.toLowerCase()
      ).name;
    } catch (err) {
      console.log(`.rolecount executed with unknown role ${role}`);
    }

    if (roleID) {
      let guildMembers = await message.guild.members.fetch();
      let memberCounter = 0;
      guildMembers.forEach(member => {
        if (member._roles.includes(roleID)) {
          memberCounter++;
        }
      });
      message.channel.send(
        `Number of members with role "${roleOriginalCase}": ${memberCounter}`
      );
    } else {
      message.channel.send(`role "${roleOriginalCase}" not found`);
    }
  }
};
