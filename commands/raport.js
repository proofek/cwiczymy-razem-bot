module.exports = (db, admin, message, args) => {

  const cf = require("../common_functions.js")
  const User = require("../user.js")
  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  const username = message.author.username;
  var InvalidDateException = {};
  var ReportTooOldException = {};
  var ReportTooOldException = {};
  var InvalidTimeException = {};

  if (!username) {
    return message.reply(`Hmm... mamy mały problem. Nie wiemy kim jesteś!`)
  }

  const allowedArgs =['data', 'czas', 'technika', 'sluch', 'teoria']
  const reportArgs = [];

  try {

    args.forEach(function(arg) {

      argParts = arg.split("=");

      // Akceptuj tylko argumenty z jednym znakiem =
      if (argParts.length === 2) {

        // Akceptuj tylko dozwolone argumenty
        if (allowedArgs.includes(argParts[0])) {

          if (reportArgs.some(argObj => argObj.name === argParts[0])) {
            // Pomijaj zduplikowane argumenty
            return;
          }

          switch(argParts[0]) {
              case "data":
                argObj = parseData(argParts[1])
                break;
              case "czas":
                argObj = parseCzas(argParts[1])
                break;
              case "technika":
                 argObj = parseTechnika(argParts[1])
                break;
              case "sluch":
                 argObj = parseSluch(argParts[1])
                break;
              case "teoria":
                 argObj = parseTeoria(argParts[1])
                break;
              default:
                // code block
          }

          reportArgs.push(argObj)
        }
      }
    });

  } catch (e) {
    
    if (e == InvalidDateException) {
      return message.reply(`Podałeś nieprawidłową datę. Pamiętaj, że data raportu powinna być w formacie YYYY-MM-DD, np. 2020-09-28.`);
    }

    if (e == ReportTooOldException) {
      return message.reply(`Podałeś nieprawidłową datę. Pamiętaj, że możesz nie możesz wysyłać raportów starszych niż 7 dni.`);
    }

    if (e == InvalidTimeException) {
      return message.reply(`Podałeś nieprawidłowy czas. Pamiętaj, że czas ćwiczeń powinien być w formacie HH:MM, np. 01:30 dla 1 godziny i 30 minut`);
    }
  }

  const reportDate = cf.getStatValueFromArgs(reportArgs, "data")

  User.findUser(db, username)
    .then(function(userQuery) {

      userQuery.forEach((userFound) => {

        const user = new User(userFound);
        User.checkCurrentUserReport(db, user.id, reportDate).then(function(currentReport) {
          if (!currentReport.exists) {
            user.addNewReport(db, reportArgs).then(function(report) {
                message.reply(`Nieźle  :boar:  ! Dziękujemy za raport na dzień '${reportDate}'`);
            }).then(function() {
              user.updateStats(db, admin, reportArgs).then(function(writeResult) {
                user.fetchUser(db).then(function(userDoc) {
                  const updatedUser = new User(userDoc);
                  if (updatedUser.level > user.level) {
                    embededMessage = chatMessage.createLevelUpEmbedMessage(updatedUser);
                    message.reply({ embed: embededMessage }); 
                  }
                });
              });
            });
          } else {
            message.reply(`Otrzymaliśmy już od Ciebie raport na dzień '${reportDate}'. Pamiętaj, że możesz wysyłać tylko jeden raport dziennie.`);
          }
        });
      })
    });
}

// Walidacja i parsowanie daty
function parseData(value) {
          
  const nowDate = new Date();
  nowDate.setHours(0);
  nowDate.setMinutes(0);
  nowDate.setSeconds(0, 0);

  const userDate = value.split('-');
  const reportDate = new Date(userDate[0], userDate[1] - 1, userDate[2]);

  if (!reportDate instanceof Date || isNaN(reportDate)) {
    throw InvalidDateException;      
  }

  const diffTime = Math.abs(nowDate - reportDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 7) {
    throw ReportTooOldException;
  }

  const argObj = new Object()
  argObj.name = "data"
  argObj.value = value

  return argObj;
}

// Walidacja i parsowanie czasu
function parseCzas(value) {

  const userCzas = value.split(':');
  if (userCzas.length !== 2 || userCzas[0] > 12 || userCzas[1] > 59) {
    throw InvalidTimeException;
  }

  const argObj = new Object()
  argObj.name = "czas"
  argObj.value = value
  argObj.decValue = (+userCzas[0]*60 + +userCzas[1])/60;

  return argObj;
}

function parseTechnika(value) {
  const userTechnika = value.split(':');
  if (userTechnika.length !== 2 || userTechnika[0] > 12 || userTechnika[1] > 59) {
    throw InvalidTimeException;
  }

  const argObj = new Object()
  argObj.name = "technika"
  argObj.value = value
  argObj.decValue = (+userTechnika[0]*60 + +userTechnika[1])/60;;

  return argObj;
}

function parseSluch(value) {
  const userSluch = value.split(':');
  if (userSluch.length !== 2 || userSluch[0] > 12 || userSluch[1] > 59) {
    throw InvalidTimeException;
  }

  const argObj = new Object()
  argObj.name = "sluch"
  argObj.value = value
  argObj.decValue = (+userSluch[0]*60 + +userSluch[1])/60;;

  return argObj;
}

function parseTeoria(value) {
  const userTeoria = value.split(':');
  if (userTeoria.length !== 2 || userTeoria[0] > 12 || userTeoria[1] > 59) {
    throw InvalidTimeException;
  }

  const argObj = new Object()
  argObj.name = "teoria"
  argObj.value = value
  argObj.decValue = (+userTeoria[0]*60 + +userTeoria[1])/60;;

  return argObj;
}
