<template>
  <div class="home" v-bind:class="{ rows : !inLobby}">
    
    <div class="nav" v-if="!inRoom">
      <div class="links">
        <div class="link" v-on:click="createRoomScreen=true">Create</div>
      </div>

      <div class="logo">
        <img src="../assets/img/Logo.svg" alt="Logo" v-on:click="createRoomScreen=false">
      </div>

      <div class="links">
        <div class="link"></div>
      </div>

    </div>

    <div class="notifications">
      <div v-if="notifications.kicked">You have been kicked!<span v-on:click="notifications.kicked = false">&times;</span></div>
      <div v-if="notifications.roomStartedKicked">The room started without you :(<span v-on:click="notifications.roomStartedKicked = false">&times;</span></div>
      <div v-if="notifications.roomClosed">The leader closed the room<span v-on:click="notifications.roomClosed = false">&times;</span></div>
    </div>

    <div class="container" v-if="!inLobby" v-bind:class="{ rows : !inLobby}">

      <form id="pin" v-if="!inRoom && !createRoomScreen" v-on:submit.prevent="joinRoom(pin)">
        <div class="errorMessages">
          <div v-if="notifications.invalidPin">Invalid Pin</div>
          <div v-if="notifications.roomAlreadyStarted">Room already started!</div>
        </div>
        <input type="text" v-model="pin" placeholder="123456" v-validate.initial="'required|numeric|length:6'" name="pin" required autocomplete="off" key="pin">
        <button v-bind:class="{ disabled : errors.has('pin') }">join</button>

      </form>

      <form id="nickname" v-if="inRoom && !inLobby && !createRoomScreen" v-on:submit.prevent="joinLobby(user.nickname, pin)">
        <div class="errorMessages">
          <div v-if="notifications.nicknameTaken">Nickname Taken</div>

        </div>
        <input type="text" v-model="user.nickname" placeholder="Nickname" v-validate.initial="'required|alpha_num|min:3|max:13'" name="nickname" required autocomplete="off" key="nickname">
        <button v-bind:class="{ disabled : errors.has('nickname') }">enter</button>
      </form>

      <form id="createRoom" v-if="createRoomScreen" v-on:submit.prevent="createRoom(roomName)">
        <input type="text" v-model="roomName" placeholder="Room Name" v-validate.initial="'required|alpha_spaces|min:3|max:26'" name="roomName" required autocomplete="off" key="roomName">
        <button v-bind:class="{ disabled : errors.has('roomName') }">create</button>
      </form>

    </div>

    <div class="lobby" v-if="inLobby">
      <div class="header">
        <div class="roomName">{{roomName}}</div>
        <div class="message">Join room with pin:</div>
        <div class="pin">{{pin}}</div>
        <div class="button" v-if="userType == 'leader'" v-on:click="startRoom(pin)"><span>START</span></div>

      </div>
      <div class="users" ref="users" v-bind:class="lobbyColour">
        <div class="user" v-for="(value, key) in users" :key="key">{{value}}<span v-if="userType == 'leader'" v-on:click="kick(value, pin)">&times;</span></div>

      </div>

    </div>

  </div>
</template>

<script>

export default {
  name: 'lobby',
  data() {
    return {
      userType: 'user',
      roomName: '',
      pin: '',
      users: [],
      inRoom: false,
      inLobby: false,
      createRoomScreen: false,
      notifications: {
        roomClosed: false,
        roomAlreadyStarted: false,
        roomStartedKicked: false,
        kicked: false,
        invalidPin: false,
        nicknameTaken: false
      },
      leader: {

      },
      user: {
        nickname: '',

      }
    }
  },
  sockets: {
    joinedRoom(data) {
      this.inRoom = true;
      this.roomName = data.roomName;

    },

    joinedLobby(data) {
      this.inLobby = true;
      this.users = data.users;
      this.setUsersDivHeight();
    },

    createdRoom(data) {
      this.userType = 'leader';
      this.inRoom = true;
      this.inLobby = true;
      this.pin = data.pin;
      this.setUsersDivHeight();

    },

    userJoined(data) {
      this.users.push(data.user);

    },

    userLeft(data) {
      if (data.user == this.user.nickname) {
        this.$socket.emit('leave',{pin: this.pin});
        this.roomName = '';
        this.pin = '';
        this.user.nickname = '';
        this.users = [];
        this.inRoom = false;
        this.inLobby = false;
        this.notifications.kicked = true;
      }
      else {
        let index = this.users.indexOf(data.user);
        this.users.splice(index, 1);
      }
      
    },

    roomStarted() {
      this.roomStarted = true;
      if(this.inLobby) {
        this.$router.replace({ name: 'room' , params: {roomName: this.roomName, userType: this.userType, nickname: this.user.nickname, users: this.users}});
      }
      else {
        this.roomName = '';
        this.pin = '';
        this.user.nickname = '';
        this.users = [];
        this.inRoom = false;
        this.inLobby = false;
        this.notifications.roomStartedKicked = true;
      }

    },

    roomClosed() {
      this.$socket.emit('leave',{pin: this.pin});

      this.roomName = '';
      this.pin = '';
      this.user.nickname = '';
      this.users = [];
      this.inRoom = false;
      this.inLobby = false;
      this.notifications.roomClosed = true;

    },

    //Errors

    invalidPin() {
      this.notifications.invalidPin = true;
      this.pin = '';

    },

    nicknameTaken() {
      this.notifications.nicknameTaken = true
      this.user.nickname = '';
    },

    roomAlreadyBegun() {
      this.notifications.roomAlreadyStarted = true;
      this.pin = '';
    }
  },
  methods: {

    joinRoom(pin) {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.$socket.emit('joinRoom', {pin: pin});
        }
      });
    },

    joinLobby(nickname, pin) {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.$socket.emit('joinLobby', {
            nickname: nickname,
            pin: pin,
            screenDimensions: {
              x: window.innerWidth,
              y: window.innerHeight
            }
            });
        }
      });
    },

    createRoom(roomName) {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.$socket.emit('createRoom', {
            roomName: roomName,
            screenDimensions: {
              x: window.innerWidth,
              y: window.innerHeight
            }
            });
        }
      });
    },

    kick(nickname, pin) {
      this.$socket.emit('kick', {pin: pin, nickname: nickname})
    },

    startRoom(pin) {
      this.$socket.emit('startRoom', {pin: pin})
    },

    setUsersDivHeight() {
      let height = window.innerHeight * 0.75;
      this.$nextTick( () => {
        this.$refs.users.style.height = height.toString() + 'px';
      });
      
    },

  },
  mounted() {
    
  },
  computed: {
    lobbyColour() {
      let lobbyColours = ['blue','red','pink','green','purple','orange','cyan'];
      return lobbyColours[Math.floor(Math.random() * lobbyColours.length)];
    }
  }
}
</script>

<style lang="scss" scoped>

$showClose: none;
$blue: hsl(215, 92%, 61%);
$orange: hsl(41, 100%, 50%);

.home {
  height: 100%;
  display: grid;
  overflow: hidden;
  background: white;
  color: #2c3e50;

  .notifications {
    position: absolute;
    top: 10rem;
    left: 50%;
    transform: translateX(-50%);
    background: $blue;
    border-radius: 0.5rem;

    div {
      padding: 1rem;
      color: white;

      span {
        margin-left: 1rem;
        cursor: pointer;
      }

    }
  }

  &.rows {
    grid-template-rows: 1.5fr 6fr 1fr;
  }

  .nav {
    box-shadow: 0px 1px 0px 0px rgba(0,0,0,0.2);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    .logo {
      margin: auto;
    
      img {
        height: 5rem;
        cursor: pointer;
      }
    }

    .links {
      margin: auto auto auto 10rem;

      .link {
        font-size: 2rem;
        font-weight: 600;
        cursor: pointer;

      }
    }

  }

  .container {
    display: grid;
    grid-row-start: 2;

    &.rows {
      grid-template-rows: 4fr 1fr;
    }
    
    
    form {
      margin: auto;
      display: grid;
      grid-template-rows: 1fr 2fr 2fr;

      .errorMessages {
        color: darkred;
        margin: auto;
      }

      input {
        border: none;
        background-color: #f2f2f2;
        border-radius: 0.5rem;
        font-size: 3rem;
        padding: 0.5rem;
        text-align: center;
        width: 20rem;
        box-shadow: none;
        transition: box-shadow 0.3s ease;
        grid-row-start: 2;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 0.2rem $blue;

        }

      }

      button {
        text-transform: uppercase;
        margin-top: 1rem;
        border-radius: 0.5rem;
        grid-row-start: 3;
        border: none;
        font-size: 2.2rem;
        background: $orange;
        color: white;
        cursor: pointer;
        transition: background-color 0.1s ease;

        &:focus {
          outline: none;
        }

        &:active {
          background: darken($orange, 10%);
        }

        &.disabled {
          background-color: #cccccc;
          color: #666666;
          cursor: default;
        }
      }
    }
  }

  .lobby {
    display: grid;
    grid-template-rows: 25% 75%;

    .header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 2fr;

      .roomName {
        grid-column-start: 0;
        margin: auto auto auto 3rem;
        font-size: 1.5rem;
        font-weight: 600;

      }
      .message {
        grid-column-start: 2;
        margin: auto auto auto 0;
        text-transform: capitalize;
        font-size: 1.2rem;

      }

      .pin {
        grid-column-start: 2;
        grid-row-start: 2;
        margin: 0 auto auto auto;
        font-size: 6rem;
        font-weight: 700;
        

      }

      .button {
        grid-column-start: 3;
        margin: auto 2rem 0 auto;
        background: $orange;
        cursor: pointer;
        border-radius: 0.5rem;
        transition: background-color 0.1s ease;

        &:active {
          background: darken($orange, 10%);
        }

        span {
          color: white;
          font-size: 2.5rem;
          padding: 2rem;
        }

      }

    }

    .users {
      background-image: #800080;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr 1fr;
      overflow: auto;
      height: 100%;

      &.blue {
        background-image: linear-gradient(to bottom right,#1e3c72 0%,#2a5298 100%);
      }
      &.red {
        background-image: linear-gradient(to bottom right,#93291E 0%,#ED213A 100%);
      }
      &.pink {
        background-image: linear-gradient(to bottom right,#f2709c 0%,#f09c81 100%);
      }
      &.green {
        background-image: linear-gradient(to bottom right,#11998e 0%,#38ef7d 100%);
      }
      &.purple {
        background-image: linear-gradient(to bottom right,#6a3093 0%,#a044ff 100%);
      }
      &.orange {
        background-image: linear-gradient(to bottom right,#f46b45 0%,#eea849 100%);
      }
      &.cyan {
        background-image: linear-gradient(to bottom right,#0083B0 0%,#00B4DB 100%);
      }
      
      .user {
        color: white;
        font-size: 2rem;
        font-weight: 600;
        margin: auto;
        text-align: center;
        padding: 3rem;

        &:hover {
          $showClose: block;

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

}

</style>

