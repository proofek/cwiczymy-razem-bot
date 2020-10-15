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

  findBadgeById(badgeId)
  {
    return this.badges.filter((badge) => {
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
    } else if (punktySezon >= 100 && punktySezon < 110) {
      rank = 11;
    } else if (punktySezon >= 110 && punktySezon < 120) {
      rank = 12;
    }

    return rank;
  }

  async addNewReport(db, admin, reportDate, newReport, badgesAwarded) {

    console.log('nowe odznaki', badgesAwarded);

    const res = await db.runTransaction(async t => {
      const resultRef = db.collection('results').doc(this.id);
      const reportRef = resultRef.collection("raporty").doc(reportDate);

      await t.set(reportRef, {
        sluch: newReport.sluch,
        technika: newReport.technika,
        teoria: newReport.teoria,
        dokument: newReport.dokument
      });

      const reportCzas = newReport.czas;
      const technikaPunkty = newReport.technika > 0 ? 1 : 0;
      const sluchPunkty = newReport.sluch > 0 ? 1 : 0;
      const teoriaPunkty = newReport.teoria > 0 ? 1 : 0;
      const additionalPoints = (newReport.dokument) ? 1 : 0;
      const nowePunkty = +technikaPunkty + +sluchPunkty + +teoriaPunkty + +additionalPoints;

      await t.update(resultRef, {
        assHours: admin.firestore.FieldValue.increment(reportCzas),
        seasonsum: admin.firestore.FieldValue.increment(nowePunkty),
        technical: admin.firestore.FieldValue.increment(technikaPunkty),
        listening: admin.firestore.FieldValue.increment(sluchPunkty),
        theory: admin.firestore.FieldValue.increment(teoriaPunkty),
        additionalPoints: admin.firestore.FieldValue.increment(additionalPoints),
        level: this.evalRank(+this.pointThisSeason + +nowePunkty)
      });

      badgesAwarded.forEach(async (badgeId) => {
        const badgeRef = resultRef.collection("badges").doc(badgeId);
        await t.set(badgeRef, {
          name: badgeId,
          dateAdded: Date.now(),
          dateRevoked: null,
        });
      });

      return true;
    });

    return res;
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
    const userDoc = await db.collection('results').doc(this.id).get();
    const user = User.fromFirebaseDoc(userDoc);

    return new Promise((resolve) => {
      resolve(user)
    });

    //return await db.collection('results').doc(this.id).get();
  }

  // Finds a user by their username
  static async findUser(db, username) {
    let user = null;
    const usersRef = db.collection('results').where('name', '==', username);
    const userQuery = await usersRef.get();

    if (userQuery.empty) {
        throw 'NoUserException';
    }

    userQuery.forEach((userFound) => {
      user = User.fromFirebaseDoc(userFound);
    });

    return new Promise((resolve, reject) => {
      if (user) {
        resolve(user)
      } else {
        reject('NoUserException');
      }
    });

    //return await db.collection('results').where('name', '==', username).get();
  }

  // Finds user report for given reportDate
  async checkReportExists(db, reportDate) {
    const reportRef = db.collection('results').doc(this.id).collection("raporty").doc(reportDate);
    const report = await reportRef.get();
    
    return new Promise((resolve) => {
      resolve(report.exists)
    });
    //return await db.collection('results').doc(userId).collection("raporty").doc(reportDate).get();
  }

  async fetchBadges(db) {
    const badgesPromises = [];

    const badgeQuery = await db.collection('results').doc(this.id).collection("badges").get();
    badgeQuery.forEach((badgeFound) => {
      console.log('Fetching async badge ' + badgeFound.id);
      badgesPromises.push(Badge.fetchBadge(db, badgeFound.id));
    });

    return Promise.all(badgesPromises).then((badges) => {
      console.log('Resolved all badges');
      badges.forEach((badge) => {
        this.addBadge(badge);
      });

    });
    //return await db.collection('results').doc(this.id).collection("badges").get();
  }

  // Give user new badges if they earned it
  async awardNewBadges(db, admin, newReport) {
    let newBadges = [];

    // Zaklinacz czasu
    if ((+newReport.czas >= 5) && !this.findBadgeById("Zaklinacz czasu").length ) {
      console.log(`Awarding Zaklinacz czasu`)
      newBadges.push("Zaklinacz czasu");
    }
    
    // 50H
    if ((+this.timeTotal >= 50) && !this.findBadgeById("50H").length ) {
      console.log(`Awarding 50H`)
      newBadges.push("50H");
    }

    // 100H
    if ((+this.timeTotal >= 100) && !this.findBadgeById("100H").length ) {
      console.log(`Awarding 100H`)
      newBadges.push("100H");
    }

    // Równowaga
    if ((+this.technika >= 20) && (+this.sluch >= 20) && (+this.teoria >= 20)
      && (+this.technika == +this.sluch) && (+this.sluch == +this.teoria)
      && !this.findBadgeById("Równowaga").length) {
      console.log(`Awarding Równowaga`)
      newBadges.push("Równowaga");
    }

    // Mądrala
    const theoryBadge = await this.checkTheoryMasterAward(db, newReport);

    // Siłacz
    const technicalBadge = await this.checkTechnicalMasterAward(db, newReport);

    return new Promise(resolve => {
      resolve(newBadges.concat(theoryBadge).concat(technicalBadge))
    });
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
    let users = [];
    const usersQuery = await db.collection('results').orderBy(sortby, 'desc').limit(10).get();

    if (usersQuery.empty) {
      throw 'NoUserException';
    }

    usersQuery.forEach((userFound) => {
      const user = User.fromFirebaseDoc(userFound);
      users.push(user);
    });

    return new Promise((resolve) => {
      resolve(users)
    });
  }

  async checkTheoryMasterAward(db, newReport, points = 50) {
    const badgeName = 'Mądrala';
    const newBadges = [];
    const theoryMasterQuery = await db.collectionGroup('badges').where("name", '==', badgeName).get();

    if (theoryMasterQuery.empty && ((+this.teoria + newReport.teoria) >= 50) && !this.findBadgeById(badgeName).length) {
      newBadges.push(badgeName);
    }

    return new Promise(resolve => {
      resolve(newBadges)
    });
  }

  async checkTechnicalMasterAward(db, newReport, points = 50) {
    const badgeName = 'Siłacz';
    const newBadges = [];
    const technicalMasterQuery = await db.collectionGroup('badges').where("name", '==', badgeName).get();

    if (technicalMasterQuery.empty && ((+this.technika + newReport.technika) >= 50) && !this.findBadgeById(badgeName).length) {
      newBadges.push(badgeName);
    }

    return new Promise(resolve => {
      resolve(newBadges)
    });
  }
}

module.exports = User;