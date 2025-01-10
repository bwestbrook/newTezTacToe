<template>
    <mainBody 
        :wallet="wallet" 
        :socket="socket"
        :windowWidth="windowWidth"
        :windowHeight="windowHeight"
    />
</template>

<script>
import { BeaconEvent } from "@airgap/beacon-sdk";
import { BeaconWallet } from '@taquito/beacon-wallet'
import { NetworkType } from "@airgap/beacon-types";
import io from 'socket.io-client'
import mainBody from "./components/mainBody.vue"


let globalWallet = undefined

export default {
  name: 'App',
  components: {
    mainBody
  },
  data () {
    return {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      wallet: this.wallet,
      socket: this.socket
    }
  },
  methods: {
    async getWallet() {
      console.log('getting', globalWallet)
      if (!globalWallet) {
          // Create a new BeaconWallet instance. The options will be passed to the DAppClient constructor.
          const wallet = new BeaconWallet({ 
              name: 'TezTacToe', network: {
              type: NetworkType.GHOSTNET
            }
          })           
          wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
              this.socket.emit("updateWallet")           
              console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
          })
          this.wallet = wallet
        } else {
          this.wallet = globalWallet
        }
      
      console.log(this.wallet, globalWallet)
      return globalWallet
    },
    async onResize() {
        this.socket.emit("resizeGame", window.innerWidth)
    }
    
  },
  created() {    
      //this.socket = io("https://damp-spire-29654-cc0ffbb43258.herokuapp.com:3000")
      this.socket = io("http://127.0.0.1:3000")
      this.getWallet()
  },
  mounted() {
      window.addEventListener('resize', () =>{
        this.onResize()
      })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  background-color:  #000000;
  margin-top: 0px;
}
</style>
