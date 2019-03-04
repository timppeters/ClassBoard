<template>
  <div class="board">
    <canvas id="main"></canvas>
  </div>
</template>

<script>
import {fabric} from 'fabric';

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
    let canvas = new fabric.Canvas('main', {
      rotationCursor: 'pointer'
    });


    //Drawing object
    let ctx = canvas.getContext('2d');

    let rect = new fabric.Rect();

    canvas.add(rect); // add object

    canvas.item(0); // reference fabric.Rect added earlier (first object)
    canvas.getObjects(); // get all objects on canvas (rect will be first and only)

    let text = new fabric.IText('hello world', { left: 100, top: 100 });

    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: 'black',
      borderColor: 'grey',
      cornerSize: 6,
      padding: 7,
      borderDashArray: [2, 2]
    });

    canvas.add(text);
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
