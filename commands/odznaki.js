module.exports = (db, message, args) => {

  const Badge = require("../badge.js");

  Badge.getBadges(db)
    .then((badges) => {
      let replyMessage = '';
      badges.forEach((badge) => {
        replyMessage = replyMessage + `\n${badge.discordEmoji} (${badge.id}) ${badge.description}`;
      });
      return message.reply(replyMessage);
    })
    .catch((error) => {
      if (error == 'NoBadgesException') {
        return message.reply(`Hmm... mamy mały problem. Na chwilę obecną nie ma dostępnych żadnych odznak.`);
      }
    });
}