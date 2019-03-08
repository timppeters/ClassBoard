<template>
  <div class="board">
    <canvas id="main"></canvas>
    <div class="sidebar">
      <div class="sidebar-button" v-for="(value, key) in tools" :id='key' :key="key"></div>
    </div>
  </div>
</template>

<script>
import {fabric} from 'fabric';
import initiateCanvas from '../assets/whiteboard_helper.js';

export default {
  name: 'board',
  props: {
    msg: String
  },
  data() {
    return {
      like: 3,
      tools: {
        undo: {

        },
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
          size: 4,
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

  }/*,
  sockets: {

  }*/,
  mounted() {
    initiateCanvas('main');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.board {
  overflow: hidden;
  height: 100%;
  canvas {
    background: url('../assets/dot.svg') repeat;
    background-size: 36px 36px;
  }

  .sidebar {
    position: absolute;
    top: 10rem;
    right: 3rem;

    .sidebar-button {
      height: 10px;
      width: 10px;
      background-color: black;
    }
  }
}

</style>
