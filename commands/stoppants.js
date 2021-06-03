module.exports = {
    name: "stoppants",
    description: "Allows staff to manually stop the Pants Interval.",
    execute(message, args) {
            if (message.member.roles.cache.find(r => r.name === "Admin") 
            || message.member.roles.cache.find(r => r.name === "Mod") 
            || message.member.roles.cache.find(r => r.name === "Developer")
            ) {
            clearInterval(pantsInterval);
            message.channel.send("Pants interval stopped.");
        }
    }
}