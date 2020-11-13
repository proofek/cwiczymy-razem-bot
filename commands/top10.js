module.exports = (db, message, args) => {

  const User = require("../user.js")
  let replyMessage = '';
  let position = 1;
  let positionString = '';

  User.findTop10(db, 'seasonsum')
    .then((users) => {
      users.forEach((user) => {
        switch (position) {
          case 1:
            positionString = ":first_place:  ";
            break;
          case 2:
            positionString = ":second_place:  ";
            break;
          case 3:
            positionString = ":third_place:  ";
            break;
          default:
            positionString = position + ".";
        }
        const userLine = `\n${positionString} ${user.fullname} - ${user.pointsTotal}`
        replyMessage = replyMessage.concat(userLine);
        position++;
      });

      return message.reply(replyMessage);
    })
    .catch((error) => {
      if (error == 'NoUserException') {
        return message.reply(`Hmm... mamy mały problem. Nie znaleziono żadnych uczestników zabawy.`);
      }
      
      console.log(`[ERROR:top10-User.findTop10] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
    });
}