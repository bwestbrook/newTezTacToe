<script>
import * as Three from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: 'gameGrid',
  data() {
    return {
      width: 10,
      rotate: false,
      playX: 0,
      playY: 0,
      clickX: 0,
      clickY: 0,
      cameraX: 0,
      cameraY: 0,
      moveMade: false,
      playerColor: 'red',
      player1Plays: {},
      player2Plays: {}
    }
  },
  props: ['windowWidth', 'windowHeight'],
  mounted() {
    this.camera.position.x = 2;
    this.camera.position.y = 0.5;
    this.camera.position.z = 2;
    this.camera.lookAt(this.scene.position)
    this.$refs.container.appendChild(this.renderer.domElement);
    this.renderer.render(this.scene, this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.animate()
    this.width = this.windowWidth * 0.65
    //this.updateGrid()
    //this.highlightConnections() 
  },
  created () {
    let intvl = 0.3
    this.defaultMaterial = new Three.MeshNormalMaterial(  );
    this.camera = new Three.PerspectiveCamera(45, 1, 0.5, 10);
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.windowWidth * 0.65, this.windowWidth  * 0.65)
    let i = -1
    const board = new Three.Group()
    for (i; i < 3; i++) {
        let j = -1
        for (j; j < 3; j++) {
            let k = -1
            for (k; k < 3; k++) {
                let vertex;
                this.defaultGeometry = new Three.SphereGeometry(0.05, 32, 16)
                //let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2)
                vertex = new Three.Mesh(this.defaultGeometry, this.defaultMaterial);  
                vertex.position.set(i * intvl - 0.5 * intvl, j * intvl - 0.5 * intvl, k * intvl - 0.5 * intvl);
                board.add(vertex)
            }
        }
    }
    this.scene.add(board)
  },
  methods: {
    animate: function() {
      this.controls.update();
      requestAnimationFrame(this.animate);  
      this.renderer.render(this.scene, this.camera);
    },
    checkClickDown: function(evt) {
      this.rotate = true
      this.clickX = evt.x
      this.clickY = evt.y 
      this.playX = evt.x
      this.playY = evt.y   
    },
    checkClickUp: function(evt) {
      this.rotate = false
      if (this.playX === evt.x && this.playY === evt.y) {
        this.makeMove(evt)
      }
    },
    submitMove: function() {
      console.log(this.move)
      if (this.playerColor === 'red') {
        this.playerColor = 'blue'
      } else {
        this.playerColor = 'red'
      }
    },
    findIntersects: function(evt) {     
      if (this.mouseDown) {
          return [];
      }
      let intersects = []
      const raycaster = new Three.Raycaster();
      const pointer = new Three.Vector2();
      pointer.x =   ((evt.offsetX) / this.rendererWidth ) * 2 - 1;
      pointer.y =   (-1 * ((evt.offsetY) / this.rendererWidth ) * 2) + 1;
      raycaster.setFromCamera( pointer, this.camera );
      intersects = raycaster.intersectObjects(this.scene.children)
      return intersects
    },
    deHighlightGrid: function() {
      let i = 1
      for (i; i < 5; i++) {
        let j = 1
        for (j; j < 5; j++) {
          let k = 1
          for (k; k < 5; k++) {
            console.log(this.gameGrid)
            if (this.gameGrid[i][j][k] < 0) {
              this.socket.emit("updateGameGrid", this.gameGrid, [i, j, k], 0, this.activeGameId)
            }  
          }
        }
      }
    },
    highlightMove: function(evt) {
      ///if (!this.gameData.gameDisabled) {
        //return;
      //}
      //if (this.gameData.activeWallet != this.gameData.addressesInGame[this.gameData.activePlayer - 1]){
        //return;
      //} 
      
      const intersects = this.findIntersects(evt)
      this.deHighlightGrid()
      if (intersects.length > 0) {
        const clickedVertex = intersects[0]
        if (clickedVertex.object.owner === 0) {
            clickedVertex.object.owner = 3
            this.coords = clickedVertex.object.coords
            let tempOwner = 0
            console.log(this.gameData)
            if (Number(this.gameData.activePlayer) == 1) {
              tempOwner = -1
            } else if (Number(this.gameData.activePlayer) == 2) {
              tempOwner = -2
            }
            this.gameGrid[this.coords[0]][this.coords[1]][this.coords[2]] = tempOwner
            this.socket.emit("updateGameGrid", this.gameGrid, this.coords, tempOwner, this.activeGameId)
        }
      }
    },
    makeMove: function(evt) {
      //requestAnimationFrame(this.movePlayGrid);
      let intersects = []
      this.clickX = evt.x 
      this.clickY = evt.y
      const raycaster = new Three.Raycaster();
      const pointer = new Three.Vector2();
      pointer.x =   ((evt.x - 100) / this.windowWidth * 0.65) * 2 - 1;
      pointer.y = - ((evt.y - 100) / this.windowWidth * 0.65) * 2 + 1;
      raycaster.setFromCamera( pointer, this.camera );
      //this.scene.add(new Three.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) );
      intersects = raycaster.intersectObjects(this.scene.children)
      if (intersects.length > 0 && !this.moveMade) { 
        const clickedVertex = intersects[0]
        let new_geometry = new Three.BoxGeometry(0.1, 0.1, 0.1)
        let new_material = new Three.MeshBasicMaterial( {color: this.playerColor, transparent: true, opacity: 0.5} );
        clickedVertex.object.material = new_material
        clickedVertex.object.geometry = new_geometry
        this.renderer.render(this.scene, this.camera);
        this.moveMade = true
        this.move = clickedVertex.object.position
      } else if (this.moveMade) {
        const clickedVertex = intersects[0]
        if (clickedVertex && clickedVertex.object.geometry != this.defaultGeometry) {
          clickedVertex.object.geometry = this.defaultGeometry
          clickedVertex.object.material = this.defaultMaterial
          this.moveMade = false
          this.move = []
        }
      }
    },
    resizeGame: function() {
      this.camera.aspect = this.window.innerWidth / this.window.innerHeight;    
      this.camera.updateProjectionMatrix();
      //this.renderer.setSize(this.windowWidth * 0.65, this.windowWidth  * 0.65)
    }
  }
}
</script>


<template>
  <div class="canvas-container">     
      <div class="gameBox"
          @mousedown="checkClickDown"
          @mouseup="checkClickUp"   
          ref="container"
      >
      </div>
  </div>
</template>


<style scoped>
.gameContainer {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  border-style: inset;
  border: 5px;
  color: aliceblue;
  background-color: #000000;
  font-size: 20px;
}
.canvas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-style: inset;
  border-radius: 2px;
  border-width: 5px;
  border-color: #fff;
}
.actionButton {
    justify-content: center;
    padding: 5px;
    margin: auto;
    border-style: inset;
    border-radius: 2px;
    border-width: 5px;
    color: #fff;
    border-color: #fff;
}
.gameBox {
    justify-content: center;
    padding: 5px;
    margin: 5px;
    border-style: solid;
    border-radius: 2px;
    border-width: 0px;
    color: #fff;
    border-color: #fff;
}
</style>