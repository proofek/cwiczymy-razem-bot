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

  const interval = 3600000; // 10000 -, 600000 - 10min, 3600000 - 1h;
  const checkOnDay = 0; // 0 - Sunday, 5 - Friday
  const checkOnHour = 17;
  const channelName = 'cwiczymy-razem'; // test, cwiczymy-razem
  let checkedAlready = false;

  console.log(`Ustawiam sprawdzanie przyznawania odznak. Dzień=${dayOfWeekAsInteger(checkOnDay)}, Godzina=${checkOnHour}, co ${(interval < 60000) ? interval/1000 + ' sek' : interval/60000 + ' min' }`);
  const intervalObj = client.setInterval(() => {
    const currentDateTime = new Date();
    console.log(`[${currentDateTime.toString()}] Running interval with checkedAlready=${checkedAlready}`);

    const dayOfWeek = currentDateTime.getDay();
    const hourOfDay = currentDateTime.getHours();
    if (!checkedAlready && dayOfWeek == checkOnDay && hourOfDay == checkOnHour) {
      client.emit('checkForWeeklyAwards', channelName);
      checkedAlready = true;
    } else if (dayOfWeek != checkOnDay) {
      checkedAlready = false;
    }
    
  }, interval, checkedAlready);  
})

/**
* Converts a day string to an number.
*
* @method dayOfWeekAsInteger
* @param {String} day
* @return {Number} Returns day as number
*/
function dayOfWeekAsInteger(day) {
  return ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"][day];
}