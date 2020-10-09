module.exports = (db, message, args) => {

  const User = require("../user.js")
  let replyMessage = '';
  //const discordMessage = require("../discordMessage")

  //const chatMessage = new discordMessage();

  let targetUser = message.author.username;
  if(args.length > 0){
    targetUser = args[0];
  }

  if (!targetUser) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy jaki profil chcesz zobaczyć!`)
  }

  User.findTop10(db, 'seasonsum')
    .then(function(userQuery) {

      if (userQuery.empty) {
        return message.reply(`Hmm... mamy mały problem. Nie znaleziono żadnych uczestników zabawy.`)
      }

      userQuery.forEach((userFound) => {
        const user = new User(userFound);
        const userLine = `\n${user.username}: ${user.pointsTotal}`
        replyMessage = replyMessage.concat(userLine);
        //embededMessage = chatMessage.createStatusEmbedMessage(user);
      })

      return message.reply(replyMessage);
    });
}