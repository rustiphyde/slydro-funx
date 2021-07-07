const { admin, db } = require("../util/admin");
const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
    validateSignupData, 
    validateLoginData,
    validateResetData
} = require("../util/validators");

// Signup user for Slydro account
exports.signup = (req, res) => {
    const newSlyder = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        alias: req.body.alias,
        slydetag: "$" + req.body.alias.replace(/\s/g, "-").toLowerCase()
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
            slydetag: newSlyder.slydetag,
            email: newSlyder.email,
            joined: new Date().toISOString(),
            avatar: `https://firebasestorage.googleapis.com/v0/b/$config.storageBucket}/o/${noImg}?alt=media`,
            userId,
        };
        return db.doc(`/Slyders/${newSlyder.slydetag}`).set(slyderCredentials);
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

// Login to Slydro

exports.login = (req, res) => {
	const slyder = {
		email: req.body.email,
		password: req.body.password
	};

	const { valid, errors } = validateLoginData(slyder);

	if (!valid) return res.status(400).json(errors);

	firebase
		.auth()
		.signInWithEmailAndPassword(slyder.email, slyder.password)
		.then(data => {
			return data.user.getIdToken();
		})
		.then(token => {
			return res.status(201).json({ token });
		})
		.catch(err => {
			console.error(err);
			return res
				.status(403)
				.json({ general: "Wrong credentials, please try again" });
		});
};

exports.getSlyderDetails = (req, res) => {
    let slyderData = {};
    db.doc(`/Slyders/${req.params.slydetag}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          slyderData.slyder = doc.data();
          return db
            .collection("Slydeshows")
            .where("email", "==", slyderData.slyder.email)
            .orderBy("createdAt", "desc")
            .get();
        } else {
          return res.status(404).json({ error: "Slyder not found" });
        }
      })
      .then(data => {
          slyderData.slydeshows = [];
          data.forEach(doc => {
                  slyderData.slydeshows.push({
                    showId: doc.id,
					showName: doc.data().showName,
					slydeCount: doc.data().slydeCount,
					createdAt: doc.data().createdAt,
					addedTo: doc.data().addedTo,
					slyder: doc.data().slyder,
					email: doc.data().email,
					avatar: doc.data().avatar,
					splashCount: doc.data().splashCount,
					dripCount: doc.data().dripCount,
					sprayCount: doc.data().sprayCount,
                  });
          });
        return res.json(slyderData);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  };

  // Get own user details
exports.getAuthenticatedSlyder = (req, res) => {
	let slyderData = {};
	db.doc(`/Slyders/${req.user.slydetag}`)
		.get()
		.then(doc => {
			if (doc.exists) {
				slyderData.credentials = doc.data();
				return db
					.collection("Splashes")
					.where("userSlydeTag", "==", req.user.slydetag)
					.get();
			}
		})
		.then(data => {
			slyderData.splashes = [];
			data.forEach(doc => {
				slyderData.splashes.push(doc.data());
			});
			
			return db
				.collection("Alerts")
				.where("recipient", "==", req.user.eslydetag)
				.orderBy("createdAt", "desc")
				.limit(16)
				.get();
		})
		.then(data => {
			slyderData.alerts = [];
			data.forEach(doc => {
				slyderData.alerts.push({
					recipient: doc.data().recipient,
					sender: doc.data().sender,
					createdAt: doc.data().createdAt,
					type: doc.data().type,
					read: doc.data().read,
					alertId: doc.id
				});
			});
			return res.json(slyderData);
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ error: err.code });
		});
};

exports.resetPassword = (req, res) => {
	const resUser = {
		email: req.body.email
	};

	const { valid, errors } = validateResetData(resUser);

	if (!valid) {
		return res.status(400).json(errors);
	} else {
		firebase
			.auth()
			.sendPasswordResetEmail(resUser.email)
			.then(() => {
				return res.status(201).json({
					message:
						"Your password reset email has been sent to the email address you provided"
				});
			})
			.catch(err => {
				if (err.code === "auth/user-not-found") {
					return res.status(404).json({
						reset: "The email you entered doesn't match any in our database"
					});
				} else {
					return res.status(500).json({ error: err.code });
				}
			});
	}
};