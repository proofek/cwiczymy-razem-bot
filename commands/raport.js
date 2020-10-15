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

  if (additionalPoints == 0) {
    if (message.attachments.size > 0) {
      const attachment = message.attachments.values().next().value;
      newReport.dokument = attachment.url;
      additionalPoints = 1;
    }
  }

  newReport.czas = reportTime;
  newReport.technika = technicalPoints;
  newReport.sluch = listeningPoints;
  newReport.teoria = theoryPoints;
  newReport.dodatkowePunkty = additionalPoints;

  // Znajdź użytkownika dla którego mamy przetworzyć raport

  saveReport(db, username, reportDate, newReport)
    .then((result) => {
      console.log('Wykonano poprawnie. ' + result.id);
    })
    .catch((error) => {
      switch (error) {
        case 'NoUserException':
          return message.reply(`Hmm... mamy mały problem. Aby zacząc ćwiczyć razem z nami zarejestruj się najpierw używając komendy _!nowy-profil_.`)
        case 'ReportAlreadyExistsException':
          return message.reply(`Otrzymaliśmy już od Ciebie raport na dzień '${reportDate}'. Pamiętaj, że możesz wysyłać tylko jeden raport dziennie.`);
        default:
          console.log('Unexpected failure:', error);
          return message.reply(`Niestety mamy jakiś problem z przetworzeniem twojego raportu. Daj nam znać to spróbujemy to naprawić.`);
      }
    });

  async function saveReport(db, username, reportDate, newReport) {
    let user = null;
    let exception = null;
    const promises = [];

    try {

      user = await User.findUser(db, username);
      let newBadges = null;
      const reportExists = await user.checkReportExists(db, reportDate);
      if (reportExists) {
        throw 'ReportAlreadyExistsException';
      }
      
      await user.fetchBadges(db)
        .then(async () => {
          await user.awardNewBadges(db, admin, newReport)
            .then(async (badgesAwarded) => {
              await user.addNewReport(db, admin, reportDate, newReport, badgesAwarded)
                .then((writeResult) => {

                  const replyMessage = `Nieźle  :boar:  ! Dziękujemy za raport na dzień '${reportDate}'
Czas spędzony na ćwiczeniach: ${newReport.czas}h
Przyznane punkty: technika ${newReport.technika}, słuch ${newReport.sluch}, teoria ${newReport.teoria}, punkty dodatkowe ${newReport.dodatkowePunkty}`
                  message.reply(replyMessage)

                  badgesAwarded.forEach((badgeId) => {
                    Badge.fetchBadge(db, badgeId)
                      .then((badge) => {
                        embededMessage = chatMessage.createNewBadgeEmbedMessage(user, badge);
                        return message.reply({ embed: embededMessage });
                      })
                  })

                  user.fetchUser(db)
                    .then((updatedUser) => {
                      if (updatedUser.level > user.level) {
                        embededMessage = chatMessage.createLevelUpEmbedMessage(updatedUser);
                        message.reply({ embed: embededMessage }); 
                      }
                    });
                })
            })
        })
    } catch (e) {
      exception = e;
    }

    return new Promise((resolve, reject) => {
        if (exception) {
          reject(exception);
        } else {
          resolve(user)  
        }
    });
  }
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