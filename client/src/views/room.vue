<template>
  <div class="room">

    <div class="topbar" v-bind:class="{ small : userType=='leader'&&!currentBoard!='student'}">
      <div class="sandwich" v-on:click="showMenu = !showMenu" >
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </div>
      <div class="name">{{roomName}}</div>
      <div class="button" v-bind:class="{ hide : userType=='leader'&&!currentBoard!='student'}">submit</div>
    </div>

    <transition name="slide-left">
      <div v-if="showMenu" id="menu">
        <div id="close"><img src="../assets/img/sidebar/close.svg" alt="" @click="showMenu = !showMenu"></div>
        <div id="title">Whiteboards</div>
        <div class="links" id="links-student" v-if="userType == 'student'">
          <div class="link" v-bind:class="{selected : currentBoard=='questions'}" v-on:click="currentBoard='questions'">Questions</div>
          <div class="link" v-bind:class="{selected : currentBoard=='working'}" v-on:click="currentBoard='working'">Working</div>
        </div>
        <div class="links" id="links-leader" v-if="userType == 'leader'">
          <div class="link" v-bind:class="{selected : currentBoard=='questions'}" v-on:click="currentBoard='questions'">Questions</div>
          <div class="link" v-bind:class="{selected : currentBoard=='students'}" v-on:click="currentBoard='students'">Students</div>
        </div>
        <div id="leave"><div>leave</div></div>
      </div>
    </transition>

    <whiteboard v-bind:class="{ selected : currentBoard == 'questions'}" board="questions" key="questions"></whiteboard>
    <whiteboard v-bind:class="{ selected : currentBoard == 'working'}" board="working" key="working"></whiteboard>
    <div class="students" v-bind:class="{ selected : currentBoard == 'students'}">
      <div class="student" v-for="(value) in leader.students" :key="value"><img src="../assets/img/student.png"><span class='name'>{{value}}</span></div>
    </div>
  </div>
</template>

<script>
import whiteboard from '../components/whiteboard.vue'

export default {
  name: 'room',
  components: {
    whiteboard
  },
  data() {
    return {
      roomName: 'Test Maths',
      showMenu: false,
      currentBoard: 'questions',
      userType: 'leader',
      leader: {
        students: ['Tim', 'Ethan', 'Balazs', 'Aidan', 'Jory', 'Mary', 'Sarah', 'George', 'Jay', 'Selena', 'Robert']
      },
      student: {

      }
    }
  }
}
</script>

<style lang="scss" scoped>

.room {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 4fr;
  background-image: linear-gradient(to bottom right,rgb(255, 255, 255) 20%,rgb(232, 232, 232) 100%);

  .whiteboard {
    display: none;

    &.selected {
      display: initial;
    }
  }

  .students {
    display: none;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-row-start: 2;

    &.selected {
      display: grid;
    }

    .student {
      display: grid;
      grid-template-rows: 1fr 1fr;
      margin: auto;
      img {
        height: 7rem;
        border-radius: 0.5rem;
        box-shadow: 0px 1px 15px rgba(0,0,0,0.1);
      }

      span {
        margin-top: 0.5rem;
        font-size: 1.7rem;
        font-weight: 600;
      }
    }
    
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
    z-index: 1;

    &.small {
      grid-template-columns: 1fr 5fr;
    }

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

      &.hide {
        display: none;
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
    z-index: 1;

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

    .links {
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
}

//transitions

.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter, .slide-left-leave-to {
  transform: translateX(-500px);
}

</style>
