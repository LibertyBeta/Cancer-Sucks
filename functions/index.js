const cors = require('cors')({ origin: true });
const TwitchApi = require('twitch-api');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const language = require('@google-cloud/language');

const { getInfo, getTeam, getProgress } = require('./helpers');

admin.initializeApp(functions.config().firebase);


const twitchJSON = require('./twitch.json');

const twitch = new TwitchApi(twitchJSON);

// let marvin = {};

exports.authTwitch = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }
    // [END sendError]

    // [START usingMiddleware]
    // Enable CORS using the `cors` express middleware.
    cors(req, res, () => {
        res.redirect(twitch.getAuthorizationUrl());
    })
})


exports.token = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }
    // [END sendError]

    // [START usingMiddleware]
    // Enable CORS using the `cors` express middleware.
    cors(req, res, () => {
        twitch.getAccessToken(req.query.code, (err, body) => {
            if (err) {
                res.status(403).send(err);
            } else {
                console.log("1", body);
                console.log("2", body.toString());
                // console.log(JSON.parse(body.toString()))
                if (body.access_token) {
                    admin.database().ref('/twitchAuth').set(body);
                    res.status(200).send('SAVED!');
                } else {
                    res.status(503).send('no save!');
                }


            }
        });


    })
})


const cycler = (members) => {
    if (members.length === 0) {
        return Promise.resolve(true);
    } else {
        return getInfo(members[0])
            .then((result) => {
                members.shift()
                return cycler(members);
            });
    }
}

exports.fetchlife = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }
    cors(req, res, () => {
        admin.database().ref('/member').once("value", (snapshot) => {
            const raw = snapshot.val();
            if (raw) {
                console.log(JSON.stringify(raw));
                const members = Object.keys(raw);
                console.log(`Fetching ${JSON.stringify(members)}`);
                cycler(members)
                    .then((data) => {
                        res.status(200).send('online');
                    })
            }


        })
    })
})

exports.joinMember = functions.database.ref('/member/{person}')
    .onCreate((snapshot) => {
        console.log(` Getting ${snapshot.params.person}`)
        return getInfo(snapshot.params.person);
        // return true;
    })

exports.checkMessage = functions.database.ref('/log/{element}')
    .onCreate((event) => {
        if (event.data.val() === null /*&& snapshot.data.val().display_name === "LibertyBeta"*/) return true;

        const client = new language.LanguageServiceClient();
        //if this is a message to parse, build a Dictionary.
        const message = event.data.val().message.split(" ");

        //Fist..check if they gave!
        const gaveDict = ['donated', 'gave']

        if (message.filter((e) => { return gaveDict.indexOf(e.toLowerCase()) > -1 }).length !== 0) {
            admin.database().ref('/member').once('value', (snapshot) => {
                const people = Object.keys(snapshot.val());
                for (const person of people) {
                    getProgress(person);
                }
                res(true);
            })
            admin.database().ref('/bot/que').push('Did some one mention donations? I better go check...');
        }

        const giveDict = ['donate', 'give', 'give?', 'donate?'];

        if (message.filter((e) => { return giveDict.indexOf(e.toLowerCase()) > -1 }).length !== 0) {
            admin.database().ref('/bot/que').push(`Hi ${event.data.val().display_name}, I think you want to donate. Donate here: https://www.extra-life.org/index.cfm?fuseaction=donorDrive.team&teamID=35933`);
        }

        const hi = ['hi'];

        if (message.filter((e) => { return hi.indexOf(e.toLowerCase()) > -1 }).length !== 0) {
            admin.database().ref('/bot/que').push(`Hi ${event.data.val().display_name}`);
        }
        const document = {
            content: event.data.val().message,
            type: 'PLAIN_TEXT',
        };

        const ref = event.data.ref;
        return client
            .analyzeSentiment({ document: document })
            .then(results => {
                const sentiment = results[0].documentSentiment;
                if (sentiment.score < 0) {
                    return ref.remove();
                } else {
                    return true;
                }
            })
            .catch(err => {
                console.error('ERROR:', err);
            });


    })

exports.fillTeam = functions.database.ref('/team/{team}')
    .onWrite((event) => {
        const data = event.data.val();
        for (const person of data.members) {
            admin.database().ref(`/member/${person.pID}`).once('value', (snapshot) => {
                if (snapshot.val() === null) {
                    admin.database().ref('/member').child(person.pID).set('empty');
                }
            })
        }
        return true;
    })
