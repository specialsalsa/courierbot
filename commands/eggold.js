const cb = require('../courierbot');

module.exports = {
    name: "eggold",
    description: "checks how many eggs you have",
    async execute(message, args) {
        let eggs = await cb.cbeaster.get(message.member.id);
            if (args[0] == 'give') {
                if (eggs == 0 || eggs == undefined) {
                    message.reply(`you don't have any eggs to give away!`);
                } else {
                let mentionedUser = message.mentions.users.first();
                eggs--;
                await cb.cbeaster.set(message.member.id, eggs);
                let eggs2 = await cb.cbeaster.get(mentionedUser.id);
                if (!eggs2) {
                    eggs2 = 0;
                    eggs2++;
                    await cb.cbeaster.set(mentionedUser.id, eggs2);
                } else {
                    eggs2++;
                    await cb.cbeaster.set(mentionedUser.id, eggs2);
                };
                message.channel.send(`Aw, how nice! ${message.member.displayName} gave an egg to ${mentionedUser.username}!`);
                message.channel.send(`${message.member.displayName} now has ${eggs} eggs, and ${mentionedUser.username} now has ${eggs2} eggs.`);
            }
        };

            if (args[0] == 'check') {
                if (eggs == 0 || eggs == undefined) {
                    message.reply(`you don't have any eggs yet!`);
                } else {
                    message.reply(`you currently have ${eggs} eggs.`);
            }
        };

        if (args[0] === 'clear') {
            await cb.cbeaster.delete(message.member.id);
            message.reply('Cleared database entry and reset eggs.');
        }

            if (args[0] === 'battle') {
                let mentionedUser = message.mentions.users.first();
                let player1 = message.author
                message.delete();
                message.channel.send(`${mentionedUser}, ${message.member.displayName} has challenged you to an Egg Battle! Post 'rock', 'paper', or 'scissors' to defend your eggs!`);
                if (args[2].toLowerCase() === 'rock') {
                    let filter = m => m.author.id === mentionedUser.id;
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(async message => {
                        message = message.first();
                        if (message.content.toLowerCase().includes('paper')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs--;
                        player2Eggs++;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you lost the battle! Also, ${mentionedUser.username} was able to launch a counterattack and steal one of your eggs!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('scissors')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs++;
                        player2Eggs--;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you won the battle! You stole 1 egg from ${mentionedUser.username}!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('rock')) {
                            message.reply(`Tie! Neither egg count was affected.`);
                        }
                    })
                    .catch(collected => {
                        message.channel.send('Timeout! Neither egg count was affected.');
                    });
                    } else if (args[2].toLowerCase() === 'paper') {
                        
                    let filter = m => m.author.id === mentionedUser.id
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(async message => {
                        message = message.first()
                        if (message.content.toLowerCase().includes('scissors')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs--;
                        player2Eggs++;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you lost the battle! Also, ${mentionedUser.username} was able to launch a counterattack and steal one of your eggs!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('rock')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs++;
                        player2Eggs--;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you won the battle! You stole 1 egg from ${mentionedUser.username}!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('paper')) {
                            message.reply(`Tie! Neither egg count was affected.`);
                        }
                    })
                    .catch(collected => {
                        message.channel.send('Timeout! Neither egg count was affected.');
                    });
                    } else if (args[2].toLowerCase() === 'scissors') {
                        
                    let filter = m => m.author.id === mentionedUser.id
                    message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(async message => {
                        message = message.first()
                        if (message.content.toLowerCase().includes('rock')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs--;
                        player2Eggs++;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you lost the battle! Also, ${mentionedUser.username} was able to launch a counterattack and steal one of your eggs!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('paper')) {
                        let player1Eggs = await cb.cbeaster.get(player1.id);
                        let player2Eggs = await cb.cbeaster.get(mentionedUser.id);
                        player1Eggs++;
                        player2Eggs--;
                        await cb.cbeaster.set(player1.id, player1Eggs);
                        await cb.cbeaster.set(mentionedUser.id, player2Eggs);
                        message.reply(`you won the battle! You stole 1 egg from ${mentionedUser.username}!`);
                        message.channel.send(`${player1.username} now has ${player1Eggs} eggs, and ${mentionedUser.username} now has ${player2Eggs} eggs.`);
                        } else if (message.content.toLowerCase().includes('scissors')) {
                            message.reply(`Tie! Neither egg count was affected.`);
                        }
                    })
                    .catch(collected => {
                        message.channel.send('Timeout! No egg counts were affected.');
                    });
                    }
                }
            }

    }