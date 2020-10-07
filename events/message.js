const ping = require("../commands/ping")
const info = require("../commands/info")
const register = require("../commands/register")
const raport = require("../commands/raport")
const status = require("../commands/status")

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

  if (command === "register") {
    return register(db, message, args)
  }

  if (command === "raport") {
    return raport(db, admin, message, args)
  }

  if (command === "status") {
    return status(db, message, args)
  }
}