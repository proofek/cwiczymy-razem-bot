module.exports = (db, message, args) => {

  const User = require("../user.js")
  const discordMessage = require("../discordMessage")

  const chatMessage = new discordMessage();

  let targetUser = message.author.username;
  if(args.length > 0){
    targetUser = args[0];
  }

  if (!targetUser) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy kogo statystyki chcesz zobaczyć!`)
  }

  User.findUser(db, targetUser)
    .then(function(userQuery) {

      if (userQuery.empty) {
        return message.reply(`Hmm... mamy mały problem. Nie ma takiego :boar: w naszej bazie. Może warto by było zaprosić go do naszej zabawy?`)
      }

      userQuery.forEach((userFound) => {
        
        const user = new User(userFound);
        embededMessage = chatMessage.createStatusEmbedMessage(user);
        message.reply({ embed: embededMessage });
      })
    });

}