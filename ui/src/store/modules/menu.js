import fb from '../firebase';
import Store from '../index';

let ref = {};
const makeRef = () => {
  ref = fb.database().ref('/menu');
  ref.once('value', (snapshot) => {
    // console.log(snapshot);
    Store.commit('menu/load', snapshot.val());
  });
  ref.on('child_added', (data) => {
    Store.commit('menu/add', { snapshot: data.val(), key: data.key });
  });
  ref.on('child_removed', (data) => {
    Store.commit('menu/delete', data.key);
  });
  ref.on('child_changed', (data) => {
    Store.commit('menu/update', { snapshot: data.val(), key: data.key });
  });
};
// initial state
// shape: [{ id, quantity }]
const state = {
  list: {},
  array: [],
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
    // console.log(ref);
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
