<template lang="html">
  <v-data-table
    v-bind:headers="headers"
    :items="log"
    hide-actions
    hide-headers
    class="elevation-1 chat">
    <template slot="items" scope="props">
      <td class="text-xs-left message">
        <v-chip color="indigo" text-color="white">
          {{ props.item.display_name }}
        </v-chip>
        {{ props.item.message }}
      </td>
    </template>
  </v-data-table>
</template>

<script lang="js">

  import { mapGetters } from 'vuex';

  export default {
    name: 'chat',
    props: [],
    mounted() {
      this.$store.dispatch('chat/init');
    },
    data() {
      return {
        headers: [
          {
            text: 'User',
            align: 'left',
            sortable: false,
            value: 'display_name',
          },
          {
            text: 'message',
            align: 'right',
            sortable: false,
            value: 'message',
          },
        ],
      };
    },
    methods: {

    },
    computed: {
      ...mapGetters({
        log: 'chat/history',
        messages: 'chat/message',
      }),
    },
};
</script>

<style scoped lang="scss">
.chat {
  .user {
    width: 8rem;
    vertical-align: baseline;
    padding-top: 1rem;
  }
  .message {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
  }
}
</style>
