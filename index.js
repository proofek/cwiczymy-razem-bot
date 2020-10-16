require("dotenv").config()

const firebase = require("firebase/app")
const admin = require("firebase-admin")

admin.initializeApp({
  credential: admin.credential.cert(
  	JSON.parse(Buffer.from(process.env.FIREBASE_SERVICEACCOUNT_BASE64, 'base64').toString('ascii'))
  )
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

client.login(process.env.BOT_TOKEN).then(() => {

  const interval = 600000; // 600000 - 10min, 3600000 - 1h;
  const checkOnDay = 5;
  const channelName = 'cwiczymy-razem';
  let checkedAlready = false;

  const intervalObj = client.setInterval(() => {
    const currentDateTime = new Date();
    console.log(`[${currentDateTime.toString()}] Running interval with checkedAlready=${checkedAlready}`);
    // 0 - Sunday, 5 - Friday
    const dayOfWeek = currentDateTime.getDay();
    if (!checkedAlready && dayOfWeek == checkOnDay) {
      client.emit('checkForWeeklyAwards', channelName);
      checkedAlready = true;
    } else if (dayOfWeek != checkOnDay) {
      checkedAlready = false;
    }
    
  }, interval, checkedAlready);  
})

