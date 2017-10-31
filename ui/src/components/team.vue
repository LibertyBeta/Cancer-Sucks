<template lang="html">
  <v-layout row wrap>
    <v-flex class="thing" md4 xs12 v-for="member in team">
      <v-progress-circular
        v-bind:size="size"
        v-bind:width="bar"
        v-bind:rotate="90"
        v-bind:value="(member.totalRaisedAmount /  member.fundraisingGoal) * 100"
        color="pink"
        class="mouseable"
        v-on:click="goTo(member.donateURL)">
        <v-avatar
          :size="avatarSize"
          class="grey lighten-4">
          <img v-bind:src=member.avatarImageURL alt="avatar">
        </v-avatar>
      </v-progress-circular>
    </v-flex>
  </v-layout>
</template>

<script lang="js">
  import { mapGetters } from 'vuex';
  
  export default {
    name: 'team',
    props: [],
    mounted() {
      this.$store.dispatch('team/init');
    },
    data() {
      return {
        size: 150,
        bar: 5,
        avatar: '15px',
      };
    },
    methods: {
      goTo(url) {
        window.open(url);
      },
    },
    computed: {
      ...mapGetters({
        team: 'team/list',
      }),
      avatarSize() {
        return `${this.size - (this.bar * 2.5)}px`;
      },
    },
};
</script>

<style scoped lang="scss">
  .mouseable{
    cursor: pointer;
  }
</style>
