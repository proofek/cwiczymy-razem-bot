const dateformat = require('dateformat');

class Season {

	id = '';
	number = '';
	startDate = null;
	endDate = null;

 	// Returns a promise for a season entity by finding seasons by their number
	static async findSeason(db, number) {
		const seasonId = "season" + number;
		return await db.collection('seasons').doc(seasonId).get()
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

 	// Returns a promise for a season entity by finding seasons by their number
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