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
                slydeCount: doc.data().slydeCount,
                createdAt: doc.data().createdAt,
                addedTo: doc.data().addedTo,
                slyder: doc.data().slyder,
                email: doc.data().email,
                avatar: doc.data().avatar,
                splashCount: doc.data().splashCount,
                dripCount: doc.data().dripCount,
                sprayCount: doc.data().sprayCount
            }); 
        });
        return res.json(slydeshows);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
    });
};