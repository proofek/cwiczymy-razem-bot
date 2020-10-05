const ping = require("../commands/ping")
const info = require("../commands/info")

module.exports = (client, RichEmbed, message) => {

  if (message.content === "ping") {
    return ping(RichEmbed, message)
  }

  if (message.content === "!info") {
    return info(RichEmbed, message)
  }

}