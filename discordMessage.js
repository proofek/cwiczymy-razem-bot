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
}

module.exports = discordMessage;