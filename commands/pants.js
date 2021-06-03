let pantsImages = require("../pantsImages.json");

module.exports = {
    name: 'pants',
    description: 'Posts pants.',
    cooldown: 10,
    execute(message, args) {
        message.channel.send(
            
            pantsImages.pantsImages[Math.floor(Math.random() * pantsImages.pantsImages.length)]

        );
    }
}