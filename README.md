# courierbot

This is a custom Discord bot made in discord.js for the Couriers Discord server. Currently it has a few simple commands but will be extended to include a ticketing/verification system as well as anything else I might like to add.

This project is to benefit the Couriers server, and also serves as a way for me to familiarize myself with discord.js, node.js, and JavaScript overall. So please be nice if you notice any glaring problems. :^)


CURRENT LIST OF COMMANDS:


.worth [$amount] [distance] - calculates dollars per mile of an order
   - example: .worth $10 5mi
    > This order pays $2/mi.

.pants - displays a random image of pants

.ddPay - links to the Doordash FAQ article on payment
.ghPay - links to the GrubHub FAQ article on payment

.setbirthday [2-digit month] [2-digit day] - sets your birthday in the database and gives you a happy birthday message on your birthday
    - example: .setbirthday 12 25
     > Successfully set your birthday!

.recurringmessage [interval] [message] - allows staff to set a recurring message on an interval
    - example: .recurringmessage 12h Pants.
     > [Every 12 hours] Pants.
 .stopmessage - clears recurring message

.rolecount [role] - counts the number of members with a certain role (case sensitive)
    - example: .rolecount Doordash
     > Number of members with role "Doordash": 180

    
Bot is currently running on a Linode instance with all dependencies installed (node.js, endb, sqlite3, sql, Discord token file). As the bot's usage is so specific to our server, I doubt anyone would want to run it themselves, but if you're interested in that for some reason, feel free to contact me.
