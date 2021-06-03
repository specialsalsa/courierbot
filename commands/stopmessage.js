module.exports = {
    name: 'stopmessage',
    description: 'clears recurring message',
    execute(message, args) {
        if (message.member.roles.cache.find(r => r.name === "Admin") 
        || message.member.roles.cache.find(r => r.name === "Mod") 
        || message.member.roles.cache.find(r => r.name === "Developer")
         ) {
            message.channel.send('Stopping recurring message.');
            clearInterval(interval);
        } else {
            message.reply("you don't have permission to do that!");
        }
    }
};