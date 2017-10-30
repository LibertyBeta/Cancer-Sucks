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

const makeTeamDetails = (id) => {
  const teamRef = fb.database().ref(`/team/${id}`);
  teamRef.on('value', (snapshot) => {
    Store.commit('team/details', snapshot.val());
  });
};

// initial state
// shape: [{ id, quantity }]
const state = {
  list: {},
  details: {},
  array: [],
  progress: 0,
  donations: [],
};

// getters
const getters = {
  list: state => state.list,
  array: state => Object.values(state.list),
  details: state => state.details,
  progress: (state) => {
    if (state.details.totalRaisedAmount) {
      return (state.details.totalRaisedAmount / state.details.fundraisingGoal) * 100;
    }
    return 0;
  },
  donations: (state) => {
    if (state.list) {
      let compiled = [];
      for (const member of Object.values(state.list)) {
        if (member.donations) {
          compiled = compiled.concat(Object.values(member.donations));
        }
      }
      return compiled;
    }
    return [];
  },
};

// actions
const actions = {
  init() {
    makeRef();
  },
  initDetails(context, id) {
    makeTeamDetails(id);
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
  details(state, details) {
    state.details = details;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
