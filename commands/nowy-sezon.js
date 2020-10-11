module.exports = (db, message, args) => {

  const Season = require("../season.js")

  let season = new Season();

  Season.findLastSeason(db)
    .then(function(seasonQuery) {

      seasonQuery.forEach((seasonFound) => {
        season = Season.fromFirebaseDoc(seasonFound);
      });
    })
    .then(function(param) {

      const newSeason = new Season();
      newSeason.number = (season.number) ? +season.number + 1 : 1;

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

      Season.addSeason(db, newSeason).then(function() {
        return message.reply(`:guitar::guitar::guitar: w dłoń! Sezon ${newSeason.number} rozpoczęty! Ćwiczenia zaczynamy od ${newSeason.startDate}!`)
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