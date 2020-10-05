require("dotenv").config()

const fs = require("fs")
const {Client, RichEmbed} = require('discord.js');
const client = new Client()

fs.readdir("./events/", (err, files) => {
  files.forEach((file) => {
    const eventHandler = require(`./events/${file}`)
    const eventName = file.split(".")[0]
    client.on(eventName, (...args) => eventHandler(client, ...args))
  })
})

client.login(process.env.BOT_TOKEN)