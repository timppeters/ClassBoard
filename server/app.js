const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const Leader = require('./helpers/leader.js');
const User = require('./helpers/user.js');
const Room = require('./helpers/room.js');
const Log = require('./helpers/log.js');

const errorHandler = require('errorhandler');

app.use(errorHandler({ dumpExceptions: true, showStack: true })); 

app.get('/', (req, res) => {
    res.send('This is the server.');
});

let sockets = {};
let rooms = {};

function deleteRoom(pin) {
  let _sockets = rooms[pin].getSocketIds();
  _sockets.forEach(_socket => {
    sockets[_socket].room = '';
  });
  delete rooms[pin];
}

io.on('connection', socket => {
    Log.blue('Socket Connected: ' + socket.id);
    sockets[socket.id] = {room: '', leader: false};

    socket.on('createRoom', data => {
      let room = new Room(data.roomName, new Leader(socket.id));

      while (Object.keys(rooms).includes(room.pin)) {
        room.generatePin();
      }

      room._leader.room = room.pin;
      rooms[room.pin] = room;
      socket.join(room.pin);
      socket.emit('createdRoom', {pin: room.pin});
      Log.yellow('Created room: ' + room.pin + ' (' + room.name + ')');

      sockets[socket.id].room = room.pin;
      sockets[socket.id].leader = true;
    });

    socket.on('joinRoom', data => {
      if (Object.keys(rooms).includes(data.pin)) {
        if(!rooms[data.pin].started) {
          socket.emit('joinedRoom', {roomName: rooms[data.pin].name});
          socket.join(data.pin);

          sockets[socket.id].room = data.pin;
        }
        else {
          socket.emit('roomAlreadyBegun');
        }

      }
      else {
        socket.emit('invalidPin');
      }
    });

    socket.on('joinLobby', data => {
      if (rooms[data.pin].nicknameTaken(data.nickname)) {
        socket.emit('nicknameTaken');
      }
      else {
        let user = new User(socket.id, data.nickname, data.pin);
        rooms[data.pin].addUser(user);
        socket.emit('joinedLobby', {users: rooms[data.pin].usersNicknames});
        socket.to(data.pin).emit('userJoined', {user: data.nickname});
        Log.green('User ' + data.nickname + ' joined room ' + data.pin);
      }
    });

    socket.on('startRoom', data => {
      if (rooms[data.pin]._leader.socketId == socket.id) {
        rooms[data.pin].started = true;
        io.in(data.pin).emit('roomStarted');
        Log.cyan('Room ' + data.pin + ' started');
        
      }
    });

    socket.on('kick', data => {
      let pin = sockets[socket.id].room;
      if (rooms[pin]._leader.socketId == socket.id) {
        rooms[pin].removeUserByNickname(data.nickname);
        io.in(pin).emit('userLeft', {user: data.nickname});
        Log.magenta('User ' + data.nickname + ' kicked from room ' + pin);
      }
    });

    socket.on('sendBoard', data => {
      let pin = sockets[socket.id].room;
      if (Object.keys(rooms).includes(pin)) {
        if (data.userType == 'leader') {
          rooms[pin]._leader._canvasHistory.push(rooms[pin]._leader.canvas);
          rooms[pin]._leader.canvas = data.canvasData;
          socket.to(pin).emit('updateBoard', data);
        }
        else {
          rooms[pin]._users[data.userType]._canvasHistory.push(rooms[pin]._users[data.userType].canvas);
          rooms[pin]._users[data.userType].canvas = data.canvasData;
          if (rooms[pin]._leader.editingUserBoard == data.userType) {
            if (sockets[socket.id].leader) {
              io.to(`${rooms[pin]._users[data.userType].socketId}`).emit('updateBoard', data);
            }
            else {
              io.to(`${rooms[pin]._leader.socketId}`).emit('updateBoard', data);
            }
          }

        }
      }
    });

    socket.on('undo', data => {
      let pin = sockets[socket.id].room;
      if (data.userType == 'leader') {
        if (rooms[pin]._leader._canvasHistory.length != 0) {
          let prev = rooms[pin]._leader._canvasHistory.pop();
          rooms[pin]._leader.canvas = prev;
          io.in(pin).emit('updateBoard', {canvasData:prev, userType:data.userType});
        }
      }
      else {
        if (rooms[pin]._users[data.userType]._canvasHistory.length != 0) {
          let prev = rooms[pin]._users[data.userType]._canvasHistory.pop();
          rooms[pin]._users[data.userType].canvas = prev;
          io.in(pin).emit('updateBoard', {canvasData:prev, userType:data.userType});
        }

      }
    });

    socket.on('requestWhiteboard', data => {
      let pin = sockets[socket.id].room;
      if (sockets[socket.id].leader) {
        rooms[pin]._leader.editingUserBoard = data.nickname;
        io.to(`${rooms[pin]._leader.socketId}`).emit('updateBoard', {canvasData: rooms[pin]._users[data.nickname].canvas, userType:data.nickname});
      }
    });

    socket.on('submitBoard', data => {
      let pin = sockets[socket.id].room;
      io.to(`${rooms[pin]._leader.socketId}`).emit('submittedBoard', {nickname: data.nickname});
    });

    socket.on('leave', data => { // make sure the socket leaves the socketio room
      socket.leave(data.pin);
    });


    socket.on('disconnect', () => {
      if (sockets[socket.id].room != '') {
        let pin = sockets[socket.id].room;
        if (sockets[socket.id].leader) {
          socket.to(pin).emit('roomClosed');
          deleteRoom(pin);
          Log.white('Room ' + pin + ' closed');
        }
        else {
          rooms[pin].removeUserBySocketId(socket.id);
          let nickname = rooms[pin].getUserNickname(socket.id);
          socket.to(pin).emit('userLeft', {user: nickname});
          Log.magenta('User ' + nickname + ' left room ' + pin);
        }
      }

      delete sockets[socket.id];

      Log.red('Socket Disconnected: ' + socket.id);
    });
    
  });

http.listen(3000, () => Log.white('Listening on port 3000!'));