import * as firebase from 'firebase';

import config from '@/firebase-config.json';

const app = firebase.initializeApp(config);


export default app;

