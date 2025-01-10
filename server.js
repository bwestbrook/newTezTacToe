const { connect } = require('http2');
const { connected } = require('process');
const cors = require('cors')();
const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http ,
        {
  
        }
    )

let contractStorage = {};
let gameData = {};
let connectedUsers = []
let usersInGame = []
let addressesInGame = []

//const contractStorage = '../src/assets/contract-storage.json'

io.on("connection", function(socket) {

     // User Handling 
    console.log("user " + socket.id + " connected");
    idx = connectedUsers.length
    connectedUsers[idx] = (socket.id)
    io.emit("connectedUsers", connectedUsers)

    socket.on("disconnect", function() {
        let n = 0;
        for (n; n < connectedUsers.length; n++ ){
          const thisUser = connectedUsers[n]
          if (thisUser == socket.id) {
            connectedUsers.pop(n)
          }
        }
        console.log("user " + socket.id + " disconnected");
        io.emit("connectedUsers", connectedUsers)
    });

    socket.on("getUserId", function() {
      console.log("asking for userId (for a friend)", socket.id)
      io.emit("updateActiveUserId", socket.id)
    })

    socket.on("createGameServer", function() {
      //console.log(wallet)
      //let params = {}
      //const contract2 = await Tezos.wallet.at(CONTRACT_ADDRESS)
      //console.log(contract2)
      // contract2.methodsObject.startGame(address, mutezPerMove).send()
      console.log('game started?')
      io.emit("createGameBC")
    })

    socket.on("writeNewContractStorage", function(newContractStorage, gameGrid, gameId) {
      console.log('got signal IN SERVER to write new contract storage with')
      console.log(contractStorage)
      contractStorage = newContractStorage
      io.emit("contractStorage", contractStorage)
      io.emit("gameGrid", gameGrid, gameId)
    })


    socket.on("updateContractStorage", function() {
      io.emit("updateContractStorage")
    })


    socket.on("updateMoves", function(movesP1, movesP2) {
      gameData.movesP1 = movesP1
      gameData.movesP2 = movesP2
      io.emit("gameData", gameData)
    })

    socket.on("updateLastMove", function(lastMove) {
      gameData.lastMove = lastMove
      io.emit("gameData", gameData)
    })

    socket.on("updateMoveMade", function(moveMade) {
      gameData.moveMade = moveMade
      io.emit("gameData", gameData)
    })

    socket.on("updateGameBalance", function(gameBalance) {
      if (Number(gameBalance) > 0) {
          gameData.gameBalance = Number(gameBalance)
          io.emit("gameData", gameData)
      }
    })
    socket.on("updateGameId", function(gameId) {
      gameData.gameId = gameId
      io.emit("gameData", gameData)
    })

    socket.on("updatePlayerTurn", function(activePlayer) {
      gameData.activePlayer = activePlayer
      console.log('updating PT', activePlayer)
      io.emit("gameData", gameData)
    })

    socket.on("updateMoveMade", function(moveMade) {
      gameData.moveMade = moveMade
      io.emit("gameData", gameData)
    })

    socket.on("updateGameDisabled", function(gameDisabled) {
      gameData.gameDisabled = gameDisabled
      io.emit("gameData", gameData)
    })

    socket.on("updateGameStartable", function(gameStartable) {
      gameData.gameStartable = gameStartable
      io.emit("gameData", gameData)
    })

    socket.on("updateGameDataWithMove", function(activePlayer, moveMade, gameBalanceIncrement) {
        gameData.activePlayer = activePlayer
        gameData.moveMade = moveMade
        gameData.gameBalance += gameBalanceIncrement
        io.emit("gameData", gameData)
    });

    // Game Rendering and Handling
    socket.on("updateFromOtherPlayerView", function(cameraPos, gameId) {
        io.emit("updateCameraPos", cameraPos, gameId)
    });

    socket.on("lockGame", function(lockGame) {
      console.log("locking Game", lockGame)
      io.emit("lockGame", lockGame)
    })

    socket.on("submitMove", function() {
      io.emit("submitMove")
    }) 

    socket.on("disableGame", function(disableGame) {
      socket.emit("updateGameDisabled", disableGame)
      io.emit("lockGame", disableGame)
    });

    socket.on("updateGameStatus", function(gameStatus, socketId) {
      io.emit("updateGameStatus", gameStatus, socketId)
    });

    socket.on("updateConfirmationLink", function(hash, socketId) {
      const confirmationLink = 'https://jakartanet.tzstats.com/' + hash 
      io.emit("updateConfirmationLink", confirmationLink, socketId)
    });

    socket.on("checkingMakeMoveOperation", function() {
      socket.emit("updateGameDisabled", false)
      io.emit("lockGame", false)
    });

    socket.on("updateGameGrid", function(gameGrid, coords, owner, gameId) {
        if (!coords) {
          return;
        }
        if (coords.length == 3) {
            gameGrid[coords[0]][coords[1]][coords[2]] = owner  
        } 
        io.emit("gameGrid", gameGrid, gameId)
    });

    socket.on("initGameGrid", function(gameId) {
      gameData.gameBalance = 0
      usersInGame = []  
      addressesInGame = []
      gameGrid = {}
      let i = 1;
      for (i; i < 5; i++) {
          if (!gameGrid[i]) {
            gameGrid[i] = {}
          }
          let j = 1
          for (j; j < 5; j++) {
              if (!gameGrid[i][j]) {
                gameGrid[i][j] = {}
              }
              let k = 1
              for (k; k < 5; k++) {  
                  gameGrid[i][j][k] = 0
              }
          }
      }
      io.emit("gameGrid", gameGrid, gameId)
  });
   
});

io.listen(process.env.PORT || 3000)
console.log('SOCKET', 3000)
//http.listen(process.env.PORT || 3000, function() {
//});

