// const cb = require('../courierbot');

// module.exports = {
//   name: 'whacount',
//   description: 'counts your whas',
//   async execute(message, args) {
//     const member = message.mentions.users.first();

//     if (member) {
//       // const whas = await cb.wha.get(member.id);
//       message.channel.send(
//         `${member.displayName}'s Wha Count: ${cb.whaWrapper(
//           message,
//           member.id
//         )}`
//       );
//     } else {
//       message.channel.send(
//         `${message.member.displayName}'s Wha Count: ${cb.whaWrapper(
//           message,
//           message.member.id
//         )}`
//       );
//     }
//   }
// };
