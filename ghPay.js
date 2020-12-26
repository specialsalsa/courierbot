module.exports = {
    name: 'ghpay',
    description: 'Links to GrubHub pay FAQ',
    execute(message, args) {
        message.channel.send("Grubhub pay FAQ: https://driver-support.grubhub.com/hc/en-us/categories/115001254786-Getting-Paid");
    },
};