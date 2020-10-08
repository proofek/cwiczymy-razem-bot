const Report = require("./report.js")
const cf = require("./common_functions.js")

class User {

	id = '';
	username = '';
	pointsTotal = 0;
	level = 1;
	timeTotal = 0;
	technika = 0;
	sluch = 0;
	teoria = 0;

	report;

	constructor(userDoc) {
		this.id = userDoc.id;
		this.username = userDoc.get('name');
		this.pointsTotal = (userDoc.get('seasonsum') || 0);
		this.level = (userDoc.get('level') || 1);
		this.timeTotal = (userDoc.get('assHours') || 0);
		this.technika = (userDoc.get('technical') || 0);
		this.sluch = (userDoc.get('listening') || 0);
		this.teoria = (userDoc.get('theory') || 0);
		this.report = new Report();
	}

  get pointThisSeason() {
   	return +this.technika + +this.sluch + +this.teoria;
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
			teoria: newReport.teoria
		});
	}

  async updateStats(db, admin, newReport) {

  	const reportCzas = newReport.czas
  	const technikaPunkty = newReport.technika > 0 ? 1 : 0;
  	const sluchPunkty = newReport.sluch > 0 ? 1 : 0;
  	const teoriaPunkty = newReport.teoria > 0 ? 1 : 0;

  	const nowePunkty = +technikaPunkty + +sluchPunkty + +teoriaPunkty;

  	return await db.collection('results').doc(this.id).update({
    	assHours: admin.firestore.FieldValue.increment(reportCzas),
    	seasonsum: admin.firestore.FieldValue.increment(nowePunkty),
    	technical: admin.firestore.FieldValue.increment(technikaPunkty),
    	listening: admin.firestore.FieldValue.increment(sluchPunkty),
    	theory: admin.firestore.FieldValue.increment(teoriaPunkty),
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

	static async addUser(db, username) {
		return await db.collection("results").add({
			name: username,
			seasonsum: 0,
			level: 1,
			technical: 0,
			listening: 0,
			theory: 0,
			removed: false
		});
	}
}

module.exports = User;