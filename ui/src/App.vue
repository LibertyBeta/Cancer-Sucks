<template>
  <v-app>
    <v-toolbar app>{{countdown}}</v-toolbar>
    <main>
      <v-content>
        <v-container grid-list-lg text-md-center>
          <v-layout row wrap>
            <v-flex xs12>
              <c-progress></c-progress>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <c-team></c-team>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <c-chat></c-chat>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex md6 xs12>
              <c-donations></c-donations>
            </v-flex>
            <v-flex md6 xs12>
              <c-menu></c-menu>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </main>
    <v-footer app></v-footer>
  </v-app>
</template>

<script>
import progress from './components/progress';
import donations from './components/donations';
import menu from './components/menu';
import team from './components/team';
import chat from './components/chat';


export default {
  name: 'app',
  data() {
    return {
      now: '...',
      countdown: '00:00:00:00',
      inerval: null,
    };
  },
  mounted() {
    this.$store.dispatch('settings/init');
    this.interval = setInterval(() => {
      this.now = new Date().toISOString();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  computed: {
    title() {
      return this.$store.state.settings.title;
    },
  },
  watch: {
    now() {
      const start = new Date(Date.parse(this.$store.state.settings.start)).getTime();
      const now = new Date().getTime();

      const diff = Math.abs(start - now);

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(diff / (1000 * 60 * 60 * 24));
      days = (days > 10 ? days : `0${days}`);
      let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      hours = (hours > 10 ? hours : `0${hours}`);
      let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      minutes = (minutes > 10 ? minutes : `0${minutes}`);
      let seconds = Math.floor((diff % (1000 * 60)) / 1000);
      seconds = (seconds > 10 ? seconds : `0${seconds}`);

      const dur = `${days} :  ${hours} : ${minutes} : ${seconds}`;
      if (start < now) {
        this.countdown = dur;
      } else {
        this.countdown = `-${dur}`;
      }
    },
  },
  components: {
    'c-progress': progress,
    'c-team': team,
    'c-menu': menu,
    'c-donations': donations,
    'c-chat': chat,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
