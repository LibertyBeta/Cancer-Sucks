<template lang="html">
<section>
  <v-data-table
    v-bind:headers="headers"
    :items="donations"
    hide-actions
    class="elevation-1 chat"
  >
    <template slot="items" scope="props">
      <td class="text-xs-left user cyan lighten-3">{{ props.item.display_name }}</td>
      <td class="text-xs-left message">{{ props.item.message }}</td>
    </template>
  </v-data-table>
  {{donations}}
</section>
</template>

<script lang="js">
  import { mapGetters } from 'vuex';

  export default {
    name: 'donations',
    props: [],
    mounted() {
    },
    data() {
      return {
        headers: [
          {
            text: 'Amount',
            align: 'left',
            sortable: false,
            value: 'amount',
          },
          {
            text: 'When',
            align: 'right',
            sortable: false,
            value: 'timeshot',
          },
          {
            text: 'Message',
            align: 'right',
            sortable: false,
            value: 'Comment',
          },
        ],
      };
    },
    methods: {

    },
    computed: {
      ...mapGetters({
        donations: 'team/donations',
      }),
    },
};
</script>

<style scoped lang="scss">
  .donations {

  }
</style>
