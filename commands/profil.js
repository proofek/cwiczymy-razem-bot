module.exports = (db, admin, message, args) => {

  const User = require("../user.js")
  const Badge = require("../badge.js")
  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  let targetUser = message.author.tag;
  if(args.length > 0){
    targetUser = args[0];
  }

  if (!targetUser) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy kogo profil chcesz zobaczyć! Upewnij się, że podałeś pełną nazwę użytkownika Discorda.`)
  }

  User.findUser(db, targetUser)
    .then(function(userQuery) {

      if (userQuery.empty) {
        return message.reply(`Hmm... mamy mały problem. Nie ma takiego :boar: w naszej bazie. Może warto by było zaprosić go do naszej zabawy?`)
      }

      userQuery.forEach((userFound) => {
        
        const user = User.fromFirebaseDoc(userFound);
        user.fetchBadges(db)
          .then((badgeQuery) => {
            badgeQuery.forEach((badgeFound) => {
              user.addBadge(badgeFound.id);
            });
          })
          .then(() => {
            if (user.badges.length > 0) {
              Badge.fetchBadgesById(db, admin, user.badges)
                .then((badgesQuery) => {
                  let badges = [];

                  badgesQuery.forEach((badgeFound) => {
                    badges.push(Badge.fromFirebaseDoc(badgeFound));
                  });

                  embededMessage = chatMessage.createProfileEmbedMessage(user, badges);
                  return message.reply({ embed: embededMessage });
              });
            } else {
                embededMessage = chatMessage.createProfileEmbedMessage(user, []);
                return message.reply({ embed: embededMessage });              
            }
          });
      })
    });
}