module.exports = (db, admin, message, args) => {

  const cf = require("../common_functions.js")
  const dateformat = require('dateformat');
  const getUrls = require('get-urls');
  
  const User = require("../user.js")
  const Badge = require("../badge.js")

  const Report = require("../report.js")
  const newReport = new Report();
  
  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  let username = message.author.tag;
  let reportDate = '';
  let reportTime = '';
  let technicalPoints = 0;
  let listeningPoints = 0;
  let theoryPoints = 0;
  let additionalPoints = 0;

  for (let line of args) {

      if (!reportDate) {

        try {

          reportDate = parseReportDate(line)  

        } catch (e) {

          if (e == 'InvalidDateException') {
            return message.reply(`Podałeś nieprawidłową datę. Pamiętaj, że data raportu powinna być w formacie YYYY-MM-DD, np. 2020-09-28.`);
          }

          if (e == 'ReportTooOldException') {
            return message.reply(`Któżby pamiętał o tak starym ćwiczeniu? Raportuj na bieżąco. Pamiętaj, że nie możesz wysyłać raportów starszych niż 7 dni.`);
          }

          if (e == 'ReportInTheFutureException') {
            return message.reply(`To się zapędziłeś  :boar:  ! Ćwiczenie w przyszłości? Możesz nam tylko powiedzieć o ćwiczeniu, które się już odbyło. Pamiętaj, akceptujemy raporty z dnia dzisiejszego lub 7-miu ostatnich dni.`);
          }
        }
      }

      if (!reportTime) {
        try {

          reportTime = parseReportTime(line)  

        } catch (e) {

          if (e == 'InvalidTimeException') {
            return message.reply(`Podałeś nieprawidłowy czas. Pamiętaj, że czas ćwiczeń powinien być w formacie HH:MM, np. 01:30 dla 1 godziny i 30 minut`);
          }
        }
      }

      if (technicalPoints == 0) {
        technicalPoints = parseTechnicalPoints(line);
      }

      if (listeningPoints == 0) {
        listeningPoints = parseListeningPoints(line);
      }

      if (theoryPoints == 0) {
        theoryPoints = parseTheoryPoints(line);
      }

      if (additionalPoints == 0) {
        const urlsFound = getUrls(line);
        if (urlsFound.size > 0) {
          const urlsIterator = urlsFound[Symbol.iterator]();
          newReport.dokument = urlsIterator.next().value;
          additionalPoints = 1;
        }
      }
  };

  if (!reportTime) {
    return message.reply(`Hey  :boar:  ! Ale musisz nam powiedzieć jak długo ćwiczyłeś. Dodaj do raportu na przykład taką linię: 'Czas 1:30h'`);
  }

  reportDate = dateformat((!reportDate) ? new Date() : reportDate, 'isoDate');

  newReport.czas = reportTime;
  newReport.technika = technicalPoints;
  newReport.sluch = listeningPoints;
  newReport.teoria = theoryPoints;

  if (additionalPoints == 0) {
    if (message.attachments.size > 0) {
      const attachment = message.attachments.values().next().value;
      newReport.dokument = attachment.url;
      additionalPoints = 1;
    }
  }

  User.findUser(db, username)
    .then(function(userQuery) {

      if (userQuery.empty) {
        return message.reply(`Hmm... mamy mały problem. Aby zacząc ćwiczyć razem z nami zarejestruj się najpierw używając komendy _!nowy-profil_.`)
      }

      userQuery.forEach((userFound) => {

        const user = User.fromFirebaseDoc(userFound);
        User.checkCurrentUserReport(db, user.id, reportDate).then(function(currentReport) {
          if (!currentReport.exists) {
            user.addNewReport(db, reportDate, newReport).then(function(report) {
              const replyMessage = `Nieźle  :boar:  ! Dziękujemy za raport na dzień '${reportDate}'
Czas spędzony na ćwiczeniach: ${reportTime}h
Przyznane punkty: technika ${technicalPoints}, słuch ${listeningPoints}, teoria ${theoryPoints}, punkty dodatkowe ${additionalPoints}`

              return message.reply(replyMessage)
            }).then(() => {
              user.fetchBadges(db).then((badgeQuery) => {
                badgeQuery.forEach((badgeFound) => {
                  const badge = Badge.fromFirebaseDoc(badgeFound);
                  user.addBadge(badge);
                });
              }).then(() => {
                const newBadges = user.awardNewBadges(newReport);
                newBadges.forEach((badgeId) => {
                  Badge.fetchBadge(db, badgeId).then((badgeDoc) => {
                    const badge = Badge.fromFirebaseDoc(badgeDoc);
                    badge.awardToUser(db, user.id).then((writeResult) => {
                      embededMessage = chatMessage.createNewBadgeEmbedMessage(user, badge);
                      return message.reply({ embed: embededMessage });
                    });
                  });
                });
              });

              user.updateStats(db, admin, newReport).then(function(writeResult) {
                user.fetchUser(db).then(function(userDoc) {
                  const updatedUser = User.fromFirebaseDoc(userDoc);
                  if (updatedUser.level > user.level) {
                    embededMessage = chatMessage.createLevelUpEmbedMessage(updatedUser);
                    message.reply({ embed: embededMessage }); 
                  }
                });
              });
            });
          } else {
            return message.reply(`Otrzymaliśmy już od Ciebie raport na dzień '${reportDate}'. Pamiętaj, że możesz wysyłać tylko jeden raport dziennie.`);
          }
        });
      })
    });
}

function parseReportDate(line) {

  let reportDate = '';
  const regex1 = /data\s*[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]*\s*[:=]?\s*/i;
  const dateFound = line.match(regex1);

  if (dateFound) {
    const regex = /data\s*[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]*\s*[:=]?\s*(20\d\d)\-(0?[1-9]|1[012])\-([12][0-9]|3[01]|0?[1-9])/i;
    const found = line.match(regex);

    if (found) {
      reportDate = new Date(found[1], found[2] - 1, found[3]);
    }

    if (!(reportDate instanceof Date) || isNaN(reportDate)) {
      throw 'InvalidDateException';
    }

    const diffTime = Math.abs(new Date() - reportDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      throw 'ReportTooOldException';
    }

    if (new Date() < reportDate) {
      throw 'ReportInTheFutureException';
    }
  }

  return reportDate;
}

function parseReportTime(line) {

  let reportTime = '';
  const regex1 = /czas\s*[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]*\s*[:=]?\s*/i;
  const timeFound = line.match(regex1);

  if (timeFound) {
    const regex = /czas\s*[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]*\s*[:=]?\s*(\d+([\.:][0-5][0-9])?)/i;
    const found = line.match(regex);

    if (found) {
      reportTime = found[1];
    }

    if (!reportTime) {
      throw 'InvalidTimeException';
    }
  }

  return reportTime;
}

function parseTechnicalPoints(line) {

    const regex = /technika/i;
    const found = line.match(regex);

    return (found) ? 1 : 0;
}

function parseListeningPoints(line) {

    const regex = /sluch|słuch/i;
    const found = line.match(regex);

    return (found) ? 1 : 0;
}

function parseTheoryPoints(line) {

    const regex = /teoria/i;
    const found = line.match(regex);

    return (found) ? 1 : 0;
}