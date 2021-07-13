const cb = require("../courierbot");
const WebSocket = require("ws");
const wss = new WebSocket.Server({
    port: 3033
});

const sendMemberCounts = () => {
    wss.on("connection", function connection(ws) {
        console.log("opened connection");

        const sendCounts = () => {
            let memberCounts = JSON.stringify({
                memberCount:
                    cb.client.guilds.cache.get("531182018571141132")
                        .memberCount,
                botCount: cb.client.guilds.cache
                    .get("531182018571141132")
                    .members.cache.filter(member =>
                        member.roles.cache.some(r => r.name === "bots")
                    ).size,
                onlineCount: cb.client.guilds.cache
                    .get("531182018571141132")
                    .members.cache.filter(
                        m =>
                            m.presence.status === "online" ||
                            m.presence.status === "idle" ||
                            m.presence.status === "dnd"
                    ).size
            });
            ws.send(memberCounts);
        };

        sendCounts();

        let listenerObj = {
            guildMemberAdd: sendCounts,
            guildMemberRemove: sendCounts,
            presenceUpdate: sendCounts
        };

        for (listener in listenerObj) {
            cb.client.on(listener, listenerObj[listener]);
        }

        ws.on("message", function incoming(message) {
            if (message === "Remove listeners plz") {
                for (listener in listenerObj) {
                    cb.client.removeListener(listener, listenerObj[listener]);
                }
            }
        });
    });
};

module.exports = {
    sendMemberCounts
};