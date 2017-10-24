import fb from '../firebase';
import Store from '../index';

let ref = {};
const makeRef = () => {
  ref = fb.database().ref('/member');
  ref.once('value', (snapshot) => {
    Store.commit('team/load', snapshot.val());
  });
  ref.on('child_added', (data) => {
    Store.commit('team/add', { snapshot: data.val(), key: data.key });
  });
  ref.on('child_removed', (data) => {
    Store.commit('team/delete', data.key);
  });
  ref.on('child_changed', (data) => {
    Store.commit('team/update', { snapshot: data.val(), key: data.key });
  });
};

// initial state
// shape: [{ id, quantity }]
const state = {
  list: {},
};

// getters
const getters = {
  list: state => state.list,
  array: state => Object.values(state.list),
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
    state.list = snapshot;
  },
  add(state, { snapshot, key }) {
    const temp = {};
    temp[key] = snapshot;
    state.list = { ...state.list, ...temp };
  },
  setCurrent(state, snapshot) {
    state.current = snapshot;
  },
  delete(state, key) {
    delete state.list[key];
    state.list = { ...state.list };
  },
  update(state, { snapshot, key }) {
    state.list[key] = snapshot;
    state.list = { ...state.list };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
