module.exports = {
    name: 'pantsInterval',
    description: 'Allows staff to post "Pants" every 8 hours until manually stopped.',
    execute(message, args) {
        if (message.member.roles.cache.find(r => r.name === "Admin") 
        || message.member.roles.cache.find(r => r.name === "Mod") 
        || message.member.roles.cache.find(r => r.name === "Developer")
         ) {
        message.channel.send("Pants. Commencing 8-hour Pants Interval.");
        let timer = 28800000; // 8 hours in miliseconds
        pantsInterval = setInterval(function() { message.channel.send("Pants."); }, timer);
        }
    }
}