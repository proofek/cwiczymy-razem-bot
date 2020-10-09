module.exports = (db, message, args) => {

  const User = require("../user.js")
  let replyMessage = '';
  let position = 1;
  let positionString = '';
  //const discordMessage = require("../discordMessage")

  //const chatMessage = new discordMessage();

  // seasonsum - ilość wszystkich punktów
  // assHours - godziny
  // level - poziom
  User.findTop10(db, 'seasonsum')
    .then(function(userQuery) {

      if (userQuery.empty) {
        return message.reply(`Hmm... mamy mały problem. Nie znaleziono żadnych uczestników zabawy.`)
      }

      userQuery.forEach((userFound) => {
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
        const user = User.fromFirebaseDoc(userFound);
        const userLine = `\n${positionString} ${user.fullname} - ${user.pointsTotal}`
        replyMessage = replyMessage.concat(userLine);
        position++;
        //embededMessage = chatMessage.createStatusEmbedMessage(user);
      })

      return message.reply(replyMessage);
    });
}