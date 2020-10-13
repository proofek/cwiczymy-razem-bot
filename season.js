const dateformat = require('dateformat');
const User = require("./user.js")

class Season {

	id = '';
	number = '';
	startDate = null;
	endDate = null;
	winners = [];

	get toSeasonEnd()
	{
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const timeDiff = Date.parse(this.endDate) - now;
		return Math.floor((timeDiff / (1000 * 60 * 60 * 24))) + 1;
	}

	fetchWinners(db, admin) {
		return this.findWiners(db, admin).then((winnersQuery) => {
			let user = null;
			winnersQuery.forEach((winnerFound) => {
				user = new User();
				user.discordTag = winnerFound.get('name');
				user.nickname = winnerFound.get('displayName');
				user.pointsTotal = winnerFound.get('points');

				this.winners.push(user);
			});
		});
	}

	async findWiners(db, admin) {
		const seasonId = "sezon" + this.number;
		return await db.collection('seasons').doc(seasonId).collection('winners')
			.orderBy(admin.firestore.FieldPath.documentId(), 'asc')
			.get();
	}

 	// Returns a promise for a season entity by finding seasons by their number
	static async findSeason(db, number) {
		const seasonId = "sezon" + number;
		return await db.collection('seasons').doc(seasonId).get()
	}

	static async findCurrentSeason(db) {
		return await db.collection('seasons')
			.where('startDate', '<=', Date.now())
			.orderBy('startDate', 'desc')
			.limit(1)
			.get();
	}

	static async findNextSeason(db) {
		return await db.collection('seasons')
			.where('startDate', '>', Date.now())
			.orderBy('startDate', 'asc')
			.limit(1)
			.get();
	}

	static fromFirebaseDoc(seasonDoc) {
		let season = new Season();
		season.id = seasonDoc.id;
		season.number = seasonDoc.get('number');
		const startDate = (seasonDoc.get('startDate') || null);
		if (startDate) {
			season.startDate = dateformat(new Date(startDate), 'isoDate');
		}
		const endDate = (seasonDoc.get('endDate') || null);
		if (endDate) {
			season.endDate = dateformat(new Date(endDate), 'isoDate');
		}

		return season;
	}

	static async findLastSeason(db) {
		return await db.collection('seasons')
			.orderBy('endDate', 'desc').limit(1)
			.get();
	}

	static async addSeason(db, season) {
		return await db.collection("seasons").doc("sezon" + season.number).set({
			number: season.number,
			startDate: Date.parse(season.startDate),
			endDate: Date.parse(season.endDate),
			removed: false
		});
	}
}

module.exports = Season;