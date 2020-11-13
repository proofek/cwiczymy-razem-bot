module.exports = (db, admin, message, args) => {

  const User = require("../user.js")
  const Badge = require("../badge.js")
  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();
  const taggedUser = message.mentions.users.first();
  
  let targetUser = message.author.tag;
  if (taggedUser) {
    targetUser = `${taggedUser.username}#${taggedUser.discriminator}`
  } else if(args.length > 0){
    targetUser = args[0];
  }

  if (!targetUser) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy kogo profil chcesz zobaczyć! Upewnij się, że podałeś pełną nazwę użytkownika Discorda.`);
  }

  User.findUser(db, targetUser)
    .then((user) => {
      user.fetchBadges(db)
        .then(() => {
          embededMessage = chatMessage.createProfileEmbedMessage(user);
          return message.reply({ embed: embededMessage });
        });
    })
    .catch((error) => {
      if (error == 'NoUserException') {
        return message.reply(`Hmm... mamy mały problem. Nie ma takiego :boar: w naszej bazie. Może warto by było zaprosić go do naszej zabawy?`);
      }
    });
}