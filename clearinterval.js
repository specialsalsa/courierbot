module.exports = {
    name: 'stopmessage',
    description: 'clears recurring message',
    execute(message, args) {
            message.channel.send('Stopping recurring message.');
            clearInterval(interval);
    }
};