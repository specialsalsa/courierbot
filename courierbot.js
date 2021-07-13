const fs = require("fs");
const Discord = require("discord.js");
const Endb = require("endb");
const roleClaim = require("./role-claim");
const egg = require("./commands/egg");
const { con } = require("./database");
const configController = require("./server/configController");
require("dotenv").config();

const token = process.env.TOKEN;

// connecting to database
con.getConnection(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
// initial prefix setting
let prefix = ".";

// instantiating discord client and commands collection
const client = new Discord.Client();

module.exports.client = client;
client.commands = new Discord.Collection();

// Endb is key-value storage using a sqlite database
const endb = new Endb("sqlite://courierbot.sqlite");

// reading in command folder
const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

// command handler
client.on("message", async message => {
    con.query(
        `SELECT command_prefix FROM nunops_bot.server_config WHERE server_id = 1;`,
        (err, result) => {
            if (err) console.log(err);
            prefix = result[0].command_prefix;
        }
    );

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        client.commands.get(commandName) ||
        client.commands.find(
            cmd => cmd.aliases && cmd.aliases.includes(commandName)
        );

    if (!command) return;

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
        const expirationTime =
            timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(
                `please wait ${timeLeft.toFixed(
                    1
                )} more second(s) before reusing the \`${
                    command.name
                }\` command.`
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
client.once("ready", () => {
    console.log("Ready!");
    configController.sendMemberCounts();
});

// object of role rankings
const roles = {
    Admin: { rank: 1 },
    Mod: { rank: 2 },
    "Shipt Mod": { rank: 2 },
    "Instacart Mod": { rank: 2 },
    "Lead Developer": { rank: 3 },
    Member: { rank: 4 },
    Unverified: { rank: 5 }
};

// set prefix command for staff
client.on("message", message => {
    if (message.content.includes("setprefix")) {
        if (
            !message.member.roles.cache.some(
                r =>
                    r.name === "Lead Developer" ||
                    r.name === "Mod" ||
                    r.name === "Admin"
            )
        )
            return;
        let prefix2 = message.content.split(" ")[1];

        con.query(
            "UPDATE nunops_bot.server_config SET command_prefix = ? WHERE server_id = 1;",
            prefix2,
            err => {
                if (err) console.log(err);
            }
        );

        message.channel.send(`Prefix set to ${prefix2}`);
    }
});

// adding users to database
client.on("message", message => {
    if (message.author.bot) return;
    if (!databases[message.guild.id].isOn) return;

    let username = message.author.username;
    let kicked = 0;
    let thisAvatar = "";
    client.users.fetch(message.member.id).then(thisUser => {
        thisAvatar = thisUser.avatarURL();
    });

    // determining highest role rank out of five roles listed above

    let highestRoleRank = 5;

    // let filteredRoles = [];
    // message.member.roles.cache.forEach(r => {
    //     if (roles.hasOwnProperty(r.name)) {
    //         filteredRoles.push(r.name);
    //     }
    // });

    // let filteredRoles = message.member.roles.cache
    //     .map(r => {
    //         if (roles.hasOwnProperty(r.name)) {
    //             return r.name;
    //         }
    //     })
    //     .filter(r => r != undefined);

    // refactored to use reduce instead of foreach
    let filteredRoles = message.member.roles.cache.reduce((result, role) => {
        if (roles.hasOwnProperty(role.name)) result.push(role.name);
        return result;
    }, []);

    filteredRoles.forEach(role => {
        if (roles[role].rank < highestRoleRank) {
            highestRoleRank = roles[role].rank;
        }
    });

    let id_user_type = highestRoleRank;
    let discordID = message.member.id;
    let query =
        "SELECT discord_user_id FROM nunops_bot.user WHERE discord_user_id = ?;";
    con.query(query, discordID, (err, result) => {
        if (err) console.log(err);
        if (result.length === 0) {
            let query =
                "INSERT INTO nunops_bot.user (discord_user_id, username, kicked, id_user_type, avatar_url) VALUES (?, ?, ?, ?, ?);";
            con.query(
                query,
                [discordID, username, kicked, id_user_type, thisAvatar],
                err => {
                    if (err) console.log(err);
                }
            );
            console.log(`Successfully added new user entry: ${username}`);
        }
    });
});

// setting and deleting on-duty staff message for On Duty and Support channels
client.on("guildMemberUpdate", (oldMember, newMember) => {
    let onDutyChannel = client.channels.cache.get("789950280787034122");
    let supportChannel = client.channels.cache.get("820147201660551228");
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        if (newMember.roles.cache.some(r => r.name == "On Duty Staff")) {
            onDutyChannel.send(
                `On Duty Staff: **${newMember.user.username}** is now on duty.`
            );
            supportChannel.send(
                `On Duty Staff: **${newMember.user.username}** is now on duty.`
            );
        }
    } else if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        if (oldMember.roles.cache.some(r => r.name == "On Duty Staff")) {
            let channelArray = [onDutyChannel, supportChannel];

            channelArray.forEach(chan => {
                chan.messages.fetch({ limit: 10 }).then(msgs => {
                    msgs.forEach(msg => {
                        if (msg.content.includes(newMember.user.username)) {
                            chan.messages.delete(msg.id);
                        }
                    });
                });
            });
        }
    }
});

// detecting avatar changes and updating database
client.on("userUpdate", (oldUser, newUser) => {
    if (oldUser.avatar !== newUser.avatar) {
        let newAvatarURL = newUser.avatarURL();
        let discordID = newUser.id;
        let query =
            "UPDATE nunops_bot.user SET avatar_url = ? WHERE discord_user_id = ?;";
        con.query(query, [newAvatarURL, discordID], (error, result) => {
            if (error) console.log(error);
        });
        console.log(
            `Avatar change detected. Updated database entry with new avatar URL for ${newUser.username}.`
        );
    }
});

// setting bot status
client.on("ready", async () => {
    await client.user.setPresence({
        activity: { name: `I'm helping!`, type: "PLAYING" },
        status: "online"
    });
});

// reactions to trigger words
client.on("message", message => {
    if (message.author.bot) return;
    if (!databases[message.guild.id].isOn) return;
    let dabEmoji = message.guild.emojis.cache.find(
        emoji => emoji.name === "dab"
    );

    let triggerWords = {
        bread: "🍞",
        pants: "👖",
        egg: "🥚",
        secret: "🤫",
        abc: "🤫",
        dabby: dabEmoji
    };

    for (word in triggerWords) {
        if (message.content.toLowerCase().includes(word)) {
            if (message.author.bot) return;
            if (message.content[0] === ".") return;
            //prettier-ignore
            let messageColonLength = message.content.replace(/[^:]/g, "").length;
            if (!messageColonLength % 2 == 0) return;
            message.react(triggerWords[word]);
        }
    }

    // easter words

    /* 	if (message.content.toLowerCase().includes('chicken')) {
		message.react('🐣');
	};

	if (message.content.toLowerCase().includes('easter')) {
		message.react('🎊');
	};

	if (message.content.toLowerCase().includes('sun')) {
		message.react('🌞');
	} */
});

const cbeaster = new Endb("sqlite://cbeaster.sqlite");

const cbeasterSecret = new Endb("sqlite://cbeastersecret.sqlite");

const zenbog = new Endb("sqlite://zenbog.sqlite");

const zenbogsecret = new Endb("sqlite://zenbogsecret.sqlite");

const databases = {
    "531182018571141132": {
        easter: "cbeaster",
        secret: "cbeasterSecret",
        isOn: true
    },
    "768557939052249090": {
        easter: "zenbog",
        secret: "zenbogsecret",
        isOn: false
    }
};

// Easter egg hunt

// client.on('message', async message => {
// 	if (databases[message.guild.id].isOn == 0) return;
// 	if (message.content.length === 37 ||
// 	message.content.length === 81) {
// 		findEgg(message);
// 	}
// });

// client.on('message', async message => {
// 	if (message.content.includes('.testshit')) {
// 		console.log(databases['768557939052249090'].secret)
// 	}
// 	});

const findEgg = async message => {
    let easterDB = this[databases[message.guild.id].easter];
    let currentEggs = await easterDB.get(message.member.id);

    if (!currentEggs) {
        await easterDB.set(message.member.id, 1);
        message.channel.send(
            `Congrats, ${message.member.displayName}! You have found an egg!`
        );
        message.channel.send(`${message.member.displayName} now has 1 egg.`);
    } else {
        currentEggs++;
        await easterDB.set(message.member.id, currentEggs);
        message.channel.send(
            `Congrats, ${message.member.displayName}! You have found an egg!`
        );
        message.channel.send(
            `${message.member.displayName} now has ${currentEggs} eggs.`
        );
    }
};

// gave me an egg for testing purposes
client.on("message", async message => {
    if (message.content.toLowerCase().includes(".gibegg")) {
        let easterDB = this[databases[message.guild.id].easter];
        // if (message.member.roles.cache.find(r => r.name === "Lead Developer")) {
        let authorEggs = await easterDB.get(message.member.id);
        authorEggs++;
        await easterDB.set(message.member.id, authorEggs);
        message.channel.send(`There, I gave you an egg. Cheater.`);
        message.channel.send(
            `${message.member.displayName} now has ${authorEggs} eggs.`
        );
    }
    // }
});

// listed members with eggs for easter event

// client.on('message', async message => {
// 	if (message.content.toLowerCase().includes('leaderboard')) {
// 	let membersWithEggs = message.guild.members.cache.filter(async m => await cbeaster.get(m.id) !== undefined);

// 	let eggList = membersWithEggs.map(async m => `${m.username}: ${await cbeaster.get(m.id)} \n`);

// 	message.channel.send(`List of members with eggs: \n\n ${eggList}`)

// 	}
// });

// birthdays

client.on("ready", async () => {
    await birthdays.set("triggeredBirthday", 0);
});

const birthdays = new Endb("sqlite://birthdays.sqlite");

//happy birthday message
client.on("message", async message => {
    if (message.author.bot) return;
    let thisDateUser = await birthdays.get(message.member.id);
    thisDateUser = new Date(thisDateUser);
    let nowDate = new Date();
    let todayDate = nowDate.getDate();
    let todayMonth = nowDate.getMonth() + 1;

    if ((await birthdays.get("triggeredBirthday")) == 0) {
        if (
            todayMonth == thisDateUser.getMonth() + 1 &&
            todayDate == thisDateUser.getDate()
        ) {
            await birthdays.set("triggeredBirthday", 1);
            message.channel.send(`HAPPY BIRTHDAY, ${message.author}!!!`);
        }
    }
});

// Cinco De Mayo
const tacoIngredients = {
    shell: "shell",
    lettuce: "lettuce",
    cheese: "cheese",
    tomatoes: "tomatoes",
    beef: "beef",
    "hot sauce": "hot sauce",
    guacamole: "guacamole",
    beans: "beans"
};

const tacos = new Endb("sqlite://tacos.sqlite");

const messageCounts = new Endb("sqlite://messagecounts.sqlite");

// function to find taco ingredients for 5/5 event
const findIngredient = async message => {
    let currentIngredients = await tacos.get(message.member.id);
    if (!currentIngredients) {
        currentIngredients = {
            shell: 0,
            lettuce: 0,
            cheese: 0,
            tomatoes: 0,
            beef: 0
        };
    }
    let thisIngredient =
        Object.keys(tacoIngredients)[
            Math.floor(Math.random() * Object.keys(tacoIngredients).length)
        ];
    if (!currentIngredients[thisIngredient]) {
        currentIngredients[thisIngredient] = 1;
    } else {
        currentIngredients[thisIngredient]++;
    }
    await tacos.set(message.member.id, currentIngredients);
    message.channel.send(
        `Congrats, ${message.author.username}! You have found a taco ingredient! One ${thisIngredient} has been added to your collection.`
    );
};

// gave taco ingredients for 5/5 event

// client.on('message', async message => {
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
client.on("message", async message => {
    if (message.content.toLowerCase().includes(".egg leaderboard")) {
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

        eggList = eggList.filter(item => item[1] >= 1);

        let newString = "";

        eggList.forEach(item => {
            newString += `${item[0]}: ${item[1]} \n \n`;
        });

        message.channel.send(`**Egg Leaderboard:** \n\n ${newString}`);
    }
});

// cleared easter egg stash for staff for equal participation in egg hunt

// client.on('message', async message => {
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
    endb,
    // client: client,
    cbeasterSecret,
    cbeaster,
    zenbogsecret,
    zenbog,
    databases,
    birthdays,
    tacoIngredients,
    tacos,
    messageCounts
};
