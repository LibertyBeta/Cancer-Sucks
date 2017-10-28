<template lang="html">

  <section class="menu">
    <v-data-table
    v-bind:headers="headers"
    :items="menu"
    hide-actions
    class="elevation-1"
  >
    <template slot="items" scope="props">
      <td class="text-xs-left">{{ props.item.price }}</td>
      <td class="text-xs-left">{{ props.item.reward }}</td>
    </template>
  </v-data-table>
  </section>

</template>

<script lang="js">

  import { mapGetters } from 'vuex';

  export default {
    name: 'team',
    props: [],
    mounted() {
      this.$store.dispatch('menu/init');
    },
    data() {
      return {
        headers: [
          {
            text: 'Price',
            align: 'left',
            sortable: false,
            value: 'price',
          },
          {
            text: 'Reward',
            align: 'left',
            sortable: false,
            value: 'reward',
          },
        ],
      };
    },
    methods: {

    },
    computed: {
      ...mapGetters({
        menu: 'menu/array',
      }),

    },
};
</script>

<style scoped lang="scss">
  .menu {
    width: 100%;
  }
</style>
