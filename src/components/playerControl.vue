<template>
    <div class="playerPanel" >
        <div 
            class="playerDataPanel"
        >
         Player 
        </div>
        <div 
            class="actionButton"
        > 
            Surrender Game
        </div>
        <div @click="createGameBC"
            class="actionButton"
        > 
            Create Game
        </div>
     </div>
</template>

<script>
//import { CONTRACT_ADDRESS } from '@/constants.js'
//import { reduceAddress } from '../services/utilities.js'
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
    props: [
        "socket",
        "wallet"
    ],
    methods: {
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
                        mutezPerMove: [100,0],
                        player: activeAccount.address
                    }
                    //let inspect = contract.methodsObject.startGame(params)
                   
                    const parameterSchema = contract.methodsObject.startGame(params).parameterSchema;
                    
                    const paramsToSend = parameterSchema.EncodeObject(params)
                    console.log(paramsToSend)
                    return contract.methodsObject.startGame(paramsToSend).send();
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
            //this.socket.emit("createGameServer", activeAccount.address, 10)
            //this.socket.getUserId()
        }
    },
    created() {
        
        this.socket.on("createGameBC", () => {
            this.createGameBC()
            console.log("Received broadcast:");
       });
        
        //console.log(this.socket.emit('createGameServe', this.wallet))
    }
}

</script>


<style scoped>
.playerPanel {
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
    background-color: #333;
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