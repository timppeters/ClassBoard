<template>
  <div class="board">
    <canvas id="main"></canvas>

    <div class="topbar">
      <div class="sandwich" v-on:click="showMenu = !showMenu" >
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </div>
      <div class="name">Tim</div>
      <div class="button">submit</div>
    </div>

    <transition name="slide-left">
      <div v-if="showMenu" id="menu">
        <div id="close"><img src="../assets/img/sidebar/close.svg" alt="" @click="showMenu = !showMenu"></div>
        <div id="title">Whiteboards</div>
        <div id="links">
          <div class="link selected">Questions</div>
          <div class="link">Working</div>
        </div>
        <div id="leave"><div>leave</div></div>
      </div>
    </transition>

    <div class="sidebar" id="sidebar-top">
      <div class="sidebar-button" id="undo"><img :src="require('../assets/img/sidebar/undo.svg')" alt=""></div>
    </div>
    <div class="sidebar" id="sidebar-bottom">
      <div class="sidebar-button" v-for="(value, key) in tools" :id='key' :key="key">
        <img :src="require('../assets/img/sidebar/'+key+'.svg')" v-bind:class="{selected : selectedTool==key}" v-on:click="selectedTool=key" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import {fabric} from 'fabric';
//import initiateCanvas from '../assets/whiteboard_helper.js';

export default {
  name: 'board',
  props: {
    msg: String
  },
  data() {
    return {
      showMenu: false,
      selectedTool: 'pen',
      tools: {
        select: {
          
        },
        pen: {
          size: 2,
          colour: 'black'
          
        },
        colour: {
          selected: 'black',
          colours: ['black', 'blue', 'red', 'orange', 'yellow', 'green', 'purple']
          
        },
        eraser: {
          type: 'stroke',
          size: 4
          
        },
        text: {
          
        },
        shape: {
          shapes: ['rectangle', 'line', 'triangle', 'star', 'circle']
          
        },
        extra: {
          extras: ['img']

        },
        delete: {

        }
      }
    }
  },
  methods: {
    initiateCanvas(id) {
      let canvas = new fabric.Canvas(id, {
          rotationCursor: 'pointer',
          backgroundVpt: false,
          //isDrawingMode: true,
          selectionFullyContained: true,
          width: window.innerWidth,
          height: window.innerHeight,
          stopContextMenu: true
        });
      canvas.freeDrawingBrush.width = 4;
  
      // Set default object settings
      fabric.Object.prototype.set({
          transparentCorners: false,
          cornerColor: 'black',
          borderColor: 'grey',
          cornerSize: 6,
          padding: 7,
          borderDashArray: [2, 2]
      });
  
      fabric.Path.prototype.set({
        hoverCursor: 'default',
        perPixelTargetFind: true
      });
    
      canvas.on('mouse:wheel', function(options) {
          let event = options.e;
          let delta = event.deltaY/300; // How much the mouse has scrolled divided by arbitrary '300' to decrease the zoom speed
          let zoom = canvas.getZoom() - delta;
          if (zoom > 20) {
              zoom = 20;
          } 
          if (zoom < 0.15) {
              zoom = 0.15;
          }
          canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);
          event.preventDefault();
          event.stopPropagation();
        });
  
      // When drawing, only use drawing cursor.
      fabric.util.addListener(canvas.upperCanvasEl, 'pointerover', e => {
        if (e.pointerType == 'pen' || e.pointerType == 'mouse') {
          if (canvas.getActiveObjects().length == 0) {
            fabric.Object.prototype.set({
              hoverCursor: 'default'
            });
          }
          else {
            fabric.Object.prototype.set({
              hoverCursor: 'move'
            });
          }
        }
      });
      
  
      // set up pointer event listeners to identify pen/mouse/touch
      fabric.util.addListener(canvas.upperCanvasEl, 'pointerdown', e => {
        if (e.pointerType == 'pen') {
          if (e.button == 0) { // Pen contact
            if (canvas.getActiveObjects().length == 0) {
              canvas.isDrawingMode = true;
              this.selectedTool = 'pen'; //-- switch to pen tool
              // add other tools
            }
          }
          else if (e.button == 5) { // eraser button/end of stylus
            //switch to eraser tool
          }
          else { // barrel button
            // Selection box -- switch to selection tool
          }
          
        }
        else if (e.pointerType == 'mouse') {
          if (!e.altKey) {
            if (this.selectedTool == 'pen') {
              canvas.discardActiveObject();
              canvas.isDrawingMode = true;
            } // add other tools
          }
          else {// alt key pressed
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY; 
          }
          
        }
        else { // touch (dragging)
          
          if (canvas.getActiveObjects().length == 0) { // Allow using touch to move selected items
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
          }
        }
      });
  
      fabric.util.addListener(canvas.upperCanvasEl, 'pointermove', e => {
        //fabric.PencilBrush._preapreForDrawing - add point with width value
        //fabric.Point.prototype add width properties
        //fabric.PencilBrush._captureDrawingPath - add point with width value
        //fabric.PencilBrush._render - stroke in for statement & ctx.strokeWidth = point.width
        //maybe fabric.PencilBrush.convertPointsToSVGPath add width
        // createPath && _finalizeAndAddPath
        
        if (e.pointerType == 'pen') {
          //if tool == eraser {
            // delete e.target object
          //}
          //send drawing command to socket
          //canvas.freeDrawingBrush.width = Math.round(e.pressure * 5);
        }
        else if (e.pointerType == 'mouse') {
          if (canvas.isDrawingMode) { 
            //send drawing command to socket
            // pen or eraser
          }
          if (e.altKey && canvas.isDragging) {
            canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
            canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
          }
        }
        else { // touch (dragging)
          if (canvas.isDragging) {
            canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
            canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
          }
        }
      });
  
      fabric.util.addListener(canvas.upperCanvasEl, 'pointerup', e => {

        if (e.pointerType == 'pen') {
          canvas.isDrawingMode = false;
          canvas.freeDrawingBrush.onMouseUp(); // Simulate mouse up event to end the path and convert it to an svg
        }
        else if (e.pointerType == 'mouse') {
          if (canvas.isDrawingMode) { 
            canvas.isDrawingMode = false;
            canvas.freeDrawingBrush.onMouseUp(); // Simulate mouse up event to end the path and convert it to an svg
          }
          if(canvas.isDragging) {
            canvas.isDragging = false;
            canvas.selection = true;
            canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
              obj.setCoords();
            });
          }
        }
        else { // touch (dragging)
          canvas.isDragging = false;
          canvas.selection = true;
          canvas.forEachObject(function(obj) { // reset the coner coordinates after panning so that objects are still selectable
            obj.setCoords();
          });
        }
      });
  
      
  
      let text = new fabric.IText('hello world', { left: 400, top: 400});
      let text2 = new fabric.IText('hello world2', { left: 620, top: 400});
  
      // Only let paths be selectable in a group (deselects them if they are selected by themselves)
      /*canvas.on('selection:created', e => {
        if (e.selected.length == 1) {
          if (canvas.getActiveObject().get('type') == 'path') {
            canvas.discardActiveObject(); 
          }
        } 
      });*/
      
    
      // Set up event listeners
    
      canvas.add(text);
      canvas.add(text2);
    }
  }/*,
  sockets: {

  }*/,
  mounted() {
    this.initiateCanvas('main');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.board {
  overflow: hidden;
  height: 100%;
  canvas {
    background: url('../assets/img/dot.svg') repeat;
    background-size: 36px 36px;
  }

  .topbar {
    position: absolute;
    top: 2rem;
    left: 1rem;
    display: grid;
    grid-template-columns: 1fr 5fr 5fr;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0px 1px 15px rgba(0,0,0,0.3);
    padding: 10px;

    div {
      margin: auto;
    }

    .sandwich {
      cursor: pointer;

      .bar1, .bar2, .bar3 {
        width: 35px;
        height: 5px;
        background-color: #707070;
        margin: 6px 0px 6px 6px;
        border-radius: 1rem;
      }
      
      
    }

    .name {
      font-size: 1.5rem;
      font-weight: 500;
      color: #707070;
      
    }

    .button {
      font-size: 1rem;
      padding: 10px 35px;
      background-color: #00B894;
      border-radius: 0.3rem;
      text-transform: uppercase;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: 0.1s ease;

      &:hover {
        background-color: darken(#00B894, 10%);
      }
    }
  }

  #menu {

    position: fixed;
    top: 0;
    display: grid;
    grid-template-rows: 1fr 1fr 8fr 1fr;
    grid-template-columns: 8fr 1fr;
    background-color: white;
    height: 100%;
    box-shadow: 0px 1px 15px rgba(0,0,0,0.3);
    padding: 0.2rem;

    #close {
      grid-row: 1/1;
      grid-column: 1/3;
      img {
        float: right;
        height: 25px;
        padding: 10px;
        border-radius: 0.5rem;
        cursor: pointer;
        color: #a7a7a7;
        background-color: white;
        transition: background-color 0.1s ease;

        &:hover {
          background-color: rgba(0,0,0,0.12);
        }
      }
    }

    #title {
      grid-row: 2/2;
      grid-column: 1/1;
      font-size: 1.5rem;
      padding: 0px 50px 10px 20px;
      margin-top: auto;
      text-align: left;
      border-bottom: 1px solid #a7a7a7;
      color: #707070;
      min-width: 250px;

    }

    #links {
      grid-row: 3/3;
      grid-column: 1/1;
      margin-top: 1rem;
      padding: 10px;

      .link {
        box-shadow: 0px 0px 0px 1px #a7a7a7;
        padding: 10px;
        font-size: 1.3rem;
        margin-top: 1rem;
        border-radius: 0.5rem;
        text-align: left;
        color: #707070;
        cursor: pointer;

        &.selected {
          box-shadow: 0px 0px 0px 2px #0984E3;
        }

      }
    }

    #leave {
      grid-row: 4/4;
      grid-column: 1/3;
      padding: 15px;

      div {
        font-size: 1.3rem;
        padding: 10px;
        border-radius: 0.5rem;
        color: white;
        cursor: pointer;
        text-transform: uppercase;
        background-color: #FF7675;
        transition: 0.1s ease;

        &:hover {
          background-color: darken(#FF7675, 10%);
        }

      }
    }
  }

  #sidebar-top {
    top: 6rem;
  }
  #sidebar-bottom {
    top: 12rem;
  }

  .sidebar {
    position: absolute;
    right: 3rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0px 1px 15px rgba(0,0,0,0.3);

    .sidebar-button {
      padding: 5px;


      img {
        height: 25px;
        padding: 10px;
        border-radius: 0.5rem;
        cursor: pointer;
        background-color: white;
        transition: background-color 0.1s ease;

        &.selected {
          background-color: rgba(0,0,0,0.12);
        }

        &:hover {
          background-color: rgba(0,0,0,0.12);
        }
      }
      
    }
  }
}

//transitions

.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter, .slide-left-leave-to {
  transform: translateX(-500px);
}

</style>
