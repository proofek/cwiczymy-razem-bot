const ping = require("../commands/ping")
const info = require("../commands/info")

module.exports = (client, message) => {

  if (message.content === "ping") {
    return ping(message)
  }

  if (message.content === "!info") {
    return info(message)
  }

}