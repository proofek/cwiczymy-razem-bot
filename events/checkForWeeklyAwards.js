/**
 * Checks currents stats to award new badges
 *  * Lider
 *  * Diamentowa gitara
 */
module.exports = (client, db, admin, channelName) => {
  const Season = require("../season.js")
  const User = require("../user.js")
  const Badge = require("../badge.js")
  const cf = require("../common_functions.js")

  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  let embededMessage= null;
  const channel = client.channels.cache.find(channel => channel.name === channelName);

  Season.findCurrentSeason(db)
    .then((season) => {
      console.log(`Sprawdzam odznaki na koniec tygodnia!`)

      const lastMonday = cf.getLastMonday();
      console.log(`Przyznaje dodatkowe punkty za składanie raportów od ${lastMonday.toUTCString()}!`)

      User.getAllUsers(db)
        .then((users) => {
          
          const additionalPointsPromises = [];

          users.forEach(async (user) => {
            additionalPointsPromises.push(awardAdditionalPoints(db, admin, user, lastMonday, discordMessage, channel));
          });

          Promise.all(additionalPointsPromises).then(() => {

            console.log(`Szukamy nowego kandydata do odznaki '${Badge.BADGE_LEADER}!`)
            awardLeaderBadge(db, client, discordMessage, channel);

            console.log(`Szukamy nowego kandydata do odznaki '${Badge.BADGE_STAROFTHEWEEK}'!`)
            awardStarOfTheWeekBadge(db, client, discordMessage, channel);
          });

        })
        .catch((error) => {
          switch (error) {
            default:
              console.log(`[ERROR:checkForWeeklyAwards-User.getAllUsers] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
          }
        });
    })
    .catch((error) => {
      switch (error) {
        case 'NoSeasonStartedException':
          console.log(`Nie rozpoczęliśmy jeszcze nowego sezonu - nie przyznajemy teraz odznak`);
        default:
          console.log(`[ERROR:checkForWeeklyAwards-Season.findCurrentSeason] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
      }
    });

}

/**
 * Awards additional points to the given user
 *
 *
 *
 */
async function awardAdditionalPoints(db, admin, user, lastMonday, discordMessage, channel) {
  const Badge = require("../badge.js")

  let bonusPoints = 0;
  let bonusPointsMessage = '';
  const chatMessage = new discordMessage();
  const promises = [];

  await user.fetchBadges(db);
  const reportsNumber = await user.checkForConsecutiveReports(db, lastMonday)
  console.log(`Ilość raportów dla ${user.fullname}: ${reportsNumber}`);
  if (reportsNumber >= 3) {
    bonusPoints++;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 1 dodatkowy punkt za wysłanie 3 raportów z rzędu w tym tygodniu!\n`
  }
  if (reportsNumber >= 5) {
    bonusPoints++;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 1 dodatkowy punkt za wysłanie 5 raportów z rzędu w tym tygodniu!\n`
  }
  if (reportsNumber === 7) {
    bonusPoints = bonusPoints + 2;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 2 dodatkowe punkty za wysłanie raportu każdego dnia w tym tygodniu!\n`
  }

  const weeklyStats = await user.weeklyReportStats(db, lastMonday);
  console.log(weeklyStats);
  if (weeklyStats.theoryPoints >= 5) {
    bonusPoints++;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 1 dodatkowy punkt za zdobycie 5 punktów Teorii w tym tygodniu!\n`
    if (!user.findBadgeById(Badge.BADGE_ADEPTTEORIIMUZYKI).length) {
      const adeptTeoriiMuzykiBadge = await Badge.fetchBadge(db, Badge.BADGE_ADEPTTEORIIMUZYKI);
      const adeptTeoriiMuzykiPromise = user.awardBadge(db, Badge.BADGE_ADEPTTEORIIMUZYKI);
      promises.push(adeptTeoriiMuzykiPromise);
      adeptTeoriiMuzykiPromise.then((writeResult) => {
        console.log(`Przyznajemy odznakę '${Badge.BADGE_ADEPTTEORIIMUZYKI}' graczowi '${user.fullname}'.`);
        embededMessage = chatMessage.createNewBadgeEmbedMessage(user, adeptTeoriiMuzykiBadge);
        channel.send({ embed: embededMessage });
      });
    }
  }
  if (weeklyStats.listeningPoints >= 5) {
    bonusPoints++;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 1 dodatkowy punkt za zdobycie 5 punktów Słuchu w tym tygodniu!\n`;
    if (!user.findBadgeById(Badge.BADGE_CZULYSLUCH).length) {
      const czulySluchBadge = await Badge.fetchBadge(db, Badge.BADGE_CZULYSLUCH);
      const czulySluchPromise = user.awardBadge(db, Badge.BADGE_CZULYSLUCH);
      promises.push(czulySluchPromise);
      czulySluchPromise.then((writeResult) => {
        console.log(`Przyznajemy odznakę '${Badge.BADGE_CZULYSLUCH}' graczowi '${user.fullname}'.`);
        embededMessage = chatMessage.createNewBadgeEmbedMessage(user, czulySluchBadge);
        channel.send({ embed: embededMessage });
      });
    }
  }
  if (weeklyStats.technicalPoints >= 5) {
    bonusPoints++;
    bonusPointsMessage = `${bonusPointsMessage}\nZdobywasz 1 dodatkowy punkt za zdobycie 5 punktów Techniki w tym tygodniu!\n`
    if (!user.findBadgeById(Badge.BADGE_ADEPTTECHNIKI).length) {
      const adeptTechnikiBadge = await Badge.fetchBadge(db, Badge.BADGE_ADEPTTECHNIKI);
      const adeptTechnikiPromise = user.awardBadge(db, Badge.BADGE_ADEPTTECHNIKI);
      promises.push(adeptTechnikiPromise);
      adeptTechnikiPromise.then((writeResult) => {
        console.log(`Przyznajemy odznakę '${Badge.BADGE_ADEPTTECHNIKI}' graczowi '${user.fullname}'.`);
        embededMessage = chatMessage.createNewBadgeEmbedMessage(user, adeptTechnikiBadge);
        channel.send({ embed: embededMessage });
      });
    }
  }

  if (bonusPoints > 0) {
    const bonusPointsPromise = user.awardBonusBoints(db, admin, bonusPoints);
    promises.push(bonusPointsPromise);
    bonusPointsPromise.then((writeResult) => {
      console.log(`Przyznajemy ${bonusPoints} dodatkowe punkty graczowi '${user.fullname}'.`);
      embededMessage = chatMessage.createPrizeEmbedMessage(user, bonusPointsMessage);
      channel.send({ embed: embededMessage });
    });
  }

  return Promise.all(promises);
}

async function awardLeaderBadge(db, client, discordMessage, channel) {
  const User = require("../user.js")
  const Badge = require("../badge.js")
  const chatMessage = new discordMessage();

  User.findLeader(db)
    .then((leader) => {
      console.log(`Znaleziono nowego lidera: ${leader.fullname} - punkty: ${leader.pointsThisSeason}`);
      Badge.fetchBadge(db, Badge.BADGE_LEADER)
        .then((leaderBadge) => {
          User.findUserWithLeaderAward(db)
            .then((currentOwner) => {
              if (currentOwner) {
                console.log(`Znaleziono aktualnego posiadacza odznaki lidera: ${currentOwner.fullname} - punkty: ${currentOwner.pointsThisSeason}`);  
                if (currentOwner.id == leader.id) {
                  console.log(`Nie mamy zmiany na pozycji lidera.`);
                  channel.send(`Gratulacje ${User.getDiscordUser(client, leader)}! Pozostajesz na pozycji lidera w tym tygodniu! :clap: :champagne:`);
                  embededMessage = chatMessage.createNewBadgeEmbedMessage(leader, leaderBadge);
                  channel.send({ embed: embededMessage });
                } else {
                  if (currentOwner.pointsThisSeason <= leader.pointsThisSeason) {
                    currentOwner.revokeBadge(db, Badge.BADGE_LEADER)
                      .then((writeResult) => {
                        console.log(`'${currentOwner.fullname}' traci pozycję lidera.`);
                        channel.send(`Niestety ${User.getDiscordUser(client, currentOwner)}! Tracisz pozycję lidera w tym tygodniu! :frowning2:`);
                      });
                  }

                  if (currentOwner.id != leader.id) {
                    leader.awardBadge(db, Badge.BADGE_LEADER)
                      .then((writeResult) => {
                        console.log(`Przyznajemy odznakę '${Badge.BADGE_LEADER}' graczowi '${leader.fullname}'.`);
                        channel.send(`Gratulacje ${User.getDiscordUser(client, leader)}! Zostajesz nowym liderem w tym tygodniu! :clap: :champagne:`);
                        embededMessage = chatMessage.createNewBadgeEmbedMessage(leader, leaderBadge);
                        channel.send({ embed: embededMessage });
                      });
                  }
                }            
              } else {
                console.log(`Nikt nie posiada jeszcze odznaki Lidera`);
                leader.awardBadge(db, Badge.BADGE_LEADER)
                  .then((writeResult) => {
                    console.log(`Przyznajemy odznakę '${Badge.BADGE_LEADER}' graczowi '${leader.fullname}'.`);
                    channel.send(`Gratulacje ${User.getDiscordUser(client, leader)}! Zostajesz nowym liderem w tym tygodniu! :clap: :champagne:`);
                    embededMessage = chatMessage.createNewBadgeEmbedMessage(leader, leaderBadge);
                    channel.send({ embed: embededMessage });
                  });
              }
            })
        });
    })
    .catch((error) => {
      switch (error) {
        default:
          console.log(`[ERROR:checkForWeeklyAwards-User.findLeader] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
      }
    });
}

async function awardStarOfTheWeekBadge(db, client, discordMessage, channel) {
  const User = require("../user.js")
  const Badge = require("../badge.js")
  const chatMessage = new discordMessage();

  User.findStarOfTheWeek(db)
    .then((starOfTheWeek) => {
      console.log(`Znaleziono nową gwiazdę tygodnia: ${starOfTheWeek.fullname} - punkty: ${starOfTheWeek.dodatkowePunkty}`);
      Badge.fetchBadge(db, Badge.BADGE_STAROFTHEWEEK)
        .then((starBadge) => {
          User.findUserWithStarAward(db)
            .then((currentOwner) => {
              if (currentOwner) {
                console.log(`Znaleziono aktualnego posiadacza odznaki '${Badge.BADGE_STAROFTHEWEEK}': ${currentOwner.fullname} - punkty: ${currentOwner.dodatkowePunkty}`);  
                if (currentOwner.id == starOfTheWeek.id) {
                  console.log(`Nie mamy zmiany Gwiazdy Tygodnia.`);
                  channel.send(`Gratulacje ${User.getDiscordUser(client, starOfTheWeek)}! Pozostajesz Gwiazdą Tygodnia! :clap: :champagne:`);
                  embededMessage = chatMessage.createNewBadgeEmbedMessage(starOfTheWeek, starBadge);
                  channel.send({ embed: embededMessage });
                } else {
                  if (currentOwner.dodatkowePunkty <= starOfTheWeek.dodatkowePunkty) {
                    currentOwner.revokeBadge(db, Badge.BADGE_STAROFTHEWEEK)
                      .then((writeResult) => {
                        console.log(`'${currentOwner.fullname}' przestaje być Gwiazdą Tygodnia.`);
                        channel.send(`Niestety ${User.getDiscordUser(client, currentOwner)}! Przestajesz być Gwiazdą Tygodnia! :frowning2:`);
                      });
                  }

                  if (currentOwner.id != starOfTheWeek.id) {
                    starOfTheWeek.awardBadge(db, Badge.BADGE_STAROFTHEWEEK)
                      .then((writeResult) => {
                        console.log(`Przyznajemy odznakę '${Badge.BADGE_STAROFTHEWEEK}' graczowi '${starOfTheWeek.fullname}'.`);
                        channel.send(`Gratulacje ${User.getDiscordUser(client, starOfTheWeek)}! Zostajesz nową Gwiazdą Tygodnia! :clap: :champagne:`);
                        embededMessage = chatMessage.createNewBadgeEmbedMessage(starOfTheWeek, starBadge);
                        channel.send({ embed: embededMessage });
                      });
                  }
                }  
              } else {
                console.log(`Nikt nie posiada jeszcze odznaki '${Badge.BADGE_STAROFTHEWEEK}'`);
                starOfTheWeek.awardBadge(db, Badge.BADGE_STAROFTHEWEEK)
                  .then((writeResult) => {
                    console.log(`Przyznajemy odznakę '${Badge.BADGE_STAROFTHEWEEK}' graczowi '${starOfTheWeek.fullname}'.`);
                    channel.send(`Gratulacje ${User.getDiscordUser(client, starOfTheWeek)}! Zostajesz nową Gwiazdą Tygodnia! :clap: :champagne:`);
                    embededMessage = chatMessage.createNewBadgeEmbedMessage(starOfTheWeek, starBadge);
                    channel.send({ embed: embededMessage });
                  });
              }
            });

        });
    })
    .catch((error) => {
      switch (error) {
        default:
          console.log(`[ERROR:checkForWeeklyAwards-User.findStarOfTheWeek] Niestety mamy jakiś problem. Daj nam znać to spróbujemy to naprawić.`, error);
      }
    });
}