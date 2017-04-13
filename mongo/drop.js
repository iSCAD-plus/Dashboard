/* eslint-disable no-undef */
if (db.getCollectionNames().indexOf('decisionDatabase') >= 0) {
  db.decisionDatabase.drop();
}
