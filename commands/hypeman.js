module.exports = {
  name: 'hypeman',
  description: 'hypeman',
  execute(message, args) {
    let fullString = message.content.replace('.hypeman ', '');

    fullString = fullString.toUpperCase();

    let stringArray = [];

    for (let s of fullString) {
      stringArray.push(s);
    }
    stringArray.push(' ');

    if (stringArray.length >= 44) {
      message.channel.send(
        'Output is too lengthy (2000 character limit reached), try again with shorter input'
      );
      return;
    }

    let stringArrayString = '';

    for (let i = 0; i < stringArray.length; i++) {
      stringArrayString += '\n';
      for (let j = 0; j < stringArray.length; j++) {
        stringArrayString += `${
          stringArray[j + i] || stringArray[i - stringArray.length + j]
        } `;
      }
    }

    if (stringArrayString.length >= 2000) {
      message.channel.send(
        'Output is too lengthy (2000 character limit reached), try again with shorter input'
      );
      return;
    }

    message.channel.send(`\`\`\`\n${stringArrayString}\`\`\``);
  }
};
