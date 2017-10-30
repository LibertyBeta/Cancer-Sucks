<template lang="html">
<section>
  <v-data-table
    v-bind:headers="headers"
    :items="donations"
    hide-actions
    class="elevation-1 chat"
  >
    <template slot="items" scope="props">
      <td class="text-xs-left message">{{ ( new Date(props.item.createdOn)).toLocaleDateString() }}</td>
      <td class="text-xs-right">${{ props.item.donationAmount.toFixed(2) }}</td>
      <td class="text-xs-left message">{{ props.item.message }}</td>
    </template>
  </v-data-table>
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
            text: 'When',
            align: 'left',
            sortable: false,
            value: 'createdOn',
          },
          {
            text: 'Amount',
            align: 'right',
            sortable: false,
            value: 'donationAmount',
          },
          {
            text: 'Message',
            align: 'left',
            sortable: false,
            value: 'Message',
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
