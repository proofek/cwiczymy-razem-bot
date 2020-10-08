const ping = require("../commands/ping")
const info = require("../commands/info")
const pomoc = require("../commands/pomoc")
const nowyprofil = require("../commands/nowy-profil")
const raport = require("../commands/raport")
const profil = require("../commands/profil")

module.exports = (client, db, admin, message) => {

  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

/*const util = require('util')

console.log(util.inspect(message, {showHidden: false, depth: null}))
console.log(util.inspect(args, {showHidden: false, depth: null}))
console.log(util.inspect(command, {showHidden: false, depth: null}))*/

  if (command === "ping") {
    return ping(message, args)
  }

  if (command === "info") {
    return info(message, args)
  }

  if (command === "pomoc") {
    return pomoc(message, args)
  }

  if (command === "nowy-profil") {
    return nowyprofil(db, message, args)
  }

  if (command === "raport") {
    return raport(db, admin, message, args)
  }

  if (command === "profil") {
    return profil(db, message, args)
  }
}