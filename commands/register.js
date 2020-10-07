module.exports = (db, message, args) => {

  const User = require("../user.js")

  const username = message.author.username;

  if (!username) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy kim jesteś!`)
  }

  User.findUser(db, username)
      .then(function(userQuery) {

        if (userQuery.empty) {
          User.addUser(db, username).then(function() {
            return message.reply(`:guitar::guitar::guitar: w dłoń! Zostałeś dodany do zabawy! Zaczynamy ćwiczenia!`)
          })
        } else {
          return message.reply(`Jesteś już uczestnikiem naszej zabawy. Chwytaj  :guitar:  i zaczynaj ćwiczenia!`)
        }
      });

}