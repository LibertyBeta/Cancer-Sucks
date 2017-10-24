<template lang="html">

  <v-progress-circular
  class="progressor"
      v-bind:size="200"
      v-bind:width="25"
      v-bind:rotate="180"
      v-bind:value="99"
      color="pink"
    >
     50
    </v-progress-circular>

</template>

<script lang="js">
  export default {
    name: 'progress',
    props: [],
    mounted() {

    },
    data() {
      return {

      };
    },
    methods: {

    },
    computed: {

    },
};
</script>

<style scoped lang="scss">
.progressor {

}
</style>
