<template>
  <div class="home" v-bind:class="{ rows : !inLobby}">
    
    <div class="nav" v-if="!inRoom">
      <div class="links">
        <div class="link">Create</div>
      </div>

      <div class="logo">
        <img src="../assets/img/Logo.svg" alt="Logo">
      </div>

      <div class="links">
        <div class="link"></div>
      </div>

    </div>

    <div class="container" v-if="!inLobby" v-bind:class="{ rows : !inLobby}">

      <form id="pin" v-if="!inRoom" v-on:submit.prevent="inRoom = true">
        <input type="text" placeholder="123456" v-validate.initial="'required|numeric|length:6'" name="pin" required autocomplete="off" key="pin">
        <button v-bind:class="{ disabled : errors.has('pin') }">join</button>

      </form>

      <form id="nickname" v-if="inRoom && !inLobby" v-on:submit.prevent="inLobby = true">
        <input type="text" placeholder="Nickname" v-validate.initial="'required|alpha_num|min:3|max:13'" name="nickname" required autocomplete="off" key="nickname">
        <button v-bind:class="{ disabled : errors.has('nickname') }">enter</button>
      </form>

    </div>

    <div class="lobby" v-if="inLobby">
      <div class="header">

      </div>
      <div class="users">

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
      users: ['Tim', 'Ethan', 'Balazs', 'Aidan', 'Jory', 'Mary', 'Sarah', 'George', 'Jay', 'Selena', 'Robert'],
      inRoom: false,
      inLobby: false,
      notifications: {
        roomAlreadyStarted: false,
        kicked: false
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

.home {
  height: 100%;
  display: grid;
  
  background: white;
  color: #2c3e50;

  &.rows {
    grid-template-rows: 1fr 6fr 1fr;
  }

  .nav {
    box-shadow: 0px 1px 0px 0px rgba(0,0,0,0.2);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    .logo {
      margin: auto;
    
      img {
        height: 5rem;
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
      grid-template-rows: 1fr 1fr;

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

        &:focus {
          outline: none;
          box-shadow: 0 0 0 0.2rem #489bd5;

        }

      }

      button {
        text-transform: uppercase;
        margin-top: 1rem;
        border-radius: 0.5rem;
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
    grid-template-rows: 1fr 4fr;

    .header {

    }

    .users {
      background: purple;
    }

  }

}

</style>

