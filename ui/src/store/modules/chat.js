import fb from '../firebase';
import Store from '../index';

let ref = {};
const makeRef = () => {
  ref = fb.database().ref('/log').limitToLast(5).orderByChild('tmi_sent_ts');
  ref.once('value', (snapshot) => {
    Store.commit('chat/load', snapshot.val());
  });
  ref.on('child_added', (data) => {
    Store.commit('chat/add', data.val());
  });
  ref.on('child_removed', (data) => {
    Store.commit('chat/delete', data.val());
  });
  ref.on('child_changed', (data) => {
    Store.commit('chat/update', data.val());
  });
};


const sorter = (a, b) => {
  if (a.tmi_sent_ts < b.tmi_sent_ts) return true;
  if (a.tmi_sent_ts > b.tmi_sent_ts) return false;
  return false;
};
// initial state
const state = {
  history: [
    {
      auth: 'system',
      message: 'No Mesasges from Twitch Loaded...',
    },
  ],
};

// getters
const getters = {
  history: state => state.history,
  message: state => state.history.map(e => e.message),
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
  load(stateSnapshot, snapshot) {
    state.history = Object.values(snapshot).sort(sorter);
  },
  add(stateSnapshot, snapshot) {
    if (stateSnapshot.history
      .some(x => (x.id === snapshot.id) && (x.tmi_sent_ts === snapshot.tmi_sent_ts))
    ) {
      Store.commit('chat/update', snapshot);
    } else {
      stateSnapshot.history.push(snapshot);
      state.history = stateSnapshot.history.sort(sorter);
    }
  },
  delete(stateSnapshot, element) {
    const jsoned = JSON.stringify(element);
    state.history = stateSnapshot.history.filter(e => JSON.stringify(e) !== jsoned).sort(sorter);
  },
  update(stateSnapshot, element) {
    const index = stateSnapshot.history
      .findIndex(x => (x.id === element.id) && (x.tmi_sent_ts === element.tmi_sent_ts));
    if (index !== -1) stateSnapshot.history[index] = element;
    state.history = stateSnapshot.history.sort(sorter);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
