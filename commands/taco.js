const cb = require('../courierbot.js');

module.exports = {
  name: 'tacoasdfasdf',
  description: 'commands relating to the Cinco De Mayo event',
  async execute(message, args) {
    const checkIngredients = async (message, user) => {
      if (!args[1]) {
        user = message.member;
      } else {
        user = message.mentions.users.first();
      }
      let currentIngredients = await cb.tacos.get(user.id);
      if (!currentIngredients) {
        message.channel.send(
          `You don't have any ingredients yet! Keep posting to score some ingredients.`
        );
        return;
      }
      let secondArray = Object.entries(currentIngredients);

      secondArray = secondArray.filter(
        ([ingredient, quantity]) =>
          quantity >= 1 && ingredient !== 'messageCount'
      );

      let secondArrayFormatted = '';

      secondArray.sort((a, b) => b[1] - a[1]);

      secondArray.forEach(item => {
        secondArrayFormatted += `${item[0]}: ${item[1]} \n \n`;
      });

      if (!args[1]) {
        message.channel.send(
          `Your current ingredient collection: \n\n ${secondArrayFormatted}`
        );
      } else {
        message.channel.send(
          `${user.username}'s ingredient collection: \n \n ${secondArrayFormatted}`
        );
      }
    };

    if (args[0] == 'check') {
      checkIngredients(message);
    } else if (args[0] == 'trade') {
      if (args[1] == 'help') {
        message.channel.send(
          `Usage: Trade an ingredient you have for an ingredient from another member with format: \`.taco trade @user yourIngredient for theirIngredient\``
        );
        return;
      }

      let traderIngredient = args[2];
      let tradeeMember = message.mentions.users.first();
      let traderMemberIngredients = await cb.tacos.get(message.member.id);
      let tradeeMemberIngredients = await cb.tacos.get(tradeeMember.id);
      let tradeeIngredient = args[4];

      let traderArray = Object.entries(traderMemberIngredients);

      let firstFoundIngredient = traderArray.find(
        ([ingredient, quantity]) =>
          ingredient == traderIngredient && quantity >= 1
      );

      if (!firstFoundIngredient) {
        message.channel.send(
          `${message.member.displayName}, you don't have any of that ingredient to trade!`
        );
        return;
      }

      let tradeeArray = Object.entries(tradeeMemberIngredients);

      let secondFoundIngredient = tradeeArray.find(
        ([ingredient, quantity]) =>
          ingredient == tradeeIngredient && quantity >= 1
      );

      if (!secondFoundIngredient) {
        message.channel.send(
          `${message.member.displayName}, the person you are trying to trade with does not have any of your desired ingredient.`
        );
        return;
      }

      message.channel
        .send(`${tradeeMember}, ${message.member.displayName} wants to trade their ${traderIngredient} for your ${tradeeIngredient}. Do you accept?
            Reply yes/no within 2 minutes.`);

      let filter = m => m.author.id === tradeeMember.id;

      let response = '';

      try {
        const collectedMessage = await message.channel.awaitMessages(filter, {
          time: 120000,
          max: 1,
          errors: ['time']
        });

        response = collectedMessage
          .map(cm => cm.content)
          .filter(
            cont => cont.toLowerCase() == 'yes' || cont.toLowerCase() == 'no'
          )
          .toString();

        if (response.toLowerCase().includes('yes')) {
          traderMemberIngredients[traderIngredient]--;

          traderMemberIngredients[tradeeIngredient]++;

          await cb.tacos.set(message.member.id, traderMemberIngredients);

          tradeeMemberIngredients[tradeeIngredient]--;

          tradeeMemberIngredients[traderIngredient]++;

          await cb.tacos.set(tradeeMember.id, tradeeMemberIngredients);

          message.channel.send(
            `${message.member.displayName}, ${tradeeMember.username} has completed the trade! You swapped one of your ${traderIngredient} for one of their ${tradeeIngredient}.`
          );
        } else if (response.toLowerCase().includes('no')) {
          message.channel.send(
            `${message.member.displayName}, ${tradeeMember.username} has declined the trade.`
          );
        } else {
          message.channel.send(`Unable to complete the trade`);
        }
      } catch (e) {
        message.channel.send(
          `${message.member.displayName}, ${tradeeMember} took too long to respond.`
        );
        console.log(e);
      }
    } else if (args[0] == 'whohas') {
      let allIngredients = await cb.tacos.all();
      let ingredient = args[1];
      let arrayOfUserIngredients = [];
      for (i of allIngredients) {
        let thisUser = await cb.client.users.fetch(i.key);
        if (thisUser) {
          for (j in cb.tacoIngredients) {
            if (i.value[j] >= 1) {
              if (j == ingredient) {
                arrayOfUserIngredients.push([thisUser.username, i.value[j]]);
              }
            }
          }
        }
      }

      let formattedString = '';
      arrayOfUserIngredients.forEach(item => {
        formattedString += `${item[0]}: ${item[1]} \n`;
      });

      message.channel.send(
        `List of members with ${ingredient}: \n \n ${formattedString}`
      );
    } else if (args[0] == 'shop') {
      let memberIngredients = await cb.tacos.get(message.member.id);
      message.channel
        .send(`Welcome to the CourierBot Taco Shop! Here, you can trade your excess ingredients for any ingredient available in the shop up to 3 times today.
        Let's take a look at our current inventory: \n
        Lettuce
        Beef
        Cheese
        Tomatoes
        Shells
        Hot sauce
        Guacamole
        Beans \n
        Which ingredient would you like to trade today? Reply with format \`<your ingredient> for <shop ingredient>\` (no <>)`);

      if (memberIngredients.shopCount == 3) {
        message.channel.send(
          `Sorry, you have used the shop 3 times already. Trade with other members to get your desired ingredients!`
        );
        return;
      }

      let filter = m => m.author.id === message.author.id;

      let response = '';

      try {
        const collectedMessage = await message.channel.awaitMessages(filter, {
          time: 120000,
          max: 1,
          errors: ['time']
        });

        response = collectedMessage.map(cm => cm.content).toString();

        response = response.split(' ');

        let thisIngredient = response[0].toLowerCase();

        let desiredIngredient = response[2].toLowerCase();

        if (
          !response.some(ingredient =>
            Object.keys(cb.tacoIngredients).includes(ingredient)
          )
        ) {
          message.channel.send(`Unknown ingredient`);
          return;
        } else {
          Object.keys(cb.tacoIngredients).forEach(async ingredient => {
            if (thisIngredient == ingredient) {
              memberIngredients[ingredient]--;
              if (!memberIngredients[desiredIngredient])
                memberIngredients[desiredIngredient] = 1;
              else memberIngredients[desiredIngredient]++;
              await cb.tacos.set(message.member.id, memberIngredients);
            }
          });
        }

        if (!memberIngredients.shopCount) memberIngredients.shopCount = 1;
        else memberIngredients.shopCount++;

        message.channel.send(
          `You swapped one of your ${thisIngredient} for a ${desiredIngredient} at the shop.`
        );
      } catch (e) {
        console.log(e);
      }
    } else if (args[0] == 'assemble') {
      const assembledTacos = {
        'SUPREME TACO': {
          shell: 1,
          beef: 1,
          cheese: 1,
          lettuce: 1,
          tomatoes: 1
        },
        "AZALEA'S TACO": {
          shell: 1,
          beef: 1,
          cheese: 1,
          'hot sauce': 1
        },
        'GUACAMOLE TACO': {
          shell: 1,
          beef: 1,
          cheese: 1,
          guacamole: 1,
          lettuce: 1
        },
        'BEEF AND BEAN TACO': {
          shell: 1,
          beef: 1,
          cheese: 1,
          beans: 1
        }
      };

      let userIngredients = await cb.tacos.get(message.member.id);

      let madeTaco = false;
      for (taco in assembledTacos) {
        let ingredientCounter = 0;
        for (ingredient in assembledTacos[taco]) {
          if (userIngredients[ingredient] >= assembledTacos[taco][ingredient]) {
            ingredientCounter++;
          }
        }
        if (ingredientCounter == Object.keys(assembledTacos[taco]).length) {
          if (!userIngredients[taco]) userIngredients[taco] = 1;
          else userIngredients[taco]++;
          madeTaco = true;
          message.channel.send(`You successfully assembled the **${taco}**!!!`);
          for (ingredient in assembledTacos[taco]) {
            userIngredients[ingredient]--;
          }
          await cb.tacos.set(message.member.id, userIngredients);
        }
      }
      if (!madeTaco) {
        message.channel.send(
          `Sorry, you don't have enough ingredients to assemble any tacos at the moment.`
        );
      }
    }
  }
};
