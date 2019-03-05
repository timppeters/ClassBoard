<template>
  <div class="board">
    <canvas id="main"></canvas>
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
  #main {
    cursor: crosshair;
  }
  canvas {
    background: url('../assets/dot.svg') repeat;
    background-size: 36px 36px;
    //touch-action: none;
  }
}

</style>
