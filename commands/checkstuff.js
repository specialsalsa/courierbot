const cb = require("../courierbot");

module.exports = {
    name: "addmeasdfasdf",
    description: "me checking stuff",
    async execute(message, args) {
        // if (message.member.roles.cache.find(r => r.name === "courierbot")) {
        // message.channel.send("It worked!");
        //         } else {
        //             message.channel.send("It also worked!");
        //             console.log(message.guild.roles.cache.size);

        //         }
        //     }
        // };
        let lastID = JSON.parse(await cb.endb.get());
        if (!args[0]) {
            try {
                await cb.endb.set(
                    `${message.author.tag}`,
                    JSON.stringify({
                        name: message.author.tag,
                        id: 0,
                        role: "Developer",
                        staff: true,
                        stonesThrown: 0
                    })
                );

                message.channel.send(
                    `Successfully set database entry for ${
                        JSON.parse(await cb.endb.get("specialsal")).name
                    }`
                );
            } catch (e) {
                console.log(e);
            }
        } else if (args[0] == "check") {
            message.channel.send(
                JSON.parse(await cb.endb.get("specialsal")).name
            );
        }
    }
};
