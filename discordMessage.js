const User = require("./user.js")

class discordMessage {

	createStatusEmbedMessage(user) {
		const embededMessage = {
			color: 0x0099ff,
			title: 'Statystyki   :boar:   ' + user.fullname,
			description: 'Ilość punktów za wszystkie sezony: ' + user.pointsTotal,
			thumbnail: {
	  			url: 'https://github.com/proofek/cwiczymy-razem-bot/raw/main/rangi/' + user.level + '.png',
			},
			fields: [
              	{
                	name: 'Czas ćwiczeń',
                	value: user.timeThisSeason + " h",
                	inline: true,
              	},
              	{
                	name: 'Ranga',
                	value: user.level,
                	inline: true,
              	},
              	{
               		name: 'Ilość punktów w tym sezonie',
                	value: user.pointThisSeason,
                	inline: true,
              	},
              	{
                	name: 'Technika',
                	value: user.technika,
                	inline: true,
              	},
              	{
                	name: 'Słuch',
                	value: user.sluch,
                	inline: true,
              	},
              	{
                	name: 'Teoria',
                	value: user.teoria,
                	inline: true,
              	},
                {
                  name: 'Dodatkowe punkty',
                  value: user.dodatkowePunkty,
                  inline: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Ćwiczymy razem z Bazokiem',
                icon_url: 'https://cdn.discordapp.com/attachments/654713734845038624/723247496926724227/bazok_color.png',
            },
		}

		return embededMessage;
	}

	createLevelUpEmbedMessage(user) {
		const embededMessage = {
			color: 0x0099ff,
			title: 'Awans   :boar:   ' + user.fullname,
			description: 'Awansowałeś na poziom ' + user.level,
			thumbnail: {
	  			url: 'https://github.com/proofek/cwiczymy-razem-bot/raw/main/rangi/' + user.level + '.png',
			},
			fields: [
              	{
                	name: 'Czas ćwiczeń',
                	value: user.timeThisSeason + " h",
                	inline: true,
              	},
              	{
                	name: 'Ranga',
                	value: user.level,
                	inline: true,
              	},
              	{
               		name: 'Ilość punktów w tym sezonie',
                	value: user.pointThisSeason,
                	inline: true,
              	},
              	{
                	name: 'Technika',
                	value: user.technika,
                	inline: true,
              	},
              	{
                	name: 'Słuch',
                	value: user.sluch,
                	inline: true,
              	},
              	{
                	name: 'Teoria',
                	value: user.teoria,
                	inline: true,
              	},
                {
                  name: 'Dodatkowe punkty',
                  value: user.dodatkowePunkty,
                  inline: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Ćwiczymy razem z Bazokiem',
                icon_url: 'https://cdn.discordapp.com/attachments/654713734845038624/723247496926724227/bazok_color.png',
            },
		}

		return embededMessage;
	}

  createSeasonStatusEmbedMessage(season) {

    let fields = [
      {
        name: 'Data rozpoczęcia sezonu',
        value: season.startDate,
        inline: true,
      },
      {
        name: 'Data zakończenia sezonu',
        value: season.endDate,
        inline: true,
      },
      ];

    if (season.toSeasonEnd > 0) {
      fields.push({
        name: 'Do zakończenia sezonu pozostało',
        value: season.toSeasonEnd + ' dni',
        inline: true,
      });
    }

    season.winners.forEach((winner, index) => {
      let medal = null;
      switch (index) {
        case 0:
          medal = ":first_place:";
          break;
        case 1:
          medal = ":second_place:";
          break;
        case 2:
          medal = ":third_place:";
          break;
        default:
          medal = "";
      }

      fields.push({
        name: `${medal} ${winner.fullname}`,
        value: winner.pointsTotal,
      });
    });

    const embededMessage = {
      color: 0x0099ff,
      title: 'Season ' + season.number,
      description: '',
      fields: fields,
      timestamp: new Date(),
      footer: {
          text: 'Ćwiczymy razem z Bazokiem',
          icon_url: 'https://cdn.discordapp.com/attachments/654713734845038624/723247496926724227/bazok_color.png',
      },
    }

    return embededMessage;
  }

  createNewBadgeEmbedMessage(user, badge) {
    const embededMessage = {
      color: 0x0099ff,
      title: `Zdobyto odznakę ${badge.discordEmoji} ${badge.id}!`,
      description: `Gratulacje ${user.fullname}! Zdobyłeś nową odznakę!`,
      thumbnail: {
          url: 'https://www.emoji.co.uk/files/mozilla-emojis/objects-mozilla/11862-hourglass.png',
      },
      timestamp: new Date(),
      footer: {
          text: 'Ćwiczymy razem z Bazokiem',
          icon_url: 'https://cdn.discordapp.com/attachments/654713734845038624/723247496926724227/bazok_color.png',
      },
    }

    return embededMessage;
  }

}

module.exports = discordMessage;