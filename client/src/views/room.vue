<template>
  <div class="room">
    <board ref='board'></board>
  </div>
</template>

<script>
import board from '../components/board.vue'

export default {
  name: 'room',
  components: {
    board
  }
}
</script>

<style lang="scss" scoped>

.room {
  height: 100%;
}

</style>
