const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const users = require('./users.json');
// const Enmap = require('enmap');
const Endb = require('endb');
const roleClaim = require('./role-claim');

// fs.readFile('./users.json', 'utf8', (err, jsonString) => {
// 	if (err) {
// 		console.log("Error reading file from disk:", err);
// 		return
// 	}
// 	try {
// 		const userStones = JSON.parse(jsonString);
// 		console.log("Stones:", userStones.stones);
// 		console.log('Stones: ')
// 	} catch (err) {
// 		console.log('Error parsing JSON string:', err)
// 	}
// });



const client = new Discord.Client();
client.commands = new Discord.Collection();


const endb = new Endb('sqlite://courierbot.sqlite');

module.exports.endb = endb;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.on('ready', () => {
	console.log('Ready!');

	// roleClaim(client)
});

// playing with Mongoose

// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
// 	const kittySchema = new mongoose.Schema({
// 		name: String
// 	});

// 	kittySchema.methods.speak = function () {
// 		const greeting = this.name
// 		  ? "Meow name is " + this.name
// 		  : "I don't have a name";
// 		console.log(greeting);
// 	  }

// 	const Kitten = mongoose.model('Kitten', kittySchema);

// 	const silence = new Kitten({ name: 'Silence' });
// 	console.log(silence.name);

// 	silence.save(function (err, silence) {
// 		if (err) return console.error(err);
// 	});

// });



// module.exports = {
// 	settings: new Enmap({
// 	  name: "settings",
// 	  autoFetch: true,
// 	  fetchAll: false
// 	}),
// 	users: new Enmap("users"),
// 	tags: new Enmap({ name: "tags" }),
// 	stones: new Enmap({name: "stones"})
//   };

// --------- Enmap WORKING configuration ------------

// client.stones = new Enmap({name: "stones"});

// module.exports.stones = client.stones;


// client.stones.set("stones", 0);

// client.stones.defer.then(() => {
// 	console.log(client.stones.size + " keys loaded");
// });

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.channel.reply('You can not do this!');
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
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('message', message => {
	if (message.content.toLowerCase().includes('dabby')) {
		let reactionEmoji = message.guild.emojis.cache.find(emoji => emoji.name === 'dab');
		message.react(reactionEmoji);
	};
	
	if (message.content.toLowerCase().includes('egg')) {
		if (message.author.bot) return;
		message.react('🥚');
	};
	
	if (message.content.toLowerCase().includes('bread')) {
		message.react('🍞');
	};
	
	if (message.content.toLowerCase().includes('pants')) {
		message.react('👖');
	};
	
	if (message.content.toLowerCase().includes('secret') || message.content.toLowerCase().includes('abc')) {
		message.react('🤫');
	};

	if (message.content.toLowerCase().includes('chicken')) {
		message.react('🐣');
	};

	if (message.content.toLowerCase().includes('easter')) {
		message.react('🎊');
	};

	if (message.content.toLowerCase().includes('sun')) {
		message.react('🌞');
	}
});

const cbeaster = new Endb('sqlite://cbeaster.sqlite');

client.on('message', async message => {
	if (message.content.includes(".addme")) {
		await cbeaster.set(message.member.id, 0);
		message.channel.send(`Successfully added ${message.member.nickname} to the game!`);
	}
});

client.on('message', async message => {
	if (await cbeaster.get(message.member.id) !== null) {
		if (message.content.length === 27 ||
			message.content.length === 81) {
			let eggs = await cbeaster.get(message.member.id);
			eggs++;
			await cbeaster.set(message.member.id, eggs);
		message.channel.send(`Congrats, ${message.member.nickname}! You have found an egg!`);
		if (await cbeaster.get(message.member.id) === 1) {
			message.channel.send(`${message.member.nickname} now has 1 egg.`);
		} else {
		message.channel.send(`${message.member.nickname} now has ${await cbeaster.get(message.member.id)} eggs.`);
		}
	}
}
});


client.login(token);
