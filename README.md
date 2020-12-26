# courierbot

This is a custom Discord bot made in discord.js for the Couriers Discord server. Currently it has a few simple commands but will be extended to include a ticketing/verification system as well as anything else I might like to add.

This project is to benefit the Couriers server, and also serves as a way for me to familiarize myself with discord.js, node.js, and JavaScript overall. So please be nice if you notice any glaring problems. :^)


CURRENT LIST OF COMMANDS:

 .recurringmessage
     - Sends a recurring message in the channel it was executed.
     - Parameters: `.recurringmessage <interval (h, m, s)> Message goes here`
     - Stops message via command `.stopmessage`
     
.ddpay
    - Sends DoorDash FAQ page for Dasher pay.
    
.ghpay
    - Sends GrubHub FAQ page for driver pay.
    
.ping
    - Sends "Pong."
    
Bot is currently running on a Linode instance with all dependencies installed (node.js, Keyv, Discord token file). As the bot's usage is so specific to our server, I doubt anyone would want to run it themselves, but if you're interested in that for some reason, feel free to contact me.
