<template>
  <div class="room">

    <div class="topbar" v-bind:class="topbarSize">
      <div class="sandwich" v-on:click="showMenu = !showMenu" v-if="currentBoard!='user'">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </div>

      <div class="backArrow" v-if="currentBoard=='user'" v-on:click="closeUserWhiteboard()"><img src="../assets/img/sidebar/back.svg"></div>

      <div class="name" v-if="currentBoard!='user'">{{roomName}}</div>
      <div class="name" v-if="currentBoard=='user'">{{leader.selectedUserBoard}}</div>
      <div class="button" v-on:click="submitBoard()" v-bind:class="{ hide : userType=='leader' || currentBoard!='working' || user.submitted}" key="submit">submit</div>
      <div class="button" v-on:click="markBoard('correct')" v-if="userType=='leader'" v-bind:class="{ hide : currentBoard!='user' || !leader.submittedUsers.includes(leader.selectedUserBoard) || leader.markedUsers.includes(leader.selectedUserBoard)}" key="markCorrect">correct</div>
      <div class="button wrong" v-on:click="markBoard('wrong')" v-if="userType=='leader'" v-bind:class="{ hide : currentBoard!='user' || !leader.submittedUsers.includes(leader.selectedUserBoard) || leader.markedUsers.includes(leader.selectedUserBoard)}" key="markWrong">wong</div>
    </div>

    <transition name="slide-left">
      <div v-if="showMenu" id="menu">
        <div id="close"><img src="../assets/img/sidebar/close.svg" alt="" @click="showMenu = !showMenu"></div>
        <div id="title">Whiteboards</div>
        <div class="links" id="links-user" v-if="userType == 'user'">
          <div class="link" v-bind:class="{selected : currentBoard=='questions'}" v-on:click="currentBoard='questions'">Questions</div>
          <div class="link" v-bind:class="{selected : currentBoard=='working'}" v-on:click="currentBoard='working'">My Whiteboard</div>
        </div>
        <div class="links" id="links-leader" v-if="userType == 'leader'">
          <div class="link" v-bind:class="{selected : currentBoard=='questions'}" v-on:click="currentBoard='questions'">My Whiteboard</div>
          <div class="link" v-bind:class="{selected : currentBoard=='users'}" v-on:click="currentBoard='users';setUsersDivHeight()">Users</div>
        </div>
        <div id="leave" v-on:click="leaveOrClose()">
          <div v-if="userType == 'user'">leave</div>
          <div v-if="userType == 'leader'">close room</div>
          </div>
      </div>
    </transition>

    <whiteboard id="questionsBoard" ref="questions" v-bind:class="{ selected : currentBoard == 'questions'}" board="questions" v-bind:userType="userType" v-bind:nickname="nickname" key="questions"></whiteboard>
    <whiteboard id="workingBoard" ref="working" v-bind:class="{ selected : currentBoard == 'working'}" board="working" v-bind:userType="userType" v-bind:nickname="nickname" key="working"></whiteboard>
    <div class="users" ref="users" v-bind:class="{ selected : currentBoard == 'users'}">
      <div class="user" v-for="(value, key) in leader.users" :key="key"><img src="../assets/img/student.png" v-bind:class="{ submitted: leader.submittedUsers.includes(value)}" v-on:click="openUserWhiteboard(value);"><span class='name'>{{value}}<span v-if="userType == 'leader'" v-on:click="kick(value)">&times;</span></span></div>
    </div>
    <whiteboard id="leaderEditingUserBoard" ref="user" v-if="userType == 'leader' && currentBoard=='user'" v-bind:class="{ selected : currentBoard=='user' }" v-bind:board="leader.selectedUserBoard" v-bind:userType="userType" v-bind:nickname="nickname" key="user"></whiteboard>
    <div class="markNotification" v-if="leader.markedUsers.includes(this.nickname)" v-bind:class="{correct : user.mark == 'correct'}">
      <div>Mark: {{user.mark}}</div>
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
  props: ['roomName', 'userType', 'nickname', 'users'],
  data() {
    return {
      showMenu: false,
      currentBoard: 'questions',
      leader: {
        users: [],
        selectedUserBoard: '',
        submittedUsers: [],
        markedUsers: []
      },
      user: {
        submitted: false,
        mark: ''
      }
    }
  },
  sockets: {
    updateBoard(data) {
      if (this.userType == 'user') {
        if (data.userType == 'leader') {
          this.$refs.questions.loadWhiteboard(data.canvasData);
        }
        else {
          this.$refs.working.loadWhiteboard(data.canvasData);
        }
      }
      else {
        if (data.userType == 'leader') {
          this.$refs.questions.loadWhiteboard(data.canvasData);
        }
        else {
          //load user whiteboard
          this.$refs.user.loadWhiteboard(data.canvasData);
          

        }

      }

    },

    userLeft(data) {
      if (data.user == this.nickname) {
        this.$socket.emit('leave',{pin: this.pin});
        location.reload();
      }
      else {
        let index = this.leader.users.indexOf(data.user);
        this.leader.users.splice(index, 1);
        this.setUsersDivHeight();
        this.closeUserWhiteboard()
      }
      
    },

    roomClosed() {
      this.$socket.emit('leave',{pin: this.pin});
      location.reload();
    },

    submittedBoard(data) {
      this.user.mark = data.mark;
      this.leader.submittedUsers.push(data.nickname);
    },

    // This event only gets sent to the user who's board was marked, so we can push their nickname and it won't appear twice in the array
    markedBoard(data) {
      this.user.mark = data.mark;
      this.leader.markedUsers.push(data.nickname);
    }
  },
  methods: {
    // Leader opens a user's whiteboard
    openUserWhiteboard(nickname) {
      this.$socket.emit('requestWhiteboard', {nickname: nickname});
      this.currentBoard = 'user';
      this.leader.selectedUserBoard = nickname;
      
    },

    closeUserWhiteboard() {
      this.currentBoard = 'users';
      this.selectedUserBoard = '';
    },


    // Need to set the height of the div specifically, due the the overflow: auto property.
    setUsersDivHeight() {
      this.$nextTick( () => {
        let heightOfDiv = this.$refs.users.clientHeight;
        if (heightOfDiv <= window.innerHeight) {
          this.$refs.users.style.height = window.innerHeight.toString() - this.remToPixels(10) + 'px';
        }
      });
    },

    remToPixels(rem) {
      return (rem * parseFloat(getComputedStyle(document.documentElement).fontSize));
    },

    kick(nickname) {
      this.$socket.emit('kick', {nickname: nickname});
    },

    leaveOrClose() {
      location.reload();
    },

    submitBoard() {
      this.$socket.emit('submitBoard', {nickname:this.nickname});
      this.user.submitted = true;
    },

    markBoard(correctOrNot) {
      this.$socket.emit('markBoard', {nickname: this.leader.selectedUserBoard, mark: correctOrNot});
      this.leader.markedUsers.push(this.leader.selectedUserBoard);
    }
  },
  mounted() {
    // If someone tries to connect directly to /room, it redirects them to the home page
    if (this.roomName == undefined || this.userType == undefined) {
      this.$router.replace({ name: 'lobby'});
    }
    this.leader.users = this.users;
  },
  computed: {
    topbarSize() {
      if (this.currentBoard=='questions'|| this.currentBoard=='users') {
        return ('small');
      }
      if (this.currentBoard=='user' && this.leader.submittedUsers.includes(this.leader.selectedUserBoard) && !this.leader.markedUsers.includes(this.leader.selectedUserBoard)) {
        return ('extraBig');
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.room {
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  

  .whiteboard {
    display: none;

    &#leaderEditingUserBoard {
      z-index:1;
    }

    &.selected {
      display: initial;
    }
  }

  .users {
    display: none;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-row-start: 2;
    padding-top: 10rem;
    background-image: linear-gradient(to bottom right,rgb(255, 255, 255) 20%,rgb(232, 232, 232) 100%);
    height: 100%;

    &.selected {
      display: grid;
    }

    .user {
      display: grid;
      grid-template-rows: 1fr 1fr;
      margin: auto;
      img {
        height: 7rem;
        border-radius: 0.5rem;
        box-shadow: 0px 1px 15px rgba(0,0,0,0.1);
        cursor: pointer;

        &.submitted {
          box-shadow: 0 0 0 5px #00B894;

          &:hover {
            box-shadow: 0 0 0 5px #00B894;
          }
        }

        &:hover {
          box-shadow: 0px 1px 15px rgba(0,0,0,0.3);
        }
      }

      .name {
        margin-top: 0.5rem;
        font-size: 1.7rem;
        font-weight: 600;

        &:hover {

          span {
            margin-left: 1rem;
            display: inline;
            cursor: pointer;
          }
        }
        span {
          display: none;
        }
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
    z-index: 2;

    &.small {
      grid-template-columns: 1fr 5fr;
    }

    &.extraBig {
      grid-template-columns: 1fr 5fr 5fr 5fr;
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

    .backArrow {
      margin: auto 0 0 0;
      cursor: pointer;

      img {
        height: 2rem;
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

      &.wrong {
        background-color: #FF7675;
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
    z-index: 3;

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
  .markNotification {
    padding: 1rem;
    background: #FF7675;
    position: absolute;
    top: 2rem;
    right: 20rem;
    border-radius: 0.5rem;
    color: white;

    &.correct {
      background: #00B894;
    }

    div {
      font-size: 1.4rem;
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
