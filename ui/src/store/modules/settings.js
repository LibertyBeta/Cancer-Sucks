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
  name: 'Loading...',
  blerb: 'Loading...',
};

// getters
const getters = {
  start: state => state.start,
  name: state => state.name,
  blerb: state => state.blerb,
};

// actions
const actions = {
  init() {
    makeRef();
    // console.log(ref);
  },
};

/* eslint-disable no-param-reassign */
// mutations
const mutations = {
  load(state, snapshot) {
    console.log(snapshot);
    state.start = snapshot.start;
    state.name = snapshot.name;
    state.blerb = snapshot.blerb;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
