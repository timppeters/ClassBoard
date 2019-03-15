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
      <div class="sidebar-button" v-for="(value, key) in tools" :id="key" :key="key">
        <img :src="require('../assets/img/sidebar/'+key+'.svg')" v-bind:class="{selected : selectedTool==key}" v-on:click="selectedTool=key; showToolOptions(key)" alt="">
      </div>
      <div class="sidebar-button-options" id="pen-options" v-if="tools.pen.showOptions">
        <div>{{this.tools.pen.size}}</div>
        <input type="range" min="1" max="20" value="4" class="slider" v-model="tools.pen.size">
      </div>
      <div class="sidebar-button-options" id="colour-options"  v-if="tools.colour.showOptions">
        <div class="colour" v-for="(value) in tools.colour.colours" :key="value">
          <input type="radio" name="colour" :value="value" :id="value+'-input'" :checked="tools.colour.selected==value" v-on:click="tools.colour.selected = value">
          <label :for="value+'-input'"><span class="radio" :id="value"></span></label>
        </div>
      </div>
      <div class="sidebar-button-options" id="shape-options"  v-if="tools.shape.showOptions">

      </div>
      <div class="sidebar-button-options" id="extra-options"  v-if="tools.extra.showOptions">

      </div>
    </div>
  </div>
</template>

<script>
import {whiteboard} from '../mixins/whiteboard.js';

export default {
  name: 'board',
  mixins: [whiteboard],
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
          shapes: ['rectangle', 'line', 'triangle', 'star', 'circle'],
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
    showToolOptions(key) {
      this.hideToolOptions(); // close all other tool option menus
      if (['pen','colour','shape','extra'].includes(key)) { // If tool has options menu
        this.tools[key].showOptions = true;
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
    }
    
  }/*,
  sockets: {

  }*/,
  mounted() {
    this.initialiseCanvas('main');
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

//transitions

.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter, .slide-left-leave-to {
  transform: translateX(-500px);
}

</style>
