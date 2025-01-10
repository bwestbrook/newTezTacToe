<script>

import { reduceAddress } from '../utilities.js'
import { NetworkType } from "@airgap/beacon-types";
import { RemoteSigner } from '@taquito/remote-signer';
import { NODE_URL, CONTRACT_ADDRESS } from '../constants'
import { TezosToolkit } from '@taquito/taquito'
const Tezos = new TezosToolkit(NODE_URL);

export default {
    name: "playerControl",
    emits: [
        "submitMove",
        "createGameService"
    ],
    props: ["socket", "wallet"],
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
        },
        async submitMove() {
            this.socket.$emit("submitMove")
        },
        async createGameBC() {
            console.log('submit to Blockchain')
            const activeAccount = await this.wallet.client.getActiveAccount()   
            if (!activeAccount) {
                return
            }        
            const signer = new RemoteSigner(activeAccount.address, NODE_URL)
            Tezos.setProvider({
                signer: signer
            });
            Tezos.contract
                .at(CONTRACT_ADDRESS)
                .then((contract) => {
                    let params = {
                        mutezPerMove: 100,
                        player: activeAccount.address
                    }
                    return contract.methodsObject.startGame(params).send();
                })
                .then((op) => {
                    console.log(`Waiting for ${op.hash} to be confirmed...`);
                    return op.confirmation(1).then(() => op.hash);
                })
                .then((hash) => console.log(`Operation injected: https://ghost.tzstats.com/${hash}`))
                .catch((error) => console.log(`Error3: ${JSON.stringify(error, null, 2)}`));
            const balance = await Tezos.tz.getBalance(activeAccount.address)
            console.log('balance', balance.toNumber())
        },
        async createGame() {
            const activeAccount = await this.wallet.client.getActiveAccount()   
            if (!activeAccount) {
                return
            }       
            this.socket.emit("createGameServer")
        }
    },
    created() {
        console.log('creating plaery control')
        console.log(this.wallet)
        this.socket.on("createGameBC", () => {
            this.createGameBC()
            console.log("Received broadcast:");
       });
 
    }
}

</script>


<template>
    <div class="playerPanel" > 
        <div @click="toggleWallet" class="playerDataPanel">
                {{walletAddress}} 
        </div>
        <div class="actionButton"> 
            Join Game
        </div>
        <div class="actionButton" @click="createGameBC" > 
            Create Game
        </div>
     </div>
</template>


<style scoped>
.playerPanel {
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    background-color: #000000;
    color: #fff;

    padding: 5px;
}
.playerDataPanel {
    color: #fff;
    padding: 5px;
    margin: 5px;
    display: flex;
    align-content: center;
    justify-content: center;
    border-style: solid;
    border-radius: 2px;
    border-width: 0px;
    border-color: #fff;
}
.actionButton {
    justify-content: center;
    padding: 5px;
    margin: 5px;
    border-style: solid;
    border-radius: 2px;
    border-width: 1px;
    color: #fff;
    border-color: #fff;
}

</style>