module.exports = (db, admin, message, args) => {

  const Season = require("../season.js")
  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  let seasonNumber = null;
  for (let line of args) {

    if (!seasonNumber && (number = parseSeasonNumber(line))) {
      seasonNumber = number;
    }
  };

  if (seasonNumber) {
    Season.findSeason(db, seasonNumber).then(function(seasonFound) {
        if (!seasonFound.exists) {
          return message.reply(`Hmm... mamy mały problem. Nie ma takiego sezonu w naszej bazie.`)
        }
        
        const season = Season.fromFirebaseDoc(seasonFound);
        season.fetchWinners(db, admin).then(() => {
          embededMessage = chatMessage.createSeasonStatusEmbedMessage(season);
          return message.reply({ embed: embededMessage });          
        });
    });
  } else {
    Season.findNextSeason(db).then(function(nextSeasonQuery) {
      let nextSeason = null;
      nextSeasonQuery.forEach((nextSeasonFound) => {

        nextSeason = Season.fromFirebaseDoc(nextSeasonFound);
      });

      let cwiczymyrazemChannel = null;
      if (message.guild) {
        cwiczymyrazemChannel = message.guild.channels.cache.find(channel => channel.name === "cwiczymy-razem");
      }
      
      let noSeasonMessage = `Cierpliwości  :boar:  . Na razie nie ćwiczymy. Szukaj informacji na temat kolejnego sezonu na kanale ${(cwiczymyrazemChannel) ? cwiczymyrazemChannel.toString() : '#cwiczymy-razem'}.`;

      Season.findCurrentSeason(db)
        .then((season) => {
          let replyMessage = null;
          season.fetchWinners(db, admin).then(() => {
            embededMessage = chatMessage.createSeasonStatusEmbedMessage(season);
            return message.reply({ embed: embededMessage });
          });
        })
        .catch((error) => {
          if (error == 'NoSeasonStartedException') {
            replyMessage = noSeasonMessage;
            if (nextSeason) {
              replyMessage = replyMessage + ` Sezon ${nextSeason.number} rozpocznie się ${nextSeason.startDate}.`
            }
            return message.reply(replyMessage)
          }
          return message.reply(`Niestety mamy jakiś problem ze znalezieniem informacji na temat sezonów. Daj nam znać to spróbujemy to naprawić.`);
        });
    });
  }


}

function parseSeasonNumber(line) {
  const param = line.split("=");

  if (param[0] == "sezon") {
    if (typeof param[1] != "string") return;
    if (!isNaN(param[1]) && !isNaN(parseFloat(param[1]))) {
      return param[1];  
    }
    
    return;
  }

  return;
}