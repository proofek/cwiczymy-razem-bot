module.exports = (db, message, args) => {

  const User = require("../user.js")

  let newUser = new User();
  newUser.username = message.author.username;
  newUser.discordTag = message.author.tag;
  newUser.nickname = (message.member.nickname) ? message.member.nickname : '';

  User.findUser(db, newUser.discordTag)
      .then(function(userQuery) {
          return message.reply(`Jesteś już uczestnikiem naszej zabawy. Chwytaj  :guitar:  i zaczynaj ćwiczenia!`)
      })
      .catch((error) => {
          switch (error) {
            case 'NoUserException':
              User.addUser(db, newUser).then(function() {
                return message.reply(`:guitar::guitar::guitar: w dłoń! Zostałeś dodany do zabawy! Zaczynamy ćwiczenia!`)
              });
              break;
            default:
              console.log(`[ERROR:nowy-profil-User.findUser] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
          }
        });

}