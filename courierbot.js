const fs = require("fs");
const Discord = require("discord.js");
// const Endb = require('endb');

// const { con } = require("./database");
const axios = require("axios");
const configController = require("./server/configController");
const {
  startChannelTimer,
  resetChannelTimer,
} = require("./commands/startChannelTimer");
const { setIntervalAsync } = require("set-interval-async");
let features = require("./features").features;
require("dotenv").config();
const syllables = require("syllables");

const token = process.env.TOKEN;

// const stones = new Endb('sqlite://stones.sqlite');

// module.exports.stones = stones;

// connecting to database

// con.getConnection(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB local server."));

// initial prefix setting
let prefix = ".";

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_BANS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

module.exports.client = client;
client.commands = new Discord.Collection();

// const endb = new Endb('sqlite://courierbot.sqlite');

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

// trying to get message counts working

let messageArray = [];
client.on("messageCreate", (message) => {
  let newMessage = {
    content: message.content,
    member: message.member ? message.member : "no member",
    timestamp: Date.now(),
    syllables: typeof message.content == "string" && syllables(message.content),
  };
  messageArray.push(newMessage);

  messageArray = messageArray.filter((msg) => {
    return (
      msg.member !== "no member" &&
      (Date.now() - msg.timestamp) / 1000 / 60 <= 60
    );
  });

  let thirdToLast = messageArray[messageArray.length - 3];
  let secondToLast = messageArray[messageArray.length - 2];
  let lastMessage = messageArray[messageArray.length - 1];

  const hasSyllables = (message, syllables) => {
    if (!message) return;
    if (!message.syllables) return;
    return message.syllables === syllables;
  };

  if (!hasSyllables(lastMessage, 5)) return;
  if (!hasSyllables(secondToLast, 7)) return;
  if (!hasSyllables(thirdToLast, 5)) return;
  if (message.author.bot) return;
  let lastThreeMessages = messageArray.slice(messageArray.length - 3);
  for (let msg of lastThreeMessages) {
    let content = msg.content.split(" ");
    for (word of content) {
      if (syllables(word) === 0) return;
    }
  }

  message.reply(`*${thirdToLast.content}*
*${secondToLast.content}*
*${lastMessage.content}*
    ~${thirdToLast.member.displayName}, ${secondToLast.member.displayName}, and ${lastMessage.member.displayName}`);
});

const getMessageCount = () => {
  const messageObj = JSON.stringify({
    messageCount: messageArray.length,
  });
  return messageObj;
};

configController.wss.on("connection", function connection(ws) {
  const messageObj = getMessageCount();
  ws.send(messageObj);

  setInterval(() => {
    const messageObjInterval = getMessageCount();
    ws.send(messageObjInterval);
  }, 10000);

  ws.on("message", function incoming(message) {
    if (message === "Remove listeners plz") {
      ws.removeListener("connection", connection);
    }
  });
});

// command handler
client.on("messageCreate", async (message) => {
  // this is not working because there's something wrong with the database, need to start storing prefix in mongodb

  // try {
  //   con.query(
  //     `SELECT command_prefix FROM courierbot.server_config WHERE server_id = 1;`,
  //     (err, result) => {
  //       if (result) prefix = result[0].command_prefix;
  //     }
  //   );
  // } catch (err) {
  //   console.log(err);
  // }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) {
    return;
  }

  if (command.guildOnly && message.channel.type === "dm") {
    return message.reply("I can't execute that command inside DMs!");
  }

  if (command.permissions) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.channel.reply("You can not do this!");
    }
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

// setting up listeners to send WebSocket server data
client.once("ready", async () => {
  // const { chromium } = require("playwright");

  // // Replace with target URL and regex
  // const targetUrl =
  //   "https://www.royalcaribbean.com/booking/landing?groupId=VY05PCN-1161832116&sailDate=2025-01-11&shipCode=VY&packageCode=VY05W590&destinationCode=CARIB&selectedCurrencyCode=USD&country=USA&loyaltyNumber=388307394&CAS=true"; // Replace with the actual URL
  // const targetRegex =
  //   /https:\/\/www.royalcaribbean\.com\/mcb\/booking\/create\/header/; // Adjust the regex

  // (async () => {
  //   const browser = await chromium.launch({ headless: true });

  //   const context = await browser.newContext({
  //     userAgent:
  //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" +
  //       " AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  //   });

  //   const page = await context.newPage();

  //   await page.goto(targetUrl);

  //   await page.waitForTimeout(3000);

  //   const links = await page.$$("span");

  //   console.log(links);
  // })();

  // const targetRegex = /https:\/\/www.royalcaribbean\.com\/booking\/landing\?groupId=/;
  // const targetRegex = /https:\/\/lptag\.liveperson\.net\/lptag\/api/;

  console.log("Ready!");

  let cruiseArr = [
    {
      price: 352,
      jsonURL:
        "https://www.royalcaribbean.com/mcb/booking/create/header?CAS=true&country=USA&destinationCode=CARIB&groupId=VY05PCN-1161832116&loyaltyNumber=388307394&packageCode=VY05W590&sailDate=2025-01-11&selectedCurrencyCode=USD&shipCode=VY&landing=true&language=en&market=usa&browser=chrome&browserVersion=120.0.0&screenWidth=2025&browserWidth=2023&device=desktop",
      pageURL:
        "https://www.royalcaribbean.com/booking/landing?groupId=VY05PCN-1161832116&sailDate=2025-01-11&shipCode=VY&packageCode=VY05W590&destinationCode=CARIB&selectedCurrencyCode=USD&country=USA&loyaltyNumber=388307394&CAS=true",
      interval: 1800000,
    },
    {
      price: 549,
      jsonURL:
        "https://www.royalcaribbean.com/mcb/booking/create/header?CAS=true&country=USA&destinationCode=BAHAM&groupId=SY07BYE-3974839330&loyaltyNumber=388307394&packageCode=SY7BH108&sailDate=2024-09-15&selectedCurrencyCode=USD&shipCode=SY&landing=true&language=en&market=usa&browser=firefox&browserVersion=119.0.0&screenWidth=3440&browserWidth=3440&device=desktop",
      pageURL:
        "https://www.royalcaribbean.com/booking/landing?groupId=SY07BYE-3974839330&sailDate=2024-09-15&shipCode=SY&packageCode=SY7BH108&destinationCode=BAHAM&selectedCurrencyCode=USD&country=USA&loyaltyNumber=388307394&CAS=true",
      interval: 1760000,
    },
  ];

  for (let cruise of cruiseArr) {
    setIntervalAsync(async () => {
      try {
        let res = await fetch(cruise.jsonURL, {
          method: "GET",
          headers: {
            Host: "www.royalcaribbean.com",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": 1,
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            TE: "trailers",
          },
        });

        if (res.headers.get("content-type").indexOf("application/json") == -1)
          return;

        let response = await res.json();

        let newPrice = response.sailDate.price.rawPrice;

        if (newPrice != cruise.price) {
          cruise.price = newPrice;

          client.channels.cache.get("1159398296826150982")
            .send(`${client.users.cache.get(
            "189850269289414656"
          )} The price of this cruise is now $${cruise.price.toString()}\n\n${
            cruise.pageURL
          }
                `);
        }
      } catch (err) {
        console.log(err);
      }
    }, cruise.interval);
  }

  //   res = await res.json();

  console.log("after res");
});

// const tempbans = new Endb('sqlite://courierbot.sqlite');

// const links = new Endb('sqlite://links.sqlite');

// module.exports.links = links;

// module.exports.tempbans = tempbans;

client.on("messageCreate", async (message) => {
  if (message.content.includes("!tempban")) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    let timeUntilUnbannedInput = args[1];
    let userID = message.mentions.users.first().id;

    let unbannedUnit =
      timeUntilUnbannedInput[timeUntilUnbannedInput.length - 1];
    let unbannedInteger = timeUntilUnbannedInput.replace(unbannedUnit, "");

    let unbannedDate = 0;

    if (unbannedUnit == "d") {
      unbannedDate = Date.now() + unbannedInteger * 1000 * 60 * 60 * 24;
    } else if (unbannedUnit == "h") {
      unbannedDate = Date.now() + unbannedInteger * 1000 * 60 * 60;
    }

    await tempbans.set(userID, unbannedDate);

    setTimeout(() => {
      tempbans.delete(userID);
    }, unbannedDate);
  }
});

client.on("messageCreate", (message) => {
  if (message.channel.id == "889752147623837776") {
    startChannelTimer(message);
  }
});

const Link = mongoose.model("Link", { keyword: String, link: String });

module.exports.Link = Link;

// object of role rankings
const roles = {
  Admin: { rank: 1 },
  Mod: { rank: 2 },
  "Shipt Mod": { rank: 2 },
  "Instacart Mod": { rank: 2 },
  "Lead Developer": { rank: 3 },
  Member: { rank: 4 },
  Unverified: { rank: 5 },
};

// set prefix command for staff
client.on("messageCreate", (message) => {
  if (message.content.includes("setprefix")) {
    if (
      !message.member.roles.cache.some(
        (r) =>
          r.name === "Lead Developer" || r.name === "Mod" || r.name === "Admin"
      )
    )
      return;
    let prefix2 = message.content.split(" ")[1];

    // con.query(
    //   "UPDATE courierbot.server_config SET command_prefix = ? WHERE server_id = 1;",
    //   prefix2,
    //   (err) => {
    //     if (err) console.log(err);
    //   }
    // );

    message.channel.send(`Prefix set to ${prefix2}`);
  }
});

// let messageArray = [];

// client.on('messageCreate', message => {
//   let newMessage = {
//     content: message.content,
//     member: message.member.id,
//     timestamp: Date.now()
//   };

//   messageArray.push(newMessage);
// });

// configController.wss.on('connection', ws => {
// setInterval(() => {
//   let messageLastHourCount = messageArray.filter(msg => {
//     return (Date.now() - msg.timestamp) / 1000 / 60 <= 60;
//   }).length;
//   ws.send(JSON.stringify({ messages: messageLastHourCount }));
// }, 10000);
// });

// setting and deleting on-duty staff message for On Duty and Support channels
// client.on('guildMemberUpdate', (oldMember, newMember) => {
//   let onDutyChannel = client.channels.cache.get('789950280787034122');
//   let supportChannel = client.channels.cache.get('820147201660551228');
//   let announcementChannel = client.channels.cache.get('541727042723512355');
//   if (oldMember.roles.cache.size < newMember.roles.cache.size) {
//     if (newMember.roles.cache.some(r => r.name == 'On Duty Staff')) {
//       onDutyChannel.send(
//         `On Duty Staff: **${newMember.user.username}** is now on duty.`
//       );
//       supportChannel.send(
//         `On Duty Staff: **${newMember.user.username}** is now on duty.`
//       );
//     } else if (
//       !oldMember.roles.cache.some(r => r.name === 'Nitro Booster') &&
//       newMember.roles.cache.some(r => r.name == 'Nitro Booster')
//     ) {
//       announcementChannel.send(
//         `Thank you ${newMember} for boosting the server!`
//       );
//     }
//   } else if (oldMember.roles.cache.size > newMember.roles.cache.size) {
//     if (oldMember.roles.cache.some(r => r.name == 'On Duty Staff')) {
//       let channelArray = [onDutyChannel, supportChannel];

//       channelArray.forEach(chan => {
//         chan.messages.fetch({ limit: 10 }).then(msgs => {
//           msgs.forEach(msg => {
//             if (msg.content.includes(newMember.user.username)) {
//               chan.messages.delete(msg.id);
//             }
//           });
//         });
//       });
//     }
//   }
// });

// detecting avatar changes and updating database

// client.on('userUpdate', (oldUser, newUser) => {
//   if (oldUser.avatar !== newUser.avatar) {
//     let newAvatarURL = newUser.avatarURL();
//     let discordID = newUser.id;
//     let query =
//       'UPDATE courierbot.user SET avatar_url = ? WHERE discord_user_id = ?;';
//     con.query(query, [newAvatarURL, discordID], (error, result) => {
//       if (error) console.log(error);
//     });
//     console.log(
//       `Avatar change detected. Updated database entry with new avatar URL for ${newUser.username}.`
//     );
//   }
// });

// setting bot status
client.on("ready", async () => {
  await client.user.setPresence({
    activity: { name: `Hooray, I'm helping!`, type: "PLAYING" },
    status: "online",
  });
});

// const mongoose = require('mongoose');
// mongoose.connect('mongo');

// client.on('threadCreate', async thread => {
//   if (thread.joinable) await thread.join();

//   client.on('messageCreate', async message => {
//     if (message.content.toLowerCase().includes('wha')) {
//       if (message.content.toLowerCase().includes('.whacount')) return;
//       let currentWha = await wha.get(message.member.id);
//       if (!currentWha) await wha.set(message.member.id, 1);
//       else await wha.set(message.member.id, currentWha + 1);
//     }
//   });
// });

const whaWrapper = (message, memberID) => {
  if (message.author.bot) return;

  if (!databases[message.guild.id].isOn) return;

  if (message.content.includes("wha")) {
    if (message.content.includes(".whacount")) return;

    // con.query(
    //   `SELECT wha_count FROM courierbot.wha WHERE wha_id = ?;`,
    //   memberID,
    //   (err, result) => {
    //     if (err) console.log(err);
    //     if (result) {
    //       console.log(result);
    //       result = result + 1;
    //       con.query(
    //         `UPDATE courierbot.wha SET wha_count = ${result} WHERE wha_id = ${memberID}`
    //       );
    //     } else if (result.length == 0 || !result) {
    //       con.query(
    //         `INSERT INTO courierbot.wha (wha_id, wha_count) VALUES (?, ?)`,
    //         [memberID, 1],
    //         (err) => {
    //           if (err) console.log(err);
    //         }
    //       );
    //     }
    //     return result;
    //   }
    // );
  }
};

module.exports.whaWrapper = whaWrapper;

// reactions to trigger words
client.on("messageCreate", async (message) => {
  // let now = Date.now();
  if (message.author.bot) return;

  if (!databases[message.guild.id].isOn) return;

  if (message.content.includes("wha")) {
    if (message.content.includes(".whacount")) return;

    // con.query(
    //   `SELECT wha_count FROM courierbot.wha WHERE wha_id = ?;`,
    //   message.member.id,
    //   (err, result) => {
    //     if (err) console.log(err);
    //     if (result) {
    //       con.query(
    //         `UPDATE courierbot.wha SET wha_count = ${
    //           result + 1
    //         } WHERE wha_id = ${message.member.id}`
    //       );
    //     } else {
    //       con.query(
    //         `INSERT INTO courierbot.wha (wha_id, wha_count) VALUES (?, ?)`,
    //         [message.member.id, 1],
    //         (err) => {
    //           if (err) console.log(err);
    //         }
    //       );
    //     }
    //   }
    // );
  }

  let triggerWords = {
    bread: "🍞",
    pants: "👖",
    // egg: '🥚',
    secret: "🤫",
    abc: "🤫",
    astolfoditch: "1053191488621776916",
  };

  const badWords = [
    "biden",
    "trump",
    "democrat",
    "republican",
    "democrats",
    "republicans",
    "liberal",
    "liberals",
    "radical left",
    "far right",
    "far left",
    "conservatives",
  ];

  for (word of badWords) {
    if (message.content.toLowerCase().includes(word)) {
      if (message.author.bot) return;
      if (message.content[0] === ".") return;

      const words = message.content.split(" ");

      let newContent = message.content;

      function getUserFromMention(mention) {
        if (!mention) return;

        if (!mention.startsWith("<@")) return;

        if (mention.startsWith("<@") && mention.endsWith(">")) {
          mention = mention.slice(2, -1);

          if (mention.startsWith("!")) {
            mention = mention.slice(1);
          }

          return client.users.cache.get(mention);
        } else {
          return null;
        }
      }

      for (eachWord of words) {
        if (getUserFromMention(eachWord)) {
          newContent = newContent.replace(
            eachWord,
            getUserFromMention(eachWord).username
          );
        }
      }

      message.guild.channels.cache.find(
        (channel) => channel.id === "1038931076279705781"
      ).send(`Potential trouble in ${message.channel}:
      ${message.author}: "${newContent}"
      ${`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`}`);
      return;
    }
  }

  if (message.content.includes(".renameTrixie")) {
    let trixie = message.guild.members.cache.find(
      (member) => member.id == "892228081845162004"
    );

    if (!trixie) message.channel.send(`Welp`);
    else {
      trixie.displayName = "t";
    }
  }

  if (message.content.includes("Mike!")) {
    message.channel.send("Angelo!");
  }

  if (message.content.includes("Angelo!")) {
    message.channel.send("Mike!");
  }

  if (message.content.includes(".egghex")) {
    message.channel.send(
      "https://media.discordapp.net/attachments/933955829013553152/1139008602426835075/EC4116D3-61BA-4316-9BC0-80E7BCB67810.png?width=846&height=846"
    );
  }

  // if (message.content.toLowerCase().includes('wha')) {
  //   if (message.content.toLowerCase().includes('.whacount')) return;
  //   let currentWha = await wha.get(message.member.id);
  //   if (!currentWha) await wha.set(message.member.id, 1);
  //   else await wha.set(message.member.id, currentWha + 1);
  // }

  for (word in triggerWords) {
    if (message.content.toLowerCase().includes(word)) {
      if (message.author.bot) return;
      if (message.content[0] === ".") return;

      const emojiRegex = new RegExp(`:.*${word}.*:`);

      const verticalBarRegex = new RegExp("\\|\\|.+\\|\\|");

      if (triggerWords[word] == "1053191488621776916") {
        message.react(
          message.guild.emojis.cache.find(
            (emoji) => emoji.id == "1053191488621776916"
          )
        );
      }

      if (
        message.content.match(emojiRegex) ||
        message.content.match(verticalBarRegex)
      )
        return;

      message.react(triggerWords[word]);
    }
  }

  if (message.content.toLowerCase().includes("egg")) {
    if (message.author.bot) return;
    if (message.content[0] === ".") return;
    let messageColonLength = message.content.replace(/[^:]/g, "").length;
    //prettier-ignore
    let messageVerticalBarLength = message.content.replace(/[^\|]/g, "").length;
    if (
      (messageColonLength !== 0 && messageColonLength % 2 == 0) ||
      (messageVerticalBarLength !== 0 && messageVerticalBarLength % 4 == 0)
    )
      return;
    let betweenOneAndTen = Math.floor(Math.random() * 10) + 1;
    if (betweenOneAndTen === 3 || betweenOneAndTen === 7) {
      message.react("🥚");
    }
  }
});

let haikuNow = Date.now();

client.on("messageCreate", (message) => {
  if (message.channel.id !== "933955829013553152") return;
  if (typeof message.content != "string") return;
  if (syllables(message.content) !== 17) return;
  if (message.author.bot) return;
  if (!message.member.user.id) return;

  for (let word of message.content.split(" ")) {
    if (syllables(word) === 0) return;
  }

  const getFirstLine = () => {
    let syllableCount = 0;
    let counter = 0;
    let firstLine = [];
    for (let word of message.content.split(" ")) {
      if (syllableCount > 5) return 0;
      if (syllableCount === 5) return { firstLine, counter };
      counter++;
      firstLine.push(word);
      syllableCount += syllables(word);
    }
  };

  const firstLineObj = getFirstLine();

  if (!firstLineObj) return;

  const { firstLine, counter } = firstLineObj;

  const getSecondLine = () => {
    let lastTwoLines = message.content.split(" ").slice(counter);
    let syllableCount = 0;
    let secondLineCounter = counter;
    let secondLine = [];

    for (let word of lastTwoLines) {
      if (syllableCount > 7) return 0;
      if (syllableCount === 7) return { secondLine, secondLineCounter };

      secondLineCounter++;
      secondLine.push(word);
      syllableCount += syllables(word);
    }
  };

  const secondLineObj = getSecondLine();

  if (!secondLineObj) return;

  const { secondLine, secondLineCounter } = secondLineObj;

  const getThirdLine = () => {
    let thirdLine = message.content.split(" ").slice(secondLineCounter);
    return thirdLine;
  };

  const thirdLine = getThirdLine();

  if (!thirdLine) return;

  let currentTimeOfMessage = Date.now();

  if ((currentTimeOfMessage - haikuNow) / 1000 / 60 / 60 < 8) return;
  else haikuNow = currentTimeOfMessage;

  message.reply(`*${firstLine.join(" ")}*
*${secondLine.join(" ")}*
*${thirdLine.join(" ")}*\n
    ~${message.member.displayName}`);
});

// const fetch = require('node-fetch');

// client.on('messageCreate', async message => {
//   if (!message.content.includes('.embed')) return;
//   if (message.author.bot) return;

//   // get the file's URL
//   const file = message.attachments.first()?.url;
//   if (!file) return console.log('No attached file found');

//   try {
//     message.channel.send('Reading the file! Fetching data...');

//     // fetch the file from the external URL
//     const response = await fetch(file);

//     // if there was an error send a message with the status
//     if (!response.ok)
//       return message.channel.send(
//         'There was an error with fetching the file:',
//         response.statusText
//       );

//     // take the response stream and read it to completion
//     const text = await response.text();

//     if (text) {
//       // message.channel.send(`\`\`\`${text}\`\`\``);

//       let embeddedJSON = JSON.parse(text);
//       message.channel.send(embeddedJSON);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

// const cbeaster = new Endb('sqlite://cbeaster.sqlite');

// const cbeasterSecret = new Endb('sqlite://cbeastersecret.sqlite');

// const zenbog = new Endb('sqlite://zenbog.sqlite');

// const zenbogsecret = new Endb('sqlite://zenbogsecret.sqlite');

const databases = {
  "531182018571141132": {
    easter: "cbeaster",
    secret: "cbeasterSecret",
    isOn: false,
  },
  "768557939052249090": {
    easter: "zenbog",
    secret: "zenbogsecret",
    isOn: false,
  },
  "758113177677332531": {
    testing: "testing",
    isOn: true,
  },
  "897551101530890311": {
    isOn: true,
  },
};

// Easter egg hunt

// client.on('messageCreate', async message => {
// 	if (databases[message.guild.id].isOn == 0) return;
// 	if (message.content.length === 37 ||
// 	message.content.length === 81) {
// 		findEgg(message);
// 	}
// });

// client.on('messageCreate', async message => {
// 	if (message.content.includes('.testshit')) {
// 		console.log(databases['768557939052249090'].secret)
// 	}
// 	});

// const findEgg = async message => {
//   let easterDB = this[databases[message.guild.id].easter];
//   let currentEggs = await easterDB.get(message.member.id);

//   if (!currentEggs) {
//     await easterDB.set(message.member.id, 1);
//     message.channel.send(
//       `Congrats, ${message.member.displayName}! You have found an egg!`
//     );
//     message.channel.send(`${message.member.displayName} now has 1 egg.`);
//   } else {
//     currentEggs++;
//     await easterDB.set(message.member.id, currentEggs);
//     message.channel.send(
//       `Congrats, ${message.member.displayName}! You have found an egg!`
//     );
//     message.channel.send(
//       `${message.member.displayName} now has ${currentEggs} eggs.`
//     );
//   }
// };

// gave me an egg for testing purposes
// client.on('messageCreate', async message => {
//   if (message.content.toLowerCase().includes('.gibegg')) {
//     let easterDB = this[databases[message.guild.id].easter];
//     // if (message.member.roles.cache.find(r => r.name === "Lead Developer")) {
//     let authorEggs = await easterDB.get(message.member.id);
//     authorEggs++;
//     await easterDB.set(message.member.id, authorEggs);
//     message.channel.send(`There, I gave you an egg. Cheater.`);
//     message.channel.send(
//       `${message.member.displayName} now has ${authorEggs} eggs.`
//     );
//   }
//   // }
// });

// listed members with eggs for easter event

// client.on('messageCreate', async message => {
// 	if (message.content.toLowerCase().includes('leaderboard')) {
// 	let membersWithEggs = message.guild.members.cache.filter(async m => await cbeaster.get(m.id) !== undefined);

// 	let eggList = membersWithEggs.map(async m => `${m.username}: ${await cbeaster.get(m.id)} \n`);

// 	message.channel.send(`List of members with eggs: \n\n ${eggList}`)

// 	}
// });

// birthdays

// client.on('ready', async () => {
//   await birthdays.set('triggeredBirthday', 0);
// });

// const birthdays = new Endb('sqlite://birthdays.sqlite');

//happy birthday message
// client.on('messageCreate', async message => {
//   if (message.author.bot) return;
//   let thisDateUser = await birthdays.get(message.member.id);
//   thisDateUser = new Date(thisDateUser);
//   let nowDate = new Date();
//   let todayDate = nowDate.getDate();
//   let todayMonth = nowDate.getMonth() + 1;

//   if ((await birthdays.get('triggeredBirthday')) == 0) {
//     if (
//       todayMonth == thisDateUser.getMonth() + 1 &&
//       todayDate == thisDateUser.getDate()
//     ) {
//       await birthdays.set('triggeredBirthday', 1);
//       message.channel.send(`HAPPY BIRTHDAY, ${message.author}!!!`);
//     }
//   }
// });

// Cinco De Mayo
const tacoIngredients = {
  shell: "shell",
  lettuce: "lettuce",
  cheese: "cheese",
  tomatoes: "tomatoes",
  beef: "beef",
  "hot sauce": "hot sauce",
  guacamole: "guacamole",
  beans: "beans",
};

// const tacos = new Endb('sqlite://tacos.sqlite');

// const messageCounts = new Endb('sqlite://messagecounts.sqlite');

// function to find taco ingredients for 5/5 event
// const findIngredient = async message => {
//   let currentIngredients = await tacos.get(message.member.id);
//   if (!currentIngredients) {
//     currentIngredients = {
//       shell: 0,
//       lettuce: 0,
//       cheese: 0,
//       tomatoes: 0,
//       beef: 0
//     };
//   }
//   let thisIngredient =
//     Object.keys(tacoIngredients)[
//       Math.floor(Math.random() * Object.keys(tacoIngredients).length)
//     ];
//   if (!currentIngredients[thisIngredient]) {
//     currentIngredients[thisIngredient] = 1;
//   } else {
//     currentIngredients[thisIngredient]++;
//   }
//   await tacos.set(message.member.id, currentIngredients);
//   message.channel.send(
//     `Congrats, ${message.author.username}! You have found a taco ingredient! One ${thisIngredient} has been added to your collection.`
//   );
// };

// gave taco ingredients for 5/5 event

// client.on('messageCreate', async message => {
// 	let thisUser = message.member.id;
// 	let userMessageCount = await messageCounts.get(message.member.id);
// 	if (!userMessageCount) userMessageCount = 1;
// 	switch(userMessageCount) {
// 		case 10:
// 			findIngredient(message);
// 			break;
// 		case 30:
// 			findIngredient(message);
// 			break;
// 		case 60:
// 			findIngredient(message);
// 			break;
// 		case 100:
// 			findIngredient(message);
// 			break;
// 		case 150:
// 			findIngredient(message);
// 			userMessageCount = 0;
// 			await messageCounts.set(thisUser, userMessageCount);
// 			break;
// 	}
// });

// leaderboard command for easter event
client.on("messageCreate", async (message) => {
  const trimmedMessage = message.content.replace(".order ", "");

  let messageArray;
  if (trimmedMessage.includes(", ")) {
    messageArray = trimmedMessage.split(", ");
  } else if (trimmedMessage.includes(",")) {
    messageArray = trimmedMessage.split(",");
  }

  if (trimmedMessage.length < message.content.length) {
    function shuffle(array) {
      let currentIndex = array.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }

      return array;
    }

    let shuffledArray = shuffle(messageArray);

    let shuffledMessage = shuffledArray.join(", ");

    message.channel.send(shuffledMessage);
    return;
  }

  if (message.content.toLowerCase().includes(".egg leaderboard")) {
    return;
    let easterDB = this[databases[message.guild.id].easter];
    let allUserIDs = [];
    let eggList = [];

    allUserIDs.push(await easterDB.all());

    for (let i of allUserIDs[0]) {
      if (i.key !== 0) {
        let user = await message.guild.members.fetch(i.key);
        if (user !== undefined) {
          eggList.push([user.user.username, i.value]);
        }
      }
    }

    eggList.sort(function (a, b) {
      return b[1] - a[1];
    });

    eggList = eggList.filter((item) => item[1] >= 1);

    let newString = "";

    eggList.forEach((item) => {
      newString += `${item[0]}: ${item[1]} \n \n`;
    });

    message.channel.send(`**Egg Leaderboard:** \n\n ${newString}`);
  }
});

// registering slash commands

// client.api
//   .applications('781436885020049458')
//   .guilds('531182018571141132')
//   .commands.post({
//     data: {
//       name: 'worth',
//       description: 'calculates $/mi. example: .worth 5mi $15',
//       options: [
//         {
//           name: 'payout',
//           description: 'payout of order',
//           type: 3,
//           required: true
//         },
//         {
//           name: 'mileage',
//           description: 'mileage of order',
//           type: 3,
//           required: true
//         }
//       ]
//     }
//   });

// client.ws.on('INTERACTION_CREATE', async interaction => {
//   function dollarsPerMile(payout, mileage) {
//     payout = payout.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
//     mileage = mileage.replace(/[&\/\\#,+()$~%'":*?mi<>{}]/g, '');
//     return Math.round((payout / mileage) * 100) / 100;
//   }

//   client.api.interactions(interaction.id, interaction.token).callback.post({
//     data: {
//       type: 4,
//       data: {
//         // prettier-ignore
//         content: `This order pays $${dollarsPerMile(interaction.data.options[0].value, interaction.data.options[1].value)} / mi.`
//       }
//     }
//   });
// });

// cleared easter egg stash for staff for equal participation in egg hunt

// client.on('messageCreate', async message => {
// 	if (message.content.includes('.nukestaff')) {
// 		let allUserIDs = [];

// 		allUserIDs.push(await cbeaster.all());

// 		let staffRoles = ['Mod', 'Trial Mod', 'Admin', 'Lead Developer', 'CourierBot'];

// 		for (i of allUserIDs[0]) {
// 			if (i.key !== 0) {
// 				let user = await message.guild.members.fetch(i.key);
// 				if (user.roles.cache.some(r => staffRoles.includes(r))) {
// 					await cbeaster.set(i.key, 0);
// 				}
// 				}
// 			}
// 		}
// 	});

client.login(token);

// consolidated module.exports into one object
module.exports = {
  // endb,
  client: client,
  // cbeasterSecret,
  // cbeaster,
  // zenbogsecret,
  // zenbog,
  databases,
  // birthdays,
  // tacoIngredients,
  // tacos,
  // messageCounts,
  // tempbans
};
