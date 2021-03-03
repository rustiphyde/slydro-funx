const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { db, admin } = require("./util/admin");

const {
    signup
} = require("./handlers/slyders");

// Slyder routes
app.post("/signup", signup);

exports.api = functions.https.onRequest(app);


