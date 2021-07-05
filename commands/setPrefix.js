const cb = require("../courierbot");
const { con } = require("../database");
const fs = require("fs");

module.exports = {
    name: "setprefix",
    description: "sets the prefix the bot uses for commands",
    execute(message, args) {
        let prefix2 = args[0];

        // setting prefix in database

        con.query(
            "INSERT INTO nunops_bot.server_config (command_prefix) VALUES (?);",
            prefix2,
            err => {
                if (err) console.log(err);
            }
        );

        // getting and setting prefix in json configuration

        fs.readFile("config.json", "utf8", (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let obj = JSON.parse(data);
                obj.prefix = prefix2;
                let json = JSON.stringify(obj);
                fs.writeFile("config.json", json, "utf8", err => {
                    if (err) console.log(err);
                    console.log(`complete`);
                });
            }
        });

        message.channel.send(`New prefix is ${prefix2}`);
    }
};
