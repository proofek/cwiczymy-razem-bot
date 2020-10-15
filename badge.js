class Badge {

  id = null;
  description = null;
  removed = false;
  badge = null;
  discordEmoji = null;
  imgUrl = null;
  type = null;

  constructor() {
  }

  /**
   * Fetches a badge with given badgeId from firebase
   *
   * Returns a promise with a Badge object
   *
   * @param {admin.firestore.Firestore} db      A Firestore instance.
   * @param {int}                       badgeId Badge id.
   *
   * @return {Promise} A Badge object
   */
  static async fetchBadge(db, badgeId) {
    const badgeDoc = await db.collection('achievements').doc(badgeId).get();
    const badge = Badge.fromFirebaseDoc(badgeDoc);

    return new Promise((resolve) => {
      resolve(badge)
    });
  }

  /**
   * Returns a Badge object from firebase.firestore.DocumentSnapshot 
   *
   * @param {firebase.firestore.DocumentSnapshot} badgeDoc  Badge document snapshot.
   *
   * @return {Badge}
   */
  static fromFirebaseDoc(badgeDoc) {
    let badge = new Badge();
    badge.id = badgeDoc.id;
    badge.description = (badgeDoc.get('desc') || 'Brak opisu');
    badge.removed = badgeDoc.get('removed');
    badge.badge = (badgeDoc.get('badge') || 'Brak ikony odznaki');
    badge.discordEmoji = (badgeDoc.get('discordEmoji') || ':medal:');
    badge.type = (badgeDoc.get('type') || ':medal:');
    badge.imgUrl = (badgeDoc.get('imgUrl') || null);

    return badge;
  }

  /**
   * Returns a list of active badges
   *
   * @param {admin.firestore.Firestore} db      A Firestore instance.
   *
   * @return {Promise} Array of Badge objects
   */
  static async getBadges(db) {
    const badges = [];
    const badgesQuery = await db.collection('achievements').where('removed', '==', false).get();

    if (badgesQuery.empty) {
      throw 'NoBadgesException';
    }

    badgesQuery.forEach((badgeFound) => {
      const badge = Badge.fromFirebaseDoc(badgeFound);
      badges.push(badge);
    });

    return new Promise((resolve) => {
      resolve(badges)
    });
  }
}

module.exports = Badge;