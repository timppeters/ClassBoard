<template>
  <div class="whiteboard">
    <canvas :id="board"></canvas>

    <div class="sidebar" v-if="userType=='leader' || board=='working'" id="sidebar-top">
      <div class="sidebar-button" id="undo"><img :src="require('../assets/img/sidebar/undo.svg')" v-on:click="handleToolClick('undo')" ></div>
    </div>
    <div class="sidebar" v-if="userType=='leader' || board=='working'" id="sidebar-bottom">
      <div class="sidebar-button" v-for="(value, key) in tools" :id="key" :key="key">
        <img :src="require('../assets/img/sidebar/'+key+'.svg')" v-bind:class="{selected : selectedTool==key}" v-on:click="handleToolClick(key)" alt="">
      </div>
      <div class="sidebar-button-options" id="pen-options" v-if="tools.pen.showOptions">
        <div>{{this.tools.pen.size}}</div>
        <input type="range" min="1" max="20" value="4" class="slider" v-model="tools.pen.size">
      </div>
      <div class="sidebar-button-options" id="colour-options"  v-if="tools.colour.showOptions">
        <div class="colour" v-for="(value) in tools.colour.colours" :key="value">
          <input type="radio" name="colour" :value="value" :id="value+'-input'" :checked="tools.colour.selected==value" v-on:click="changeColour(value)">
          <label :for="value+'-input'"><span class="radio" :id="value"></span></label>
        </div>
      </div>
      <div class="sidebar-button-options" id="shape-options"  v-if="tools.shape.showOptions">
        <div class="shape" v-for="(value) in tools.shape.shapes" :key="value">
          <input type="radio" name="shape" :value="value" :id="value+'-input'" :checked="tools.shape.selected==value" v-on:click="changeShape(value)">
          <label :for="value+'-input'"><span class="radio" :id="value"></span></label>
        </div>
      </div>
      <div class="sidebar-button-options" id="extra-options"  v-if="tools.extra.showOptions">
        <input type="file" v-on:change="uploadImageToCanvas($event)">
      </div>
    </div>

  </div>
</template>

<script>
import {whiteboard_helper_interactive} from '../mixins/whiteboard_helper_interactive.js';
import {whiteboard_helper_static} from '../mixins/whiteboard_helper_static.js';

export default {
  name: 'whiteboard',
  mixins: [whiteboard_helper_interactive, whiteboard_helper_static],
  props: [
    'board',
    'userType',
    'nickname'
  ],
  data() {
    return {
      selectedTool: 'pen',
      tools: {
        select: {
          
        },
        pen: {
          size: 4,
          showOptions: false
        },
        colour: {
          selected: 'black',
          colours: ['black', 'blue', 'red', 'green', 'yellow', 'orange', 'purple'],
          //colours: ['#000000', '#065ea5', '#a50606', '#f77f00', '#f7de00', '#0c9627', '#8a0b96'], -- not in same order
          showOptions: false
          
        },
        eraser: {
          
        },
        text: {
          
        },
        shape: { 
          selected: 'rect',
          shapes: ['rect', 'line', 'triangle', 'circle'],
          showOptions: false
          
        },
        extra: {
          extras: ['img'],
          showOptions: false

        },
        delete: {

        }
      }
    }
  },
  methods: {

    handleToolClick(tool) {
      this.selectTool(tool);
      this.showToolOptions(tool);
      if (tool == 'delete') {
        this.deleteObjects();
      }
      else if (tool == 'undo') {
        if (this.userType == 'leader') {
          if (this.board == 'questions') {
            this.$socket.emit('undo', {userType:this.userType});
          }
          else {
            this.$socket.emit('undo', {userType:this.board});
          }
          
        }
        else{
          this.$socket.emit('undo', {userType:this.nickname});
        }
        
      }
    },

    selectTool(tool) {
      if (tool != 'colour' && tool != 'extra' && tool != 'delete' && tool != 'undo') {
        this.selectedTool = tool;
      }
    },

    showToolOptions(tool) {
      this.hideToolOptions(); // close all other tool option menus
      if (['pen','colour','shape','extra'].includes(tool)) { // If tool has options menu
        this.tools[tool].showOptions = true;
         // Show options menu
      }
    },

    hideToolOptions() { // Close all tool option menus
      for (let i = 0; i < Object.keys(this.tools).length; i++) {
        let tool = Object.keys(this.tools)[i];
        if (['pen','colour','shape','extra'].includes(tool)) {
          this.tools[tool].showOptions = false;
        }
      }
    },

    anyToolOptionsOpen() {
      for (let i = 0; i < Object.keys(this.tools).length; i++) {
        let tool = Object.keys(this.tools)[i];
        if (this.tools[tool].showOptions) {
          return true;
        }
      }
      return false;
    },

    changeColour(colour) {
      this.tools.colour.selected = colour;
      this.changeObjectColour(colour);
    },

    changeShape(shape) {
      this.tools.shape.selected = shape;
    },

    loadWhiteboard(canvasData) {
      this.canvas.loadFromJSON(canvasData);
      /*
      this.canvas.forEachObject(object => { 
       object.selectable = false; 
      });*/
    },

    sendWhiteboardToServer(canvasData, userType) {
      if (this.userType == 'leader') {
        if (this.board == 'questions') {
          this.$socket.emit('sendBoard', {canvasData: canvasData, userType:userType});
        }
        else {
          this.$socket.emit('sendBoard', {canvasData: canvasData, userType:this.board});
        }
        
      }
      else {
        if (this.board != 'questions') { 
          this.$socket.emit('sendBoard', {canvasData: canvasData, userType:this.nickname});
        }
      }
      
    },
    
  }/*,
  sockets: {

    

  }*/,
  mounted() {
    if (this.userType=='leader' || this.board=='working') {
      console.log('interactive!');
      this.initialiseInteractiveCanvas(this.board);
    }
    else {
      this.initialiseStaticCanvas(this.board);
    }
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.whiteboard {
  overflow: hidden;
  height: 100%;
  canvas {
    background: url('../assets/img/dot.svg') repeat;
    background-size: 36px 36px;
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

    #pen-options {
      top: 4rem;
      grid-template-columns: 1fr 1fr 1fr;

      button, div {
        padding: 0.5rem;
      }
    }

    #colour-options {
      top: 8rem;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 2fr;
      row-gap: 40%;
      padding: 1rem 1rem 1rem 0;
      

      .colour {
        margin-right: 0.2rem;

        input {
          display: none;
        }

        label {
          position: relative;
          margin: 1.5rem;

          span {

          &.radio {

            &:hover {
              cursor: pointer;
            }

            &#black {
              &::before {
                background-color: black;
              }
            }

            &#blue {
              &::before {
                background-color: blue;
              }
            }

            &#red {
              &::before {
                background-color: red;
              }
            }

            &#green {
              &::before {
                background-color: green;
              }
            }

            &#yellow {
              &::before {
                background-color: yellow;
              }
            }

            &#orange {
              &::before {
                background-color: orange;
              }
            }

            &#purple {
              &::before {
                background-color: purple;
              }
            }

            &::before {
              width: 1.5rem;
              height: 1.5rem;
              border-radius: 1.5rem;
              background-color: black;
            }

          }

          &::before, ::after {
            content: '';
            position: absolute;
            padding: 0.2rem;
          }
        }
        }

        input:checked + label span.radio::before {
          box-shadow: 0px 0px 0px 0.2rem grey;
        }

      }
      

      
    }

    #shape-options {
      top: 19rem;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 2fr 1fr;
      padding: 1rem 1.5rem 1.5rem 0;
      

      .shape {
        margin-right: 0.2rem;

        input {
          display: none;
        }

        label {
          position: relative;
          margin: 1.5rem;
          

          span {
            

          &.radio {

            &:hover {
              cursor: pointer;
            }

            &#rect {
              &::before {
                background-image: url("../assets/img/sidebar/options/rect.svg");
              }
            }

            &#circle {
              &::before {
                background-image: url("../assets/img/sidebar/options/circle.svg");
              }
            }

            &#line {
              &::before {
                background-image: url("../assets/img/sidebar/options/line.svg");
              }
            }

            &#triangle {
              &::before {
                background-image: url("../assets/img/sidebar/options/triangle.svg");
              }
            }

            &::before {
              width: 2rem;
              height: 2rem;
              border-radius: 0.4rem;
              //background-color: black;
            }

          }

          &::before, ::after {
            content: '';
            position: absolute;
            padding: 0.2rem;
          }
        }
        }

        input:checked + label span::before {
          background-color: rgba(0,0,0,0.12);
        }

      }
    }

    #extra-options {
      top: 22.7rem;
    }

    .sidebar-button-options {
      position: absolute;
      right: 4rem;
      background-color: white;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0px 1px 15px rgba(0,0,0,0.3);
      display: grid;
    }
  }

}



</style>
