const ping = require("../commands/ping")

module.exports = (client, message) => {

  if (message.content === "ping") {
    return ping(message)
  }

}