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
        admin.database().ref('/bot/status').set('offline');
        process.stdout.write("Marvin Can't Startup. No Auth Token\n")
    } else {
        if (marvin) {
            admin.database().ref('/bot/status').set('offline');
            process.stdout.write("Killing the OLD marvin\n")
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
                    if(snapshot.val() !== null){
                        marvin.say(snapshot.val());
                    }  
                })
            }, 900000);
            marvin.on('message', chatter => {

                //Push all Message to Firebase
                admin.database().ref('/log').push(chatter);

                //Set up Triggers

                //Test Triggers
                if (chatter.message === '!test') {
                    marvin.say('I\'m online! PogChamp')
                }

                //Donation Menu Trigger
                if (chatter.message === '!menu') {
                    admin.database().ref('/marvin/menu').once('value', (snapshot) => {
                        marvin.say(snapshot.val());
                    })
                }

                //Ask about our donations
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
            process.stdout.write(`Error Found: ${JSON.stringify(err)}\n`)

        })
        marvin.on('close', err => {
            clearInterval(interval);
            admin.database().ref('/bot/status').set('offline');
            process.stdout.write(`Error Found: ${JSON.stringify(err)}\n`)
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
