import fb from '../firebase';
import Store from '../index';


let ref = {};
const makeRef = () => {
  ref = fb.database().ref('/settings');
  ref.on('value', (snapshot) => {
    // console.log(snapshot);
    Store.commit('settings/load', snapshot.val());
  });
};
// initial state
// shape: [{ id, quantity }]
const state = {
  start: '2017-12-29',
  title: 'Loading...',
  blerb: 'Loading...',
  channel: 'LibertyBeta',
};

// getters
const getters = {
  start: state => state.start,
  title: state => state.title,
  blerb: state => state.blerb,
  channel: state => state.channel,
};

// actions
const actions = {
  init() {
    makeRef();
  },
};

/* eslint-disable no-param-reassign */
// mutations
const mutations = {
  load(state, snapshot) {
    if (snapshot.team) {
      const id = snapshot.team;
      Store.dispatch('team/initDetails', id);
    }
    state.start = snapshot.start;
    state.title = snapshot.title;
    state.blerb = snapshot.blerb;
    state.channel = snapshot.channel;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
