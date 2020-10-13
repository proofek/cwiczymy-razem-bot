const Report = require("./report.js")
const Badge = require("./badge.js")
const cf = require("./common_functions.js")

class User {

	id = '';
	discordTag = '';
	nickname = '';
	username = '';
	pointsTotal = 0;
	level = 1;
	timeTotal = 0;
	technika = 0;
	sluch = 0;
	teoria = 0;
	dodatkowePunkty = 0;

	report = [];
	badges = []

	constructor() {
	}

	get pointThisSeason() {
		return +this.technika + +this.sluch + +this.teoria + +this.dodatkowePunkty;
	}

	get fullname() {
		let fullname = '';
		if (this.nickname) {
			fullname = this.nickname + " (" + this.discordTag + ")"
		} else {
			fullname = this.discordTag;
		}
		
		return fullname;
	}

	get timeThisSeason() {
		const hours = Math.floor(+this.timeTotal)
		const min = (+this.timeTotal % 1).toFixed(10);

		return hours + ":" + Math.round(min*60);
	}

	addBadge(badge) {
		this.badges.push(badge);
	}

	awardNewBadges(newReport) {
		let newBadges = [];

		// Zaklinacz czasu
		if ((+newReport.czas >= 5) && !this.findBadgeById("Zaklinacz czasu").length ) {
			newBadges.push("Zaklinacz czasu");
		}
		
		console.log(newBadges)
		return newBadges;
	}

	findBadgeById(badgeId)
	{
		return this.badges.filter((badge) => {
			console.log("filter badge: " + badge)
 			return badge.id == badgeId
		});
	}

	static fromFirebaseDoc(userDoc) {
		let user = new User();
		user.id = userDoc.id;
		user.discordTag = userDoc.get('name');;
		user.nickname = userDoc.get('displayName');
		user.pointsTotal = (userDoc.get('seasonsum') || 0);
		user.level = (userDoc.get('level') || 1);
		user.timeTotal = (userDoc.get('assHours') || 0);
		user.technika = (userDoc.get('technical') || 0);
		user.sluch = (userDoc.get('listening') || 0);
		user.teoria = (userDoc.get('theory') || 0);
		user.dodatkowePunkty = (userDoc.get('additionalPoints') || 0);
		user.report = new Report();

		return user;
	}

	evalRank(punktySezon = null) {
	  
	  if (!punktySezon) {
	  	punktySezon = this.pointThisSeason;
	  }

	  let rank = 1;
	  if (punktySezon >= 10 && punktySezon < 20) {
	    rank = 2;
	  } else if (punktySezon >= 20 && punktySezon < 30) {
	    rank = 3;
	  } else if (punktySezon >= 30 && punktySezon < 40) {
	    rank = 4;
	  } else if (punktySezon >= 40 && punktySezon < 50) {
	    rank = 5;
	  } else if (punktySezon >= 50 && punktySezon < 60) {
	    rank = 6;
	  } else if (punktySezon >= 60 && punktySezon < 70) {
	    rank = 7;
	  } else if (punktySezon >= 70 && punktySezon < 80) {
	    rank = 8;
	  } else if (punktySezon >= 80 && punktySezon < 90) {
	    rank = 9;
	  } else if (punktySezon >= 90 && punktySezon < 100) {
	    rank = 10;
	  }

	  return rank;
	}

	async addNewReport(db, reportDate, newReport) {

		return await db.collection('results').doc(this.id).collection("raporty").doc(reportDate).set({
			czas: newReport.czas,
			sluch: newReport.sluch,
			technika: newReport.technika,
			teoria: newReport.teoria,
			dokument: newReport.dokument
		});
	}

	async fetchBadges(db) {
		return await db.collection('results').doc(this.id).collection("badges").get();
	}

	async updateStats(db, admin, newReport) {

  	const reportCzas = newReport.czas
  	const technikaPunkty = newReport.technika > 0 ? 1 : 0;
  	const sluchPunkty = newReport.sluch > 0 ? 1 : 0;
  	const teoriaPunkty = newReport.teoria > 0 ? 1 : 0;
  	const additionalPoints = (newReport.dokument) ? 1 : 0;

  	const nowePunkty = +technikaPunkty + +sluchPunkty + +teoriaPunkty + +additionalPoints;

  	return await db.collection('results').doc(this.id).update({
    	assHours: admin.firestore.FieldValue.increment(reportCzas),
    	seasonsum: admin.firestore.FieldValue.increment(nowePunkty),
    	technical: admin.firestore.FieldValue.increment(technikaPunkty),
    	listening: admin.firestore.FieldValue.increment(sluchPunkty),
    	theory: admin.firestore.FieldValue.increment(teoriaPunkty),
    	additionalPoints: admin.firestore.FieldValue.increment(additionalPoints),
    	level: this.evalRank(+this.pointThisSeason + +nowePunkty)
  	});
	}

	
	async fetchUser(db) {
		return await db.collection('results').doc(this.id).get();
	}

 	// Returns a promise for a user entity by finding users by their username
	static async findUser(db, username) {
		return await db.collection('results').where('name', '==', username).get();
	}

	static async checkCurrentUserReport(db, userId, reportDate) {
  		return await db.collection('results').doc(userId).collection("raporty").doc(reportDate).get();
	}

	static async addUser(db, user) {
		return await db.collection("results").add({
			name: user.discordTag,
			displayName: user.nickname,
			seasonsum: 0,
			level: 1,
			technical: 0,
			listening: 0,
			theory: 0,
			additionalPoints: 0,
			removed: false
		});
	}

	static async findTop10(db, sortby = 'seasonsum') {
		return await db.collection('results')
			.orderBy(sortby, 'desc')
			.limit(10).get();
	}
}

module.exports = User;