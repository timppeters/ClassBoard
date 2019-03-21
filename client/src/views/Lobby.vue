<template>
  <div class="home" v-bind:class="{ rows : !inLobby}">
    
    <div class="nav" v-if="!inRoom">
      <div class="links">
        <div class="link" v-on:click="createRoom=true">Create</div>
      </div>

      <div class="logo">
        <img src="../assets/img/Logo.svg" alt="Logo" v-on:click="createRoom=false">
      </div>

      <div class="links">
        <div class="link"></div>
      </div>

    </div>

    <div class="container" v-if="!inLobby" v-bind:class="{ rows : !inLobby}">

      <form id="pin" v-if="!inRoom && !createRoom" v-on:submit.prevent="inRoom = true">
        <div class="errorMessages" v-if="notifications.invalidPin">
          <div>Invalid Pin</div>
        </div>
        <input type="text" v-model="pin" placeholder="123456" v-validate.initial="'required|numeric|length:6'" name="pin" required autocomplete="off" key="pin">
        <button v-bind:class="{ disabled : errors.has('pin') }">join</button>

      </form>

      <form id="nickname" v-if="inRoom && !inLobby && !createRoom" v-on:submit.prevent="inLobby = true">
        <div class="errorMessages" v-if="notifications.invalidNickname || notifications.nicknameTaken">
          <div v-if="notifications.invalidNickname">Invalid Nickname</div>
          <div v-if="notifications.nicknameTaken">Nickname Taken</div>

        </div>
        <input type="text" v-model="user.nickname" placeholder="Nickname" v-validate.initial="'required|alpha_num|min:3|max:13'" name="nickname" required autocomplete="off" key="nickname">
        <button v-bind:class="{ disabled : errors.has('nickname') }">enter</button>
      </form>

      <form id="createRoom" v-if="createRoom" v-on:submit.prevent="inRoom=true;inLobby = true">
        <input type="text" v-model="roomName" placeholder="Room Name" v-validate.initial="'required|alpha_num|min:3|max:13'" name="roomName" required autocomplete="off" key="roomName">
        <button v-bind:class="{ disabled : errors.has('roomName') }">create</button>
      </form>

    </div>

    <div class="lobby" v-if="inLobby">
      <div class="header">
        <div class="roomName">{{roomName}}</div>
        <div class="message">Join room with pin:</div>
        <div class="pin">{{pin}}</div>
        <div class="button" v-if="userType == 'leader'"><span>START</span></div>

      </div>
      <div class="users">
        <div class="user" v-for="(value) in users" :key="value">{{value}}<span>&times;</span></div>

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
      createRoom: false,
      notifications: {
        roomAlreadyStarted: false,
        kicked: false,
        invalidPin: false,
        invalidNickname: false,
        nicknameTaken: false
      },
      leader: {

      },
      user: {
        nickname: '',

      }

    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>

$showClose: none;

.home {
  height: 100%;
  display: grid;
  overflow: hidden;
  background: white;
  color: #2c3e50;

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
          box-shadow: 0 0 0 0.2rem #489bd5;

        }

      }

      button {
        text-transform: uppercase;
        margin-top: 1rem;
        border-radius: 0.5rem;
        grid-row-start: 3;
        border: none;
        font-size: 2.2rem;
        background:rgb(255, 174, 0);
        color: white;
        cursor: pointer;
        transition: background-color 0.1s ease;

        &:focus {
          outline: none;
        }

        &:active {
          background: darken(rgb(255, 174, 0), 10%);
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
    grid-template-rows: auto 34rem;

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
        background: rgb(255, 174, 0);
        cursor: pointer;
        border-radius: 0.5rem;
        transition: background-color 0.1s ease;

        &:active {
          background: darken(rgb(255, 174, 0), 10%);
        }

        span {
          color: white;
          font-size: 2.5rem;
          padding: 2rem;
        }

      }

    }

    .users {
      background: purple;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      overflow: auto;
      height: 34rem;
      
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

