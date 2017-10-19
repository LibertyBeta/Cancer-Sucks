const cors = require('cors')({ origin: true });
const TwitchApi = require('twitch-api');
const TwitchBot = require('twitch-bot');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { getInfo, getTeam, getProgress } = require('./helpers');
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
                console.log("1",body);
                console.log("2",body.toString());
                // console.log(JSON.parse(body.toString()))
                if(body.access_token){
                    admin.database().ref('/twitchAuth').set(body);
                    res.status(200).send('SAVED!');
                } else {
                    res.status(503).send('no save!');
                }
                
                
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

exports.fetchlife = functions.https.onRequest((req, res) => {
    if (req.method !== 'GET') {
        res.status(403).send('Forbidden!');
    }
    cors(req, res, () => {
        admin.database().ref('/members').once("value", (snapshot) => {
            const members = snapshot.val();
            for (const member in members) {
                getInfo(member);
            }
            res.status(200).send('online');
        })
    })
})

exports.joinMember = functions.database.ref('/member/{person}')
    .onCreate((snapshot) => {
        console.log(` Getting ${snapshot.params.person}`)
        return getInfo(snapshot.params.person);
        // return true;
    })

exports.checkMessage = functions.database.ref('/log/{element}/message/')
    .onCreate((snapshot) => {
        console.log('Checking if message has new info');
        //Check if the message contains a key
        const message = snapshot.data.val().split(" ");
        const dictionary = ['donate', 'donated', '!donate', 'give', 'gave']
        
        if(message.filter((e)=>{dictionary.indexOf(e.toLower()) > -1}).length !== 0){
            return new Promise((res, rej)=>{
                admin.database().ref('/members').once('value', (snapshot)=>{
                    const people = Obect.keys(snapshot.val());
                    for(const person of people){
                        getProgress(person).then((data)=>{console.log(`${people} got`)})
                    }
                    res(true);
                })
            })
            
        }
        return true
        // console.log(` Getting ${snapshot.params.person}`)
        // return getInfo(snapshot.params.person);
        // return true;
    })

exports.fillTeam = functions.database.ref('/team/{team}')
    .onWrite((event)=>{
        const data = event.data.val();
        for(const person of data.members){
            admin.database().ref(`/member/${person.pID}`).once('value',(snapshot)=>{
                if(snapshot.val() === null){
                    admin.database().ref('/member').child(person.pID).set('empty');
                }
            })
        }
        return true;
    })
