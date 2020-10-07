require("dotenv").config()

const firebase = require("firebase/app")
const admin = require("firebase-admin")
const serviceAccount = require("./bazok-dev-service-account.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

let db = admin.firestore();

const fs = require("fs")
const {Client} = require('discord.js');
const client = new Client()

fs.readdir("./events/", (err, files) => {
  files.forEach((file) => {
    const eventHandler = require(`./events/${file}`)
    const eventName = file.split(".")[0]
    client.on(eventName, (...args) => eventHandler(client, db, admin, ...args))
  })
})

client.login(process.env.BOT_TOKEN)