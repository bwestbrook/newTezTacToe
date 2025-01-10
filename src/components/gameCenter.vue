<template>
    <div class="gameCenter">
        <div class="activePlayer"> Player 2 </div>
    </div>
</template>

<script>
import { CONTRACT_ADDRESS } from '@/constants.js'
//import { reduceAddress } from '../services/utilities.js'
import { getContractStorageService } from '../services/tezos-services.js'


export default {
    name: "gameCenter",
    data () {
        return {
            activeAddress: '',
        }
    },
    props: [
            "wallet"
        ],
    methods: {
        async getContractStorage(address) {
            const contract = await getContractStorageService(address);   
            this.contract = contract
        },
        
        async init() {
            await this.getContractStorage(CONTRACT_ADDRESS)
            this.games = this.contract.games                            
        }
    },
    created() {
      //this.init();
    }
}
</script>

<style>
.gameCenter{
    display: flex;
    align-content: center;
    justify-items: center;
}
.activePlayer{
    display: flex;
    padding: 5px;
    margin: 5px;

}

</style>
