const cb = require('../courierbot');

let timerID;

const startTimer = () => {
  timerID = setTimeout(() => {
    message.channel.setName(`☕-choose-a-topic`);
  }, 1000 * 60 * 60 * 72);
};

const startChannelTimer = () => {
  clearTimeout(timerID);
  startTimer();
};

module.exports = {
  startChannelTimer
};
