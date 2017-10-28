const TwitchBot = require('twitch-bot');
const admin = require('firebase-admin');

process.stdout.write('Setting Up Firebase\n');
const serviceAccount = require('./cancer-sucks');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cancer-sucks.firebaseio.com"
});
process.stdout.write('Getting Marvin setup....\n');
let marvin = null;
admin.database().ref('twitchAuth').on("value", (snapshot) => {
    process.stdout.write('Got a bit of data\n');
    if (snapshot.val() === null) {
        admin.database().ref('/bot/status').set('online');
        process.stdout.write("Marvin Can't Startup. No Auth Toke\nn")
    } else {
        if (marvin) {
            admin.database().ref('/bot/status').set('online');
            process.stdout.write("Killing the OLD marvin\ne")
            marvin.close();
            marvin = {};
        }
        process.stdout.write('Starting Up Marvin\n');

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
            process.stdout.write(`Error Found: ${err}`)

        })
        marvin.on('close', err => {
            clearInterval(interval);
            admin.database().ref('/bot/status').set('offline');
            process.stdout.write(`Error Found: ${err}`)
        })
    }
    //   res.
})

admin.database().ref('bot/que/')
    .on('value', (snapshot) => {
        const delta = snapshot.val();
        if (delta !== null) {
            process.stdout.write(`${Object.keys(delta).length} messages in marvin's que\n`);
            const top = delta[Object.keys(delta)[0]];
            marvin.say(top);
            admin.database().ref(`/bot/que/${Object.keys(delta)[0]}`).remove();
        }
    })
