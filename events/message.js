const ping = require("../commands/ping")
const info = require("../commands/info")
const pomoc = require("../commands/pomoc")
const nowyprofil = require("../commands/nowy-profil")
const raport = require("../commands/raport")
const profil = require("../commands/profil")
const top10 = require("../commands/top10")
const nowysezon = require("../commands/nowy-sezon")
const status = require("../commands/status")
const odznaki = require("../commands/odznaki")

module.exports = (client, db, admin, message) => {

  let command = '';
  let args = []
  if (!message.content.startsWith("!") || message.author.bot) return;

  args = message.content.slice(1).trim().split(/[\r\n]+/);
  command = args.shift().toLowerCase().trim();

  args2 = command.split(/ +/)
  command = args2.shift().toLowerCase().trim();
  args = args2.concat(args)

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
    return profil(db, admin, message, args)
  }

  if (command === "top10") {
    return top10(db, message, args)
  }

  if (command === "nowy-sezon") {
    return nowysezon(db, message, args)
  }

  if (command === "status") {
    return status(db, admin, message, args)
  }

  if (command === "odznaki") {
    return odznaki(db, message, args)
  }
}