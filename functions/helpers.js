const admin = require('firebase-admin');
const functions = require('firebase-functions');
const extraLife = require('extra-life-api');
// admin.initializeApp(functions.config().firebase);

const getProgress = (id) => {
    try {
        console.log(`FETCH Progress for ${id}`)
        extraLife.getRecentDonations(id, (data) => {
            admin.database().ref(`/member/${id}/donations`).set(data);
        });
    } catch (e) { }
}

exports.getProgress = getProgress;

exports.getInfo = (id) => {
    return new Promise((res, rej) => {
        console.log(`FETCH ${id}`)
        extraLife.getUserInfo(id, (data) => {
            console.log(`FETCHED ${id}`)
            admin.database().ref(`/member/${id}`).set(Object.assign(data, { donations: [] }));
            getProgress(id);
            //Now lets check if this team is in our firebase data yet. 
            if (data.teamID) {
                admin.database().ref(`/team/${data.teamID}`).once('value', (snapshot) => {
                    console.log(`FETCH TEAM ${data.teamID} with data of ${snapshot.val()}`)
                    getTeam(data.teamID);
                    res(true);
                })
            } else {
                res(true)
            }

        });
    })
}

const getTeam = (id) => {
    extraLife.getTeamInfo(id, (data) => {
        console.log(`got team ${id}`)
        admin.database().ref(`/team/${id}`).set(data);
    })
}

exports.getTeam = getTeam;