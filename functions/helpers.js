const admin = require('firebase-admin');
const functions = require('firebase-functions');
const extraLife = require('extra-life-api');
// admin.initializeApp(functions.config().firebase);

exports.getProgress = (id) => {
    extraLife.getRecentDonations(id, (data) => {
        admin.database().ref(`/members/${id}/donations`).set(data);
    });
}

exports.getInfo = (id) => {
    return new Promise((res, rej) => {
        extraLife.getUserInfo(id, (data) => {
            console.log(`FETCH ${id}`)
            admin.database().ref(`/member/${id}`).set(Object.assign(data, { donations: [] }));
            //Now lets check if this team is in our firebase data yet. 
            if (data.teamID) {
                admin.database().ref(`/team/${data.teamID}`).once('value', (snapshot) => {
                    console.log(`FETCH TEAM ${data.teamID} with data of ${snapshot.val()}`)
                    if (snapshot.val() === null) {
                        getTeam(data.teamID);
                    }
                    res(true);
                })
            } 
            res(true)
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