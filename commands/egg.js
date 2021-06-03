const cb = require('../courierbot');

module.exports = {
    name: "egg",
    description: "egg stuff",
    async execute(message, args) {

        let dbs = cb.databases[message.guild.id];


        if (args[0] === 'test') {
            console.log(await cb[dbs.secret]);

        }
        let player1 = message.author;
        let mentionedUser = message.mentions.users.first();

        const winBattle = async function(whoWon) {
            let player1Eggs = await cb[dbs.easter].get(player1.id);
            let player2Eggs = await cb[dbs.easter].get(mentionedUser.id);


            let winner = { username: '', id: 0, eggs: 0};
            let loser = { username: '', id: 0, eggs: 0};
        
            if (!player1Eggs) {
                await cb[dbs.easter].set(player1.id, 0);
            };
            
            if (!player2Eggs) {
                await cb[dbs.easter].set(mentionedUser.id, 0);
            };
            
        
            if (whoWon === 'player1') {

                 winner.eggs = player1Eggs;
                 winner.username = player1.username;
                 winner.id = player1.id;

                 loser.eggs = player2Eggs;
                 loser.username = mentionedUser.username;
                 loser.id = mentionedUser.id;

            } else if (whoWon === 'player2') {
        

                winner.eggs = player2Eggs;
                winner.username = mentionedUser.username;
                winner.id = mentionedUser.id;

                loser.eggs = player1Eggs;
                loser.username = player1.username;
                loser.id = player1.id;
            }

            if (!loser.eggs || loser.eggs <= 0) {
                message.channel.send(`${loser.username} lost, but they don't have any eggs for ${winner.username} to steal. No egg counts were affected.`);
                return;
            };

            winner.eggs++;
            await cb[dbs.easter].set(winner.id, winner.eggs);
            loser.eggs--;
            await cb[dbs.easter].set(loser.id, loser.eggs);
            message.channel.send(`${winner.username}, you won the battle! You stole an egg from ${loser.username}!`);
            message.channel.send(`${winner.username} now has ${winner.eggs} eggs, and ${loser.username} now has ${loser.eggs} eggs.`);

        }
        
        const tie = () => {
            message.channel.send(`${player1.username}, Tie! Neither egg count was affected.`);
        }


        if (args[0] == 'check') {
            let eggs = await cb[dbs.easter].get(message.member.id);
            if (eggs == 0 || eggs == undefined || eggs == null) {
                message.reply(`you don't have any eggs yet!`);
            } else {
                message.reply(`you currently have ${eggs} eggs.`);
        }
    };

    if (args[0] === 'clear') {
        await cb[dbs.easter].delete(message.member.id);
        message.reply('Cleared your entry and reset eggs.');
    }

    if (args[0] === 'nuke') {
        await cb[dbs.easter].clear();
        message.reply('Cleared all egg database entries.');
    }

    if (args[0] == 'give') {
        let eggs = await cb[dbs.easter].get(message.member.id);
        let mentionedUser = message.mentions.users.first();

        if (message.member.id === mentionedUser.id) {
            message.channel.send('Love the self-love, but you cannot give an egg to yourself. Sorry.');
            return;
        }

        if (!eggs) {
            message.reply(`you don't have any eggs to give away!`);

        } else {
        eggs--;
        await cb[dbs.easter].set(message.member.id, eggs);
        let eggs2 = await cb[dbs.easter].get(mentionedUser.id);
        if (!eggs2) {
            eggs2 = 0;
            eggs2++;
            await cb[dbs.easter].set(mentionedUser.id, eggs2);
        } else {
            eggs2++;
            await cb[dbs.easter].set(mentionedUser.id, eggs2);
        };
        message.channel.send(`Aw, how nice! ${message.member.displayName} gave an egg to ${mentionedUser.username}!`);
        message.channel.send(`${message.member.displayName} now has ${eggs} eggs, and ${mentionedUser.username} now has ${eggs2} eggs.`);
    }
};

        if (args[0] == 'setWords') {

            let words =
                [
                    'april',
                    'march',
                    'couriers easter',
                    'easter sunday',
                    'basket',
                    'he has risen',
                    'hunt',
                    'rejoice',
                    'three days',
                    'candy eggs',
                    'chocolate bunny',
                    'cadbury egg',
                    'whale',
                    'good tipper',
                    'treasure',
                    'apartment complex',
                    'good dog',
                    'Karen'

                ];

            await cb[dbs.secret].set('easterWords', words);
            message.channel.send(`Successfully set Easter event words.`);

        }

        

        if (args[0] == 'youllneverguessthis') {

            if (message.channel.id !== '828304293060673597') {
                message.channel.send(`You can only battle in the #battles channel!`);
                return;
            }
            
            if (message.mentions.users.first() == message.author) {
                message.channel.send(`You cannot battle yourself! Please specify another member.`);
                return;
            }

            message.channel.send(`${mentionedUser.username}, ${message.member.displayName} has challenged you to an Egg Battle! ${message.author} makes the first throw (post rock, paper, or scissors)`);
            let filter = m => m.author.id === mentionedUser.id;

            // collecting first response

            let filter1 = m => m.author.id === message.author.id;

            let responseFirst = '';

            try {

            const collectedMessageFirst = await message.channel.awaitMessages(filter1, {time: 60000, max: 1, errors: ['time']});

            responseFirst = collectedMessageFirst.map(cm => cm.content).filter(cont => cont.toLowerCase().includes('rock') || cont.toLowerCase().includes('paper') || cont.toLowerCase().includes('scissors')).toString();

            message.member.lastMessage.delete();

            } catch (e) {
                console.log(e);
                message.channel.send(`${message.member.displayName} didn't throw in time. No egg counts were affected.`);
            }

            message.channel.send(`${mentionedUser}, ${message.member.displayName} has made their throw. Make your throw to defend your eggs! (post rock, paper, or scissors)`);

            let throws = {'rock': {beats: 'scissors'}, 'scissors': {beats: 'paper'}, 'paper': {beats: 'rock'}};

            try {
            const collectedMessageSecond = await message.channel.awaitMessages(filter, {time:60000, max: 1, errors: ['time']});

            let responseSecond = collectedMessageSecond.map(cm => cm.content).filter(cont => cont.toLowerCase().includes('rock') || cont.toLowerCase().includes('paper') || cont.toLowerCase().includes('scissors')).toString();

            mentionedUser.lastMessage.delete();

            function whoWins(throw1, throw2) {
                if (throws[throw1].beats == throw2) {
                    return winBattle('player1');
                }
                if (throws[throw2].beats == throw1) {
                    return winBattle('player2');
                }
                return tie();
            }

            for (key1 in throws) {
                if (responseFirst.toLowerCase().includes(key1)) {
                    for (key2 in throws) {
                        if (responseSecond.toLowerCase().includes(key2)) {
                            whoWins(key1, key2);
                        }
                    }
                }
            }

            } catch (e) {
                console.log(e);
                message.channel.send(`${mentionedUser.username} took too long to reply! No egg counts were affected.`);
            }
        }
    }
}

