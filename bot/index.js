const TwitchBot = require('twitch-bot');
const admin = require('firebase-admin');



console.log('Setting Up Firebase');
const serviceAccount = require('./cancer-sucks');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cancer-sucks.firebaseio.com"
});
console.log('Getting Marvin setup....');
let marvin = null;
admin.database().ref('twitchAuth').on("value", (snapshot) => {
    console.log('Got a bit of data');
    if (snapshot.val() === null) {
        admin.database().ref('/bot/status').set('online');
        console.log("Marvin Can't Startup. No Auth Token")
    } else {
        if (marvin) {
            admin.database().ref('/bot/status').set('online');
            console.log("Killing the OLD marvine")
            marvin.close();
            marvin = {};
        }
        console.log('Starting Up Marvin');

        let interval = {};
        marvin = new TwitchBot({
            username: 'LIBERTY_BOT',
            oauth: `oauth:${snapshot.val().access_token}`,
            channel: 'LibertyBeta'
        })

        marvin.on('join', () => {
            admin.database().ref('/bot/status').set('online');

            interval = setInterval(() => {
                admin.database().ref('/marvin/shout').once('value', (snapshot) => {
                    marvin.say(snapshot.val());
                })
            }, 900000);
            marvin.on('message', chatter => {
                admin.database().ref('/log').push(chatter);
                if (chatter.message === '!test') {
                    marvin.say('I\'m online! PogChamp')
                }
                if (chatter.message === '!menu') {
                    admin.database().ref('/marvin/menu').once('value', (snapshot) => {
                        marvin.say(snapshot.val());
                    })
                }

                if (chatter.message === '!donations') {
                    marvin.say('Most recent donations are:')
                    admin.database().ref('/member').once('value', (snapshot) => {
                        const peoples = snapshot.val();
                        if (peoples === null) return;
                        for (const person of Object.values(peoples)) {
                            marvin.say(`${person.callName} has collected ${person.totalRaisedAmount}`)
                            if (person.donations) {
                                let message
                                for (const donation of person.donation) {
                                    marvin.say(`${donation.donorName} gave ${donation.donationAmount} and said ${message}`);
                                }
                            } else {
                                marvin.say(`But no donations on record!`);
                            }

                        }
                    })
                }
            })
            marvin.say('ALL SYSTEMS ONLINE');
        })
        marvin.on('error', err => {
            clearInterval(interval);
            admin.database().ref('/bot/status').set('offline');
            console.log(err)

        })
        marvin.on('close', err => {
            clearInterval(interval);
            admin.database().ref('/bot/status').set('offline');
            console.log(err)
        })
    }
    //   res.
})

admin.database().ref('bot/que/')
    .on('value', (snapshot) => {
        const delta = snapshot.val();
        console.log(delta);
        if (delta !== null) {
            console.log(`${Object.keys(delta).length} messages in marvin's que`);
            const top = delta[Object.keys(delta)[0]];
            marvin.say(top);
            admin.database().ref(`/bot/que/${Object.keys(delta)[0]}`).remove();
        }
    })
