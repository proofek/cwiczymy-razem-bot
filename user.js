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
  pointsThisSeason = 0;

  report = [];
  badges = []

  constructor() {
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
    user.pointsThisSeason = (userDoc.get('pointsThisSeason') || 0);
    user.report = new Report();

    return user;
  }

  evalRank(punktySezon = null) {
    
    if (!punktySezon) {
      punktySezon = this.pointsThisSeason;
    }

    let rank = 1;
    if (punktySezon >= 6 && punktySezon < 12) {
      rank = 2;
    } else if (punktySezon >= 12 && punktySezon < 18) {
      rank = 3;
    } else if (punktySezon >= 18 && punktySezon < 24) {
      rank = 4;
    } else if (punktySezon >= 24 && punktySezon < 30) {
      rank = 5;
    } else if (punktySezon >= 30 && punktySezon < 36) {
      rank = 6;
    } else if (punktySezon >= 36 && punktySezon < 42) {
      rank = 7;
    } else if (punktySezon >= 42 && punktySezon < 48) {
      rank = 8;
    } else if (punktySezon >= 48 && punktySezon < 54) {
      rank = 9;
    } else if (punktySezon >= 54 && punktySezon < 60) {
      rank = 10;
    } else if (punktySezon >= 60 && punktySezon < 66) {
      rank = 11;
    } else if (punktySezon >= 66 && punktySezon < 72) {
      rank = 12;
    } else if (punktySezon >= 72 && punktySezon < 78) {
      rank = 13;
    } else if (punktySezon >= 78 && punktySezon < 84) {
      rank = 14;
    } else if (punktySezon >= 84 && punktySezon < 90) {
      rank = 15;
    } else if (punktySezon >= 90 && punktySezon < 96) {
      rank = 16;
    } else if (punktySezon >= 96 && punktySezon < 102) {
      rank = 17;
    } else if (punktySezon >= 102 && punktySezon < 108) {
      rank = 18;
    } else if (punktySezon >= 108 && punktySezon < 112) {
      rank = 19;
    } else if (punktySezon >= 112 && punktySezon < 118) {
      rank = 20;
    } else if (punktySezon >= 118 && punktySezon < 124) {
      rank = 21;
    } else if (punktySezon >= 124 && punktySezon < 130) {
      rank = 22;
    } else if (punktySezon >= 130 && punktySezon < 136) {
      rank = 23;
    } else if (punktySezon >= 136 && punktySezon < 140) {
      rank = 24;
    } else if (punktySezon >= 140 && punktySezon < 150) {
      rank = 25;
    } else if (punktySezon >= 150 && punktySezon < 160) {
      rank = 26;
    } else if (punktySezon >= 160 && punktySezon < 180) {
      rank = 27;
    } else if (punktySezon >= 180) {
      rank = 28;
    }

    return rank;
  }

  async addNewReport(db, admin, seasonId, reportDate, newReport, badgesAwarded) {

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
        pointsThisSeason: admin.firestore.FieldValue.increment(nowePunkty),
        level: this.evalRank(+this.pointsThisSeason + +nowePunkty)
      });

      badgesAwarded.forEach(async (badgeId) => {
        const badgeRef = resultRef.collection("badges").doc(badgeId);
        await t.set(badgeRef, {
          name: badgeId,
          dateAdded: Date.now(),
          dateRevoked: null,
          revoked: false
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
      level: this.evalRank(+this.pointsThisSeason + +nowePunkty)
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

    const badgeQuery = await db.collection('results').doc(this.id).collection("badges")
      .where("revoked", '==', false)
      .get();
    badgeQuery.forEach((badgeFound) => {
      badgesPromises.push(Badge.fetchBadge(db, badgeFound.id));
    });

    return Promise.all(badgesPromises).then((badges) => {
      badges.forEach((badge) => {
        this.addBadge(badge);
      });

    });
  }

  // Give user new badges if they earned it
  async awardNewBadges(db, admin, newReport) {
    let newBadges = [];
    const newTimeTotal = +this.timeTotal + +newReport.czas;
    const newPointsTechnical = +this.technika + +newReport.technika;
    const newPointsListening = +this.sluch + +newReport.sluch;
    const newPointsTheory = +this.teoria + +newReport.teoria;
    const newAdditionalPoints = +this.dodatkowePunkty + ((newReport.dokument) ? 1 : 0);
    const newTotalPoints = newPointsTechnical + newPointsListening + newPointsTheory + newAdditionalPoints;

    // Zaklinacz czasu
    if ((+newReport.czas >= 5) && !this.findBadgeById("Zaklinacz czasu").length ) {
      newBadges.push("Zaklinacz czasu");
    }
    
    // 50H
    if ((newTimeTotal >= 50) && !this.findBadgeById("50H").length ) {
      newBadges.push("50H");
    }

    // 100H
    if ((newTimeTotal >= 100) && !this.findBadgeById("100H").length ) {
      newBadges.push("100H");
    }

    // Równowaga
    if ((newPointsTechnical >= 20) && (newPointsListening >= 20) && (newPointsTheory >= 20)
      && (newPointsTechnical == newPointsListening) && (newPointsListening == newPointsTheory)
      && !this.findBadgeById("Równowaga").length) {
      newBadges.push("Równowaga");
    }

    // Diamentowa gitara
    if (this.evalRank(newTotalPoints) >= 28) {
      newBadges.push(Badge.BADGE_DIAMONDGUITAR);
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

  static async findUserWithLeaderAward(db) {
    const badgeName = 'Lider';
    let ownerRef = null;
    let owner = null;

    const leaderBadgeQuery = await db.collectionGroup('badges')
      .where("name", '==', badgeName)
      .where("revoked", '==', false)
      .get();

    leaderBadgeQuery.forEach((badgeFound) => {
      ownerRef = badgeFound.ref.parent.parent;
    });

    if (ownerRef) {
      const ownerFound = await ownerRef.get();
      owner = User.fromFirebaseDoc(ownerFound);
    }

    return new Promise(resolve => {
      resolve(owner)
    });
  }

  static async findUserWithStarAward(db) {
    let ownerRef = null;
    let owner = null;

    const starBadgeQuery = await db.collectionGroup('badges')
      .where("name", '==', Badge.BADGE_STAROFTHEWEEK)
      .where("revoked", '==', false)
      .get();

    starBadgeQuery.forEach((badgeFound) => {
      ownerRef = badgeFound.ref.parent.parent;
    });

    if (ownerRef) {
      const ownerFound = await ownerRef.get();
      owner = User.fromFirebaseDoc(ownerFound);
    }

    return new Promise(resolve => {
      resolve(owner)
    });
  }

  async revokeBadge(db, badgeId) {
    const badgeRevoked = await db.collection('results').doc(this.id).collection("badges").doc(badgeId).update({
      revoked: true,
      dateRevoked: new Date()
    });

    console.log(badgeRevoked);
  }

  async awardBadge(db, badgeId) {
    const badgeAwarded = await db.collection('results').doc(this.id).collection("badges").doc(badgeId).set({
      name: badgeId,
      dateAdded: Date.now(),
      revoked: false,
      dateRevoked: null,
    });

    console.log(badgeAwarded);
  }

  static async findLeader(db) {
    let leader = null;

    // Znajdź aktualnego lidera
    const leaderQuery = await db.collection('results')
      .where('removed', '==', false)
      .orderBy("pointsThisSeason", "desc")
      .limit(1)
      .get();

    leaderQuery.forEach((leaderFound) => {
      leader = User.fromFirebaseDoc(leaderFound);
    });

    return new Promise(resolve => {
      resolve(leader)
    });
  }

  static async findStarOfTheWeek(db) {
    let starOfTheWeek = null;

    // Znajdź aktualnego lidera
    const starOfTheWeekQuery = await db.collection('results')
      .where('removed', '==', false)
      .orderBy("additionalPoints", "desc")
      .limit(1)
      .get();

    starOfTheWeekQuery.forEach((starFound) => {
      starOfTheWeek = User.fromFirebaseDoc(starFound);
    });

    return new Promise(resolve => {
      resolve(starOfTheWeek)
    });
  }

  static getDiscordUser(client, user) {
    const discordTag = user.discordTag.split('#');
    let discordUser = null;

    if (discordTag.length == 2) {
      discordUser = client.users.cache.find(user => (user.username === discordTag[0] && user.discriminator === discordTag[1]));
    } else {
      discordUser = user.discordTag;
    }

    return discordUser;
  }
}

module.exports = User;