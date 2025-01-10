<template>
  <mainBody :wallet="wallet" :socket="socket"/>
</template>

<script>
import { BeaconWallet } from '@taquito/beacon-wallet'
import { NetworkType } from "@airgap/beacon-types";
import io from 'socket.io-client'
import mainBody from "./components/mainBody.vue"
//import { PORT } from '../constants.js'

let globalWallet = undefined
//let wallet = undefined

export default {
  name: 'App',
  components: {
    mainBody
  },
  data () {
    return {
      wallet: this.wallet,
      socket: this.socket
    }
  },
  methods: {
    async getWallet() {
      if (!globalWallet) {
          // Create a new BeaconWallet instance. The options will be passed to the DAppClient constructor.
          const wallet = new BeaconWallet({ 
              name: 'TezTacToe', network: {
              type: NetworkType.GHOSTNET
            }
          })   
          globalWallet = wallet
          this.wallet = globalWallet
        }
      return {        
        wallet: globalWallet
      }
    }
  },
  created() {    
    this.socket = io("http://127.0.0.1:3000")
    this.getWallet()
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
