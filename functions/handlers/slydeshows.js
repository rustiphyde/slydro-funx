const { db, admin } = require("../util/admin");
const config = require("../util/config");

exports.getAllSlydeshows = (req, res) => {
	db.collection("Slydeshows")
		.orderBy("AddedTo", "desc")
		.get()
		.then((data) => {
			let slydeshows = [];
			data.forEach((doc) => {
				slydeshows.push({
					showId: doc.id,
					showName: doc.data().name,
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
			return res.json(slydeshows);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code });
		});
};

exports.getSlydeshow = (req, res) => {
	let showData = {};
	db.doc(`Slydeshows/${req.params.showId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(400).json({ error: "Slydeshow not found " });
			}
			showData = doc.data();
			showData.showId = doc.id;
			return db
				.doc(`Slydeshows/${req.params.showId}`)
				.collection("Slydes")
				.orderBy("slydeOrder", "asc")
				.get();
		})
		.then((data) => {
			showData.slydes = [];
			data.forEach((doc) => {
				showData.slydes.push(doc.data());
			});
			return res.json(showData);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code });
		});
};

exports.createNewSlydeshow = (req, res) => {
	if (req.body.showName.trim() === "")
		return res.status(400).json({
			name: "You must give your slydeshow a name",
		});

	const newShow = {
		showName: req.body.showName,
		slyder: req.user.firstName + " " + req.user.lastName,
		slydeCount: 0,
		splashCount: 0,
		dripCount: 0,
		sprayCount: 0,
		createdAt: new Date().toISOString(),
		addedTo: "",
		email: req.user.email,
		avatar: req.user.avatar,
	};

	db.collection("Slydeshows")
		.add(newShow)
		.then((doc) => {
			doc.update({ showId: doc.id });
			const resShow = newShow;
			resShow.showId = doc.id;
			res.json(resShow);
		})
		.catch((err) => {
			res.status(500).json({ error: err.code });
			console.error(err);
		});
};

exports.addNewSlyde = (req, res) => {
    if (req.body.slydeName.trim() === "")
		return res.status(400).json({
			name: "You must give your slyde a name",
		});
	const newSlyde = {
		pieceCount: 0,
		createdAt: new Date().toISOString(),
		showId: req.params.showId,
        slydeName: req.body.slydeName,
        email: req.user.email
	};
	db.doc(`Slydeshows/${req.params.showId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: "Slydeshow has been erased" });
			} else {
				newSlyde.slydeOrder = doc.data().slydeCount + 1;
				doc.ref.update({
					slydeCount: doc.data().slydeCount + 1,
					addedTo: new Date().toISOString(),
				});
			}
		})
		.then(() => {
			return db
				.doc(`/Slydeshows/${req.params.showId}`)
				.collection("Slydes")
				.add(newSlyde);
		})
		.then((doc) => {
            doc.ref.update({
                slydeId: doc.id
            })
            let resSlyde = newSlyde;
            resSlyde.slydeId = doc.id;
			res.json(resSlyde);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({ error: err.code });
		});
};
