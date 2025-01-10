<script>
import * as Three from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: 'gameGrid',
  data() {
    return {
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
  methods: {
    init: function() {
        this.camera.position.x = 2;
        this.camera.position.y = 0.5;
        this.camera.position.z = 2;
        this.camera.lookAt(this.scene.position)
        console.log(this.renderer.domElement)
        this.$refs.container.appendChild(this.renderer.domElement);
       
        this.renderer.render(this.scene, this.camera);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.animate()
    },
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
    makeMove: function(evt) {
      //requestAnimationFrame(this.movePlayGrid);
      let intersects = []
      this.clickX = evt.x 
      this.clickY = evt.y
      const raycaster = new Three.Raycaster();
      const pointer = new Three.Vector2();
      pointer.x =   ((evt.x - 100) / this.gameSize ) * 2 - 1;
      pointer.y = - ((evt.y - 100) / this.gameSize ) * 2 + 1;
      console.log(evt.x, evt.y, evt.clientX, evt.clientY)
      console.log(pointer)
      raycaster.setFromCamera( pointer, this.camera );
      //this.scene.add(new Three.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) );
      intersects = raycaster.intersectObjects(this.scene.children)
      console.log(intersects)
      if (intersects.length > 0 && !this.moveMade) { 
        const clickedVertex = intersects[0]
        let new_geometry = new Three.BoxGeometry(0.1, 0.1, 0.1)
        let new_material = new Three.MeshBasicMaterial( {color: this.playerColor, transparent: true, opacity: 0.5} );
        clickedVertex.object.material = new_material
        clickedVertex.object.geometry = new_geometry
        this.renderer.render(this.scene, this.camera);
        console.log(clickedVertex)
        this.moveMade = true
        this.move = clickedVertex.object.position
      } else if (this.moveMade) {
        const clickedVertex = intersects[0]
        console.log('checking move', clickedVertex)
        if (clickedVertex && clickedVertex.object.geometry != this.defaultGeometry) {
          clickedVertex.object.geometry = this.defaultGeometry
          clickedVertex.object.material = this.defaultMaterial
          this.moveMade = false
          this.move = []
        }
      }
    },
    resizeGame: function() {
      console.log(this.camera.aspect)
      this.camera.aspect = window.innerWidth / window.innerHeight;
      console.log(this.camera.aspect)
      this.camera.updateProjectionMatrix();
      //this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  },
  mounted() {
      this.init();
      //this.$nextTick(() => {
        //window.addEventListener('resize', this.resizeGame);
      //})
    
  },
  created () {
    let intvl = 0.3
    this.defaultMaterial = new Three.MeshNormalMaterial(  );
    this.camera = new Three.PerspectiveCamera(45, 1, 0.5, 10);
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.windowWidth * 0.75, this.windowWidth  * 0.75)
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
  }
}
</script>


<template>
  <div class="canvas-container">     
    <div 
      @mousedown="checkClickDown"
      @mouseup="checkClickUp"
      ref="container"
    >
    </div>

  </div>
  <div class="actionButton" @click="createGameBC" > 
            Submit Move
  </div>
</template>


<style scoped>
.gameContainer {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  border-style: solid;
  border: 5px;
  color: aliceblue;
  background-color: #000000;
  font-size: 20px;
}
.gridContainer{
    width: 800px;
    height: 800px;
    background-color: #000000;
    padding: 0px;
    margin: 0px;
    display: flex;
    align-content: center;
    justify-content: center;
    justify-items: center;
}
.canvas-container {
    display: flex;
    align-items: center;
    justify-content: center;
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