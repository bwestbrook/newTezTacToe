<template>
  <div class="gamePlayFlex">     
      <playerControl 
          :socket="socket"
          :wallet="wallet"
      />
      <gameGrid
          :windowHeight="windowHeight"
          :windowWidth="windowWidth"
      />
  </div>
</template>

<script>

import gameGrid from "./gameGrid.vue"
import playerControl from "./playerControl.vue"

export default {
  name: 'HelloWorld',
  props: ['wallet', 'socket', 'windowWidth', 'windowHeight'],
  components: { 
        gameGrid,
        playerControl
  },
  data () {
    return {
     
    }
  },
  methods: {

  },
  created () {
    console.log('creating main body')
    console.log(this.wallet)
   
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
