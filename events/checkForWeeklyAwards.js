/**
 * Checks currents stats to award new badges
 *  * Lider
 *  * Diamentowa gitara
 */
module.exports = (client, db, admin, channelName) => {
  const Season = require("../season.js")
  const User = require("../user.js")
  const Badge = require("../badge.js")

  const discordMessage = require("../discordMessage")
  const chatMessage = new discordMessage();

  let embededMessage= null;
  const channel = client.channels.cache.find(channel => channel.name === channelName);

  Season.findCurrentSeason(db)
    .then((season) => {
      console.log(`Sprawdzam odznaki na koniec tygodnia!`)

      console.log(`Szukamy nowego kandydata do odznaki '${Badge.BADGE_LEADER}!`)
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

        console.log(`Szukamy nowego kandydata do odznaki '${Badge.BADGE_STAROFTHEWEEK}'!`)
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