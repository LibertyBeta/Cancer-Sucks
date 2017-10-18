const cors = require('cors')({ origin: true });
const TwitchApi = require('twitch-api');
const TwitchBot = require('twitch-bot');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


const twitchJSON = require('./twitch.json');

const twitch = new TwitchApi(twitchJSON);

let marvin = {};

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

                admin.database().ref('/twitchAuth').set(String(body));
                res.status(200).send('SAVED!');
            }
        });


    })
})

exports.botUp = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }
    // [END sendError]

    // [START usingMiddleware]
    // Enable CORS using the `cors` express middleware.
    cors(req, res, () => {
        admin.database().ref('/twitchAuth').once("value", (snapshot) => {
            console.log(`oauth:${snapshot.val()}`);
            marvin = new TwitchBot({
                username: 'LIBERTY_BOT',
                oauth: `oauth:${snapshot.val().access_token}`,
                channel: 'LibertyBeta'
            })

            marvin.on('join', () => {
                admin.database().ref('/bot/status').set('online');
                res.status(200).send('online');
                marvin.on('message', chatter => {
                    admin.database().ref('/log').push(chatter);
                    if (chatter.message === '!test') {
                        marvin.say('Command executed! PogChamp')
                    }
                })
                marvin.say('ALL SYSTEMS ONLINE');
            })
            marvin.on('error', err => {
                admin.database().ref('/bot/status').set('offline');
                console.log(err)
                res.status(200).send(err);
            })
            //   res.
        })


    })
})