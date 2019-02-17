<template>
  <div class="room">
    <board></board>
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
}

</style>
