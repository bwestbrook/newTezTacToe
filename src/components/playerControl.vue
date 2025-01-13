<script>
import { RemoteSigner } from '@taquito/remote-signer';
import { NODE_URL, CONTRACT_ADDRESS } from '../constants'

export default {
    name: "playerControl",
    emits: [
        "submitMove",
        "createGameService"
    ],
    props: ["socket", "wallet", "tezos", "walletAddress"],
    data () {
        return {
            activeGameId: 0        
        }
    },
    created() {
        this.socket.emit("updateActiveGame", this.activeGameId)
    },
    methods: {
        async toggleWallet(){
            const activeAccount = await this.wallet.client.getActiveAccount()              
            if (activeAccount) {                  
                await this.wallet.clearActiveAccount()           
            } else {
                await this.wallet.client.requestPermissions()
                this.tezos.setWalletProvider(this.wallet)
            }
        },
        async createGameBC() {            
            const activeAccount = await this.wallet.client.getActiveAccount()   
            if (!activeAccount) {
                return
            }    
            const signer = new RemoteSigner(activeAccount.address, NODE_URL )
            await this.tezos.setProvider({signer:signer})
            await this.tezos.setWalletProvider(this.wallet)
            this.tezos.wallet
                .at(CONTRACT_ADDRESS)
                .then((contract) => {
                    return contract.methods.startGame(1000, activeAccount.address).send();
                })
                .then((op) => {
                    console.log(`Waiting for ${op.hash} to be confirmed...`);
                    return op.confirmation(1).then(() => op.hash);
                })
                .then((hash) => console.log(`Operation injected: https://ghost.tzstats.com/${hash}`))
                .catch((error) => console.log(`Error3: ${JSON.stringify(error, null, 2)}`));
        },
        async joinGameBC() {            
            const activeAccount = await this.wallet.client.getActiveAccount()   
            if (!activeAccount) {
                return
            }    
            const signer = new RemoteSigner(activeAccount.address, NODE_URL )
            await this.tezos.setProvider({signer:signer})
            await this.tezos.setWalletProvider(this.wallet)
            const gameId = 0
            this.tezos.wallet
                .at(CONTRACT_ADDRESS)
                .then((contract) => {
                    return contract.methods.joinGame(gameId, activeAccount.address).send();
                })
                .then((op) => {
                    console.log(`Waiting for ${op.hash} to be confirmed...`);
                    return op.confirmation(1).then(() => op.hash);
                })
                .then((hash) => console.log(`Operation injected: https://ghost.tzstats.com/${hash}`))
                .catch((error) => console.log(`Error3: ${JSON.stringify(error, null, 2)}`));
        }
    }
}

</script>

<template>
    <div class="playerPanel" > 
        <div class="actionButton" @click="createGameBC" > 
            Create Game
        </div>
        <div class="actionButton" @click="joinGameBC"> 
            Join/Resume Game
        </div>
        <div class="actionButton" @click="submitMoveBC"> 
            Submit Move
        </div>
        <div class="actionButton" @click="toggleWallet">
                {{walletAddress}} 
        </div>
     </div>
     <div class="playerPanel" > 
        <div  > 
            My Games
        </div>
     </div>
     <div class="playerPanel" > 
        <div > 
            Pending Games
        </div>
     </div>
</template>


<style scoped>
.playerPanel {

    display: flex;
    align-content: center;
    flex-direction: row;
    justify-content: center;
    background-color: #000000;
    color: #fff;
    padding: 5px;
    border-style: inset;
    border-width: 5px;
    border-color: #fff;
}
.actionButton {
    display: flex;
    align-content: center;
    justify-content: center;
    padding: 5px;
    margin: auto;
    border-style: ridge;
    border-radius: 2px;
    border-width: 3px;
    color: #fff;
    border-color: #fff;
}

</style>