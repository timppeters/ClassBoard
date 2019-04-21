/*
* Main server file
*
*/

// Creating an express instance
const express = require('express');
const app = express();

// Creating a Socket.IO instance
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Importing custom classes
const Leader = require('./helpers/leader.js');
const User = require('./helpers/user.js');
const Room = require('./helpers/room.js');
const Log = require('./helpers/log.js');

const errorHandler = require('errorhandler');

app.use(errorHandler({ dumpExceptions: true, showStack: true })); 

// If someone connect to the serve with HTTP, they will see a message
app.get('/', (req, res) => {
    res.send('This is the server.');
});


/*
* Sockets object stores information about each socket connected to the server. Stores which room each socket is in, and if they are the leader of that room or not. The key for each sub-object is the socket's ID.
* Rooms object stores information about each room instance. The key for each sub-object is the room's PIN.
*/
let sockets = {};
let rooms = {};

// When a room is closed, it is removed from the rooms object. The 'room' attribute of each socket that was in the room is reset in the sockets object.
function deleteRoom(pin) {
  let _sockets = rooms[pin].getSocketIds();
  _sockets.forEach(_socket => {
    sockets[_socket].room = '';
  });
  delete rooms[pin];
}

// When a socket connects to the server, start listening to other events
io.on('connection', socket => {
    Log.blue('Socket Connected: ' + socket.id);

    // Add the socket to the sockets object
    sockets[socket.id] = {room: '', leader: false};

    // Socket requests to create a new room
    socket.on('createRoom', data => {

      // Create a new room instance, making the current socket the leader
      let room = new Room(data.roomName, new Leader(socket.id));

      // Generate a unique pin for the room
      while (Object.keys(rooms).includes(room.pin)) {
        room.generatePin();
      }

      // Add room object to rooms, add socket to socket.io room (The room's PIN is the name of the socket.io room)
      // Emit 'createdRoom' event to the socket that requested to create the room
      room.leader.room = room.pin;
      rooms[room.pin] = room;
      socket.join(room.pin);
      socket.emit('createdRoom', {pin: room.pin});
      Log.yellow('Created room: ' + room.pin + ' (' + room.name + ')');

      // Update sockets object
      sockets[socket.id].room = room.pin;
      sockets[socket.id].leader = true;
    });

    // Socket requests to join a room
    socket.on('joinRoom', data => {
      // If room exists
      if (Object.keys(rooms).includes(data.pin)) {
        // If room hasn't started
        if(!rooms[data.pin].started) {
          // Add socket to room
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

    // Socket requests to join the lobby (sets their nickname)
    socket.on('joinLobby', data => {
      // Can't have duplicate nicknames in a room
      if (rooms[data.pin].nicknameTaken(data.nickname)) {
        socket.emit('nicknameTaken');
      }
      else {
        // Create a new User instance, add to room, emit userJoined event to the whole room
        let user = new User(socket.id, data.nickname, data.pin);
        rooms[data.pin].addUser(user);
        socket.emit('joinedLobby', {users: rooms[data.pin].usersNicknames});
        socket.to(data.pin).emit('userJoined', {user: data.nickname});
        Log.green('User ' + data.nickname + ' joined room ' + data.pin);
      }
    });

    // Leader socket requests to start the room
    socket.on('startRoom', data => {
      // Only leader can start the room
      if (rooms[data.pin].leader.socketId == socket.id) {
        rooms[data.pin].started = true;
        io.in(data.pin).emit('roomStarted');
        Log.cyan('Room ' + data.pin + ' started');
        
      }
    });

    // Leader socket kicks a user from the room
    socket.on('kick', data => {
      let pin = sockets[socket.id].room;
      if (rooms[pin].leader.socketId == socket.id) {
        rooms[pin].removeUserByNickname(data.nickname);
        io.in(pin).emit('userLeft', {user: data.nickname});
        Log.magenta('User ' + data.nickname + ' kicked from room ' + pin);
      }
    });

    // When a socket sends their whiteboard to the server
    socket.on('sendBoard', data => {
      let pin = sockets[socket.id].room;
      if (Object.keys(rooms).includes(pin)) {
        // If the leader updated their whiteboard
        if (data.userType == 'leader') {
          // Add the old whiteboard data to the canvasHistory array (for undo feature)
          rooms[pin].leader.canvasHistory.push(rooms[pin].leader.canvas);
          // Update the leader object
          rooms[pin].leader.canvas = data.canvasData;
          // Send the new whiteboard data to all users in the room
          socket.to(pin).emit('updateBoard', data);
        }
        
        // If a user's whiteboard is updated (could be done by user or by the leader) (the data.userType is the user's nickname in this case)
        else {
          // Add old whiteboard data to the canvasHistory array (for undo feature)
          rooms[pin]._users[data.userType].canvasHistory.push(rooms[pin]._users[data.userType].canvas);
          // Update user object
          rooms[pin]._users[data.userType].canvas = data.canvasData;

          // If the leader is editing the user's board
          if (rooms[pin].leader.editingUserBoard == data.userType) {

            // If the leader just updated the board, send the whiteboard data to the specific user
            if (sockets[socket.id].leader) {
              io.to(`${rooms[pin]._users[data.userType].socketId}`).emit('updateBoard', data);
            }
            // If the user just updated the board, send the whiteboard data to the leader
            else {
              io.to(`${rooms[pin].leader.socketId}`).emit('updateBoard', data);
            }
          }

        }
      }
    });

    // Socket requests to undo
    socket.on('undo', data => {
      let pin = sockets[socket.id].room;
      // If it is the leader's whiteboard, pop canvasHistory and send that data
      if (data.userType == 'leader') {
        if (rooms[pin].leader.canvasHistory.length != 0) {
          let prev = rooms[pin].leader.canvasHistory.pop();
          rooms[pin].leader.canvas = prev;
          io.in(pin).emit('updateBoard', {canvasData:prev, userType:data.userType});
        }
      }

      // If it is a user's whiteboard, pop canvasHistory and send that data
      else {
        if (rooms[pin]._users[data.userType].canvasHistory.length != 0) {
          let prev = rooms[pin]._users[data.userType].canvasHistory.pop();
          rooms[pin]._users[data.userType].canvas = prev;
          io.to(`${rooms[pin]._users[data.userType].socketId}`).emit('updateBoard', {canvasData:prev, userType:data.userType});
          // If the leader is editing the user's whiteboard, send the whiteboard data to the leader too
          if (rooms[pin].leader.editingUserBoard == data.userType) {
            io.to(`${rooms[pin].leader.socketId}`).emit('updateBoard', {canvasData:prev, userType:data.userType});
          }



        }

      }
    });

    // Leader socket starts editing a user's board, needs to be given the whiteboard data
    socket.on('requestWhiteboard', data => {
      let pin = sockets[socket.id].room;
      if (sockets[socket.id].leader) {
        rooms[pin].leader.editingUserBoard = data.nickname;
        io.to(`${rooms[pin].leader.socketId}`).emit('updateBoard', {canvasData: rooms[pin]._users[data.nickname].canvas, userType:data.nickname});
      }
    });

    // Socket submits their board to alert the leader they are done
    socket.on('submitBoard', data => {
      let pin = sockets[socket.id].room;
      io.to(`${rooms[pin].leader.socketId}`).emit('submittedBoard', {nickname: data.nickname});
    });

    // Leader marks a student's board, send the mark to the student
    socket.on('markBoard', data => {
      let pin = sockets[socket.id].room;
      io.to(`${rooms[pin]._users[data.nickname].socketId}`).emit('markedBoard', {mark: data.mark, nickname: data.nickname});
    });

    // Make sure the socket leaves the socket.io room (can't force a socket to leave a room from the server)
    socket.on('leave', data => { 
      socket.leave(data.pin);
    });

    // Socket disconnects
    socket.on('disconnect', () => {
      // If the socket was in a room
      if (sockets[socket.id].room != '') {
        let pin = sockets[socket.id].room;
        // If the socket was a room leader, close the room
        if (sockets[socket.id].leader) {
          socket.to(pin).emit('roomClosed');
          deleteRoom(pin);
          Log.white('Room ' + pin + ' closed');
        }
        // If the socket was a user in a room, remove them from the room and alert everyone in the room
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

// Start the server
http.listen(3000, () => Log.white('Listening on port 3000!'));