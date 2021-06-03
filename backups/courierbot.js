const Discord = require("discord.js");
const client = new Discord.Client();
const token = require("./token.js");
const usersJson = require("./users.json");
const fileName = "./users.json";
const fs = require("fs");
const Enmap = require("enmap");
const config = require("./config.json");
// const DiscordModule = require('discord-module');
// const options = {
//   token: config.token,
// };
// const discord = new DiscordModule(options);
// const guild = discord.getGuildById('531182018571141132');

client.points = new Enmap({
  name: "points",
});

client.points.defer.then(() => {
  console.log(client.points.size + " keys loaded");
  client.points.set("blah", "foo");
  console.log(client.points.get("blah"));
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

});

client.on("message", (message) => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "mention") {
    let member = args[0];
    message.channel.send(`Hi there, ${member}!`);
  }
});




client.on("message", (message) => {
  if (message.author.bot) return;
  if (message.guild) {
    const key = `${message.guild.id}-${message.author.id}`;
    client.points.ensure(key, {
      user: message.author.id,
      guild: message.guild.id,
      points: 0,
      level: 1,
    });
    

    client.points.inc(key, "points");

    const curLevel = Math.floor(
      0.1 * Math.sqrt(client.points.get(key, "points"))
    );

    if (client.points.get(key, "level") < curLevel) {
      message.reply(
        `You've leveled up to level **${curLevel}**! Ain't that dandy?`
      );
      client.points.set(key, curLevel, "level");
    }
  }
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "points") {
    const key = `${message.guild.id}-${message.author.id}`;
    return message.channel.send(
      `You currently have ${client.points.get(
        key,
        "points"
      )} points, and are level ${client.points.get(key, "level")}!`
    );
  }
});

// discord.onmessage = (message, reply) => {
//   if (message.content === 'Say Hi') {
//     reply('Hi');
//   }
// };

client.on("message", (message) => {
  if (message.author.bot) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  let counter = 0;
  if (command === "newCount") {
    client.points.set(counter, 0, "counter");
    message.channel.send(`New counter set at ${client.points.get("counter")}`);
  }
  });

client.on("message", (msg) => {
  if (msg.content === ".ghPay") {
    msg.channel.send(
      "Grubhub pay FAQ: https://driver-support.grubhub.com/hc/en-us/categories/115001254786-Getting-Paid"
    );
  }
});

client.on("message", (message) => {
  let args = message.content.slice(config.prefix.length).trim().split(/ +/);
  let command = args.shift().toLowerCase();
  if (command === "tryThis") {
    if (message.author.bot) return;
    message.channel.send("Hi there!");
  }
});

client.on("message", (msg) => {
  if (msg.content === ".pants") {
    msg.channel.send("Pants. Commencing 8-hour Pants Interval.");
    var interval = setInterval(function () {
      msg.channel.send("Pants.");
    }, 1000 * 60 * 60 * 8);
  }
});

// client.on("message", (msg) => {
//   const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
//   const command = args.shift().toLowerCase();
//   if (msg.content === "pants") {
//     msg.channel.send("Pants. Commencing 8-hour Pants Interval.");
//     var interval = setInterval(function () {
//       msg.channel.send("Pants.");
//     }, 1000 * 60 * 60 * 8);
//   }
// });

client.on("message", (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "setRecurringMsg") {
    console.log("Hello???");
    if (
      member.roles.cache.some(role => role.name === 'Mod')
    || member.roles.cache.some(role => role.name === 'Trial Mod')
    || member.roles.cache.some(role => role.name === 'Admin')
    || member.roles.cache.some(role => role.name === 'Developer')
    || member.roles.cache.some(role => role.name === 'courierbot')
  ) {
    var interval = args[0] * 1000 * 60;
    setInterval(function () {
      msg.channel.send(args.slice(1).join(' '));
    }, interval);
  }
}
});

client.on("message", (msg) => {
  if (msg.content === ".ddPay") {
    msg.channel.send(
      "Dasher pay FAQ: https://help.doordash.com/dashers/s/topic/0TO1a0000007fAsGAI/payments?language=en_US"
    );
  }
});

client.on("message", (msg) => {
  if (msg.content.toLowerCase() === ".throwStone".toLowerCase()) {
    usersJson.stones += 1;
    fs.writeFile(
      fileName,
      JSON.stringify(usersJson, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(usersJson));
        console.log("writing to " + fileName);
      }
    );
    msg.channel.send(
      `You threw a stone! ${usersJson.stones} stones have been thrown.`
    );
  }
});

client.on("message", (message) => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "checkpoints")  {
    message.channel.send("Yup.");
  }
});

client.login(token);
