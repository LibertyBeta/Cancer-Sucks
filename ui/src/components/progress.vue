<template lang="html">

  <v-progress-circular
  class="progressor"
      v-bind:size="200"
      v-bind:width="25"
      v-bind:rotate="180"
      v-bind:value="progress"
      color="pink">
     {{progress}}%
    </v-progress-circular>

</template>

<script lang="js">
  import { mapGetters } from 'vuex';

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
      ...mapGetters({
        progress: 'team/progress',
      }),
    },
};
</script>

<style scoped lang="scss">
.progressor {

}
</style>
