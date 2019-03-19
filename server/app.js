const express = require('express');
const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const Leader = require('./helpers/leader.js');
const User = require('./helpers/user.js');
const Room = require('./helpers/room.js');
const Log = require('./helpers/log.js');

app.get('/', (req, res) => {
    res.send('This is the server.');
});

let rooms = {};

io.on('connection', socket => {
    socket.on('my other event', data => {
      console.log(data);
    });
    Log.blue('CONNECTION');
  });

http.listen(3000, () => Log.white('Listening on port 3000!'));