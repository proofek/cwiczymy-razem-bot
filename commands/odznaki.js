module.exports = (db, message, args) => {

  const Badge = require("../badge.js")

  Badge.getBadges(db).then((badgesQuery) => {
    if (badgesQuery.empty) {
      return message.reply(`Hmm... mamy mały problem. Na chwilę obecną nie ma dostępnych żadnych odznak.`)
    }

    let replyMessage = '';
    badgesQuery.forEach((badgeFound) => {
        
      const badge = Badge.fromFirebaseDoc(badgeFound);
      replyMessage = replyMessage + `\n${badge.discordEmoji} (${badge.id}) ${badge.description}`;
    });

    return message.reply(replyMessage);
  });
}