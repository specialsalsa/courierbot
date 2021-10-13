const cb = require('../courierbot');

module.exports = {
  name: 'link',
  description: 'various links',
  async execute(message, args) {
    if (args[0] == 'add') {
      let linkToAdd = args[2];
      if (
        !(
          linkToAdd.includes('doordash.com') ||
          linkToAdd.includes('grubhub.com') ||
          linkToAdd.includes('uber.com')
        )
      ) {
        message.channel.send(
          'Message Sal to manually add links from domains other than the gig apps.'
        );
      } else if (
        (await cb.links.entries()).some(link => link.includes(linkToAdd))
      ) {
        let linkArray = (await cb.links.entries()).find(link =>
          link.includes(linkToAdd)
        );

        message.channel.send(`Link already stored under "${linkArray[0]}"`);
      } else {
        await cb.links.set(args[1], linkToAdd);
        message.channel.send(
          `Successfully added link. To access, type \`.link ${args[1]}\``
        );
      }
    } else if (await cb.links.has(args[0])) {
      const thisLink = await cb.links.get(args[0]);
      message.channel.send(thisLink);
    } else if (args[0] == 'showkeys') {
      console.log(await cb.links.entries());
    } else {
      message.channel.send("I don't have a link for that yet!");
    }
  }
};
