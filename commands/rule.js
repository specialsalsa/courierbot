const rulesArray = [
  "Be respectful. Keep it civil. Don't spam or be offensive.",
  'All users must be over the age of 18. This is required as the youngest age you can do gig work is 18.',
  'No NSFW, racist, sexist, or homophobic content. This includes your username and profile picture.',
  'No pinging mods or service roles for no reason. Use this function for necessary purposes only.',
  "Do NOT post any customer's or restaurant's personal information, such as addresses or phone numbers. If you post screenshots of your apps, blur or crop out sensitive info!",
  'Only post promo links in the designated channel.',
  'Promoting "reduced price orders" is fraud and is not allowed.',
  'Attempting to "dox" or "doxing" member of this community is strictly prohibited.',
  'Anything deemed to not be appropriate for this server will be deleted.',
  "Do not harass or spam in the DM's of members, reports of this nature are taken seriously.",
  'Keep any criticism constructive. If someone asks a question, answer it without bashing the asker.',
  'Do not spread confidential information in any channel or breach the “terms of service” or “contract” between you and any company.',
  'Do not job shame.',
  'Political discussions are discouraged if you do choose to have one have evidence backing up any claims made and do not resort to personal attacks of any kind.'
];

module.exports = {
  name: 'rule',
  description:
    'posts a description of the selected rule along with a link to #rules-and-info',
  execute(message, args) {
    const selectedRuleIndex = args[0] - 1;
    if (!rulesArray[selectedRuleIndex]) {
      message.channel.send('Invalid rule selection.');
      return;
    }
    message.channel.send(`Rule ${args[0]}: ${rulesArray[selectedRuleIndex]}
    See ${message.guild.channels.cache.find(
      channel => channel.id == '531187480658051073'
    )}`);
  }
};
