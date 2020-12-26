module.exports = {
    name: 'ddpay',
    description: 'Links to DoorDash dasher pay FAQ',
    execute(message, args) {
        message.channel.send(
            "Dasher pay FAQ: https://help.doordash.com/dashers/s/topic/0TO1a0000007fAsGAI/payments?language=en_US"
          );
    }
};