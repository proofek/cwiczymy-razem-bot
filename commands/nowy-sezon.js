module.exports = (db, message, args) => {

  if (!message.member.roles.cache.some(role => role.name.includes('Moderator'))) {
    return message.reply(`Tylko moderatorzy mogą zarządzać sezonami gry!`)
  }

  const Season = require("../season.js")

  const newSeason = new Season();
  let startDate = '';
  let endDate = '';
  for (let line of args) {

    if (startDate = parseStartDate(line)) {
      newSeason.startDate = startDate;
    }

    if (endDate = parseEndDate(line)) {
      newSeason.endDate = endDate;
    }
  };

  if (Date.parse(newSeason.startDate) >= Date.parse(newSeason.endDate)) {
    return message.reply(`Nowy sezon nie może zacząć przed swoim zakończeniem. Sprawdź dobrze datę rozpoczęcia i zakończenia sezonu!`)
  }

  if (Date.parse(newSeason.startDate) <= Date.now()) {
    return message.reply(`Nowy sezon nie może rozpocząć się w przeszłości. Sprawdź dobrze datę rozpoczęcia i upewnij się, że jest ona w przyszłości`)
  }

  Season.findLastSeason(db)
    .then(function(seasonQuery) {

      let season = new Season();
      seasonQuery.forEach((seasonFound) => {
        season = Season.fromFirebaseDoc(seasonFound);
      });

      return season;
    })
    .then(function(season) {

      if (Date.parse(newSeason.startDate) <= Date.parse(season.endDate)) {
        return message.reply(`Nowy sezon nie może zacząć przed zakończeniem starego sezonu. Upewnij się, że kolejny sezon zaczyna się po ${season.endDate}`)
      }

      newSeason.number = (season.number) ? +season.number + 1 : 1;

      Season.addSeason(db, newSeason).then(function() {
        return message.reply(`:guitar::guitar::guitar: w dłoń! Sezon ${newSeason.number} rozpoczęty! Ćwiczenia zaczynamy ${newSeason.startDate}!`)
      })

    });
}

function parseStartDate(line) {
  const param = line.split("=");

  if (param[0] == "startdate") {
    return param[1];
  }

  return;
}

function parseEndDate(line) {
  const param = line.split("=");

  if (param[0] == "enddate") {
    return param[1];
  }

  return;
}
