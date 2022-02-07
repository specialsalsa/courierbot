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
          linkToAdd.includes('uber.com') ||
          linkToAdd.includes('shipt.com') ||
          linkToAdd.includes('postmates.com') ||
          linkToAdd.includes('roadie.com') ||
          linkToAdd.includes('instacart.com')
        ) &&
        !message.member.roles.cache.some(r => {
          r.name == 'Bread Police' ||
            r.name == 'Tech Wizard' ||
            r.name == 'The Bread Father';
        })
      ) {
        message.channel.send(
          'Message Sal to manually add links from domains other than the gig apps.'
        );
        return;
      } else if (
        (await cb.links.entries()).some(link => link.includes(linkToAdd))
      ) {
        let linkEntry = (await cb.links.entries()).find(link =>
          link.includes(linkToAdd)
        );

        message.channel.send(`Link already stored under "${linkEntry[0]}"`);
      } else {
        await cb.links.set(args[1], linkToAdd);
        message.channel.send(
          `Successfully added link. To access, type \`.link ${args[1]}\``
        );
      }
    } else if (await cb.links.has(args[0])) {
      const thisLink = await cb.links.get(args[0]);
      message.channel.send(thisLink);
    } else if (args[0] == 'all') {
      const links = await cb.links.entries();

      const formattedLinks = links
        .map(link => {
          return `${link[0]}: ${link[1]}\n`;
        })
        .join('');

      console.log(formattedLinks);

      message.channel.send(`=== LIST OF ALL LINKS ===
${formattedLinks}`);
    } else if (args[0] == 'help') {
      message.channel
        .send(`Use this to add or pull up helpful links from the gig app websites to assist other members.
      Add a link: \`.link add <name> <URL>\`
      View all links: \`.link all\`
      Pull up a link: \`.link <name>\``);
    } else {
      message.channel.send("I don't have a link for that yet!");
    }
  }
};
