const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
app.use(express.static(publicPath));

//Starting the conexion with Sockets

io.on('connection', (socket) => {
  console.log('New User connected');

  // Join a new Room
  
  socket.on('join', (params, callback) => {
    
    // Exceptions
    
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }
    
    //Success
    
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
    callback();
  });

  //Message creator
  
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage',generateMessage(user.name, message.text));
    }
    callback();

  });
  
  // Locations creator

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if(user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });
  
  // Emails creator
  
  socket.on('createEmail', (newEmail) => {
    console.log('createEmail', newEmail);
  });
  
  // Log out

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
    }
  });
});

// Check runing

server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
})
