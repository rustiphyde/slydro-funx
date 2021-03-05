const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { db, admin } = require("./util/admin");

const {
    signup,
    login,
    resetPassword
} = require("./handlers/slyders");

const {
    getAllSlydeshows,
    getSlydeshow,
    createNewSlydeshow,
    addNewSlyde,
    getAllSlydes
} = require("./handlers/slydeshows");

// Slyder routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/reset", resetPassword);

// Slydeshow routes
app.get("/slydeshows", getAllSlydeshows);
app.get("/show/:showId", getSlydeshow);
app.post("/show", FBAuth, createNewSlydeshow);
app.post("/show/:showId/slyde", FBAuth, addNewSlyde)
app.get("/slydes/:showId", getAllSlydes);

exports.api = functions.https.onRequest(app);


