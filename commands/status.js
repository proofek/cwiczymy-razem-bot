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

      Season.findCurrentSeason(db).then(function(currentSeasonQuery) {
        let noSeasonMessage = `Cierpliwości  :boar:  . Na razie nie ćwiczymy. Szukaj informacji na temat kolejnego sezonu na kanale ${message.guild.channels.cache.find(channel => channel.name === "cwiczymy-razem").toString()}.`;
        let replyMessage = null;

        if (currentSeasonQuery.empty) {
          replyMessage = noSeasonMessage;
          if (nextSeason) {
            replyMessage = replyMessage + ` Sezon ${nextSeason.number} rozpocznie się ${nextSeason.startDate}.`
          }
          return message.reply(replyMessage)
        }

        currentSeasonQuery.forEach((currentSeasonFound) => {
          const currentSeason = Season.fromFirebaseDoc(currentSeasonFound);
          currentSeason.fetchWinners(db, admin).then(() => {
            if (Date.parse(currentSeason.endDate) < Date.now()) {
              replyMessage = noSeasonMessage;
              if (nextSeason) {
                replyMessage = replyMessage + ` Sezon ${currentSeason.number} już się zakończył, a sezon ${nextSeason.number} rozpocznie się ${nextSeason.startDate}.`
              }
              return message.reply(replyMessage)
            }

            embededMessage = chatMessage.createSeasonStatusEmbedMessage(currentSeason);
            return message.reply({ embed: embededMessage });
          });
        })
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