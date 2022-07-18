const cb = require('../courierbot');
const mongoose = require('mongoose');

module.exports = {
  name: 'link',
  description: 'various links',
  async execute(message, args) {
    const addLink = async (keyword, link) => {
      const addedLink = new cb.Link({ keyword: keyword, link: link });
      await addedLink.save();
    };

    const fetchLinkByKeyword = async keyword => {
      const link = await cb.Link.findOne({ keyword: keyword });
      if (!link) return;
      const { keyword: fetchedKeyword, link: fetchedLink } = link;
      return { fetchedKeyword, fetchedLink };
    };

    const fetchLinkByURL = async url => {
      const fetchedURL = await cb.Link.findOne({ link: url });
      if (!fetchedURL) return;
      const { keyword: fetchedKeyword, link: fetchedLink } = fetchedURL;
      return { fetchedKeyword, fetchedLink };
    };

    const fetchedKeywordEntry = await fetchLinkByKeyword(args[0]);

    if (args[0] == 'add') {
      let keywordToAdd = args[1];
      let linkToAdd = args[2];
      const fetchedURLEntry = await fetchLinkByURL(linkToAdd);

      const keywordEntry = await fetchLinkByKeyword(keywordToAdd);

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
          return (
            r.name == 'Bread Police' ||
            r.name == 'Tech Wizard' ||
            r.name == 'The Bread Father'
          );
        })
      ) {
        message.channel.send(
          'Message Sal to manually add links from domains other than the gig apps.'
        );
        return;
      } else if (fetchedURLEntry) {
        message.channel.send(
          `Link already stored under "${fetchedURLEntry.fetchedKeyword}"`
        );
      } else if (keywordEntry) {
        message.channel.send(
          `There is a link already stored under keyword "${keywordToAdd}": ${keywordEntry.fetchedLink}`
        );
      } else {
        await addLink(keywordToAdd, linkToAdd);
        message.channel.send(
          `Successfully added link. To access, type \`.link ${args[1]}\``
        );
      }
    } else if (fetchedKeywordEntry) {
      message.channel.send(fetchedKeywordEntry.fetchedLink);
    } else if (args[0] == 'all') {
      const linkArray = await cb.Link.find();

      const formattedLinks = linkArray
        .map(entry => {
          return `${entry.keyword}: ${entry.link}\n`;
        })
        .join('');

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
