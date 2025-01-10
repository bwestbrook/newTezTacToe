<template>
  <div @click="toggleWallet" class="ActivePlayer"> {{ walletAddress }} </div>
  <div class="titleBar"> "Welcome to TezTacToe" </div>
      <gameCenter 
          :wallet="wallet"/>
  <div class="gamePlayFlex">
      <playerControl 
          :socket="socket"
          :wallet="wallet"
      />
      <gameGrid />
      <playerControl
          :socket="socket"
          :wallet="wallet"
         />
  </div>
</template>



<script>
import { NetworkType } from "@airgap/beacon-types";
import gameCenter from "./gameCenter.vue"
import gameGrid from "./gameGrid.vue"
import playerControl from "./playerControl.vue"

import { reduceAddress } from '../utilities.js'


import { TezosToolkit } from '@taquito/taquito'
const NODE_URL = 'https://ghostnet.smartpy.io/'
const Tezos = new TezosToolkit(NODE_URL);


export default {
  name: 'HelloWorld',
  props: ['wallet', 'socket'],
  components: { 
        gameGrid,
        playerControl,
        gameCenter
  },
  data () {
    return {
      walletAddress: 'SYNC WALLET'
    }
  },
  methods: {
    async walletState() {
        console.log(this.wallet, 'do')
        const activeAccount = await this.wallet.client.getActiveAccount()   
        Tezos.setProvider(this.wallet)
        console.log(activeAccount)
        if (activeAccount) {
            const reducedAddress = await reduceAddress(activeAccount.address)         
            this.walletAddress = reducedAddress
        }
    },
    async toggleWallet(){
          console.log('toggle', this.wallet)
          const activeAccount = await this.wallet.client.getActiveAccount()              
          if (activeAccount) {               
              console.log('b', activeAccount.address, 'disconnecting')       
              await this.wallet.clearActiveAccount()
              this.walletAddress = 'SYNC WALLET'                 
          } else {
              console.log(NetworkType)
              console.log(this.wallet, 'requestPermissions')
              await this.wallet.client.requestPermissions()
          }
          this.walletState()
      }
  },
  created () {
    console.log('createing mB', this.socket)
    this.walletState()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
