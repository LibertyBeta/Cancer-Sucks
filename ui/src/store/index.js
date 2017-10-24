import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import * as actions from './actions';
import * as getters from './getters';
import team from './modules/team';
import chat from './modules/chat';
import menu from './modules/menu';
import settings from './modules/settings';


Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  actions,
  getters,
  modules: {
    team,
    chat,
    menu,
    settings,
  },
  strict: debug,
  plugins: [createLogger()],
});

export default store;
