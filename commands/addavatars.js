const cb = require("../courierbot");
const { con } = require("../database");
module.exports = {
    name: "addavatars",
    description: "lets staff add avatars of users to database",
    async execute(message, args) {
        let query = "SELECT discord_user_id FROM nunops_bot.user";
        con.query(query, (err, result) => {
            if (err) console.log(err);
            result.forEach(item => {
                // prettier-ignore
                // checking to see if user still exists on discord
                if (!cb.client.users.cache.some(user => user.id === item.discord_user_id)) return;
                cb.client.users.fetch(item.discord_user_id).then(thisUser => {
                    let thisAvatar = thisUser.avatarURL();
                    let query =
                        "UPDATE nunops_bot.user SET avatar_url = ? WHERE discord_user_id = ?;";
                    con.query(query, [thisAvatar, thisUser.id], err => {
                        if (err) console.log(err);
                    });
                });
            });
            console.log("Successfully added avatar URLs to database.");
        });
    }
};
