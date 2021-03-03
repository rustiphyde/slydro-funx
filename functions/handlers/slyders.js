const { admin, db } = require("../util/admin");
const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
    validateSignupData
} = require("../util/validators");

// Signup user for Slydro account
exports.signup = (req, res) => {
    const newSlyder = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };

    const { valid, errors } = validateSignupData(newSlyder);

    if (!valid) return res.status(400).json(errors);

    const noImg = "No-slydro-pic.png";

    let token, userId;
    db.doc(`/Slyders/${newSlyder.email}`)
    .get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({
                email: "This email is already signed up"
            })
        } else {
            return firebase
            .auth()
            .createUserWithEmailAndPassword(newSlyder.email, newSlyder.password);
        }
    })
    .then(data => {
        userId = data.user.uid;
        return data.user.getIdToken(true);
    })
    .then(idToken => {
        token = idToken;
        const slyderCredentials = {
            firstName: newSlyder.firstName,
            lastName: newSlyder.lastName,
            email: newSlyder.email,
            createdAt: new Date().toISOString(),
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/$config.storageBucket}/o/${noImg}?alt=media`,
            userId,
        };
        return db.doc(`/Slyders/${newSlyder.email}`).set(slyderCredentials);
    })
    .then(() => {
        return res.status(201).json({ token });
    })
    .catch(err => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
            return res.status(400).json({ email: "Email is already in use" });
        } else {
            return res
                .status(500)
                .json({ general: "Something went wrong, please try again" });
        }
    });
}