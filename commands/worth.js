const cb = require('../courierbot.js');


module.exports = {
        name: "worth",
        description: "reads in mileage and payout and returns desirability and $/mi",
        execute(message, args) {
            function dollarsPerMile (payout, mileage) {
                payout = payout.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
                mileage = mileage.replace(/[&\/\\#,+()$~%'":*?mi<>{}]/g, '');
                return Math.round((payout / mileage) * 100) / 100;
            }

            message.channel.send(`This order pays $${dollarsPerMile(args[0], args[1])} / mi.`);
        }
    }