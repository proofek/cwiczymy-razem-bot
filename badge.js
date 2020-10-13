class Badge {

	id = null;
	description = null;
	removed = false;
	badge = null;
	discordEmoji = null;
	type = null;
	
	constructor() {
	}

	static async fetchBadge(db, badgeId) {
		return await db.collection('achievements').doc(badgeId).get();
	}

	async awardToUser(db, userId) {
  	return await db.collection('results').doc(userId).collection("badges").doc(this.id).set({
			dateAdded: Date.now(),
			dateRevoked: null,
		});
	}

	static fromFirebaseDoc(badgeDoc) {
		let badge = new Badge();
		badge.id = badgeDoc.id;
		badge.description = (badgeDoc.get('desc') || 'Brak opisu');
		badge.removed = badgeDoc.get('removed');
		badge.badge = (badgeDoc.get('badge') || 'Brak ikony odznaki');
		badge.discordEmoji = (badgeDoc.get('discordEmoji') || ':medal:');
		badge.type = (badgeDoc.get('type') || ':medal:');

		return badge;
	}

	static async getBadges(db) {
  		return await db.collection('achievements').where('removed', '==', false).get();
	}
}

module.exports = Badge;