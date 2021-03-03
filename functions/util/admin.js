const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://slydro-2327.firebaseio.com",
  storageBucket: "slydro-2327.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };