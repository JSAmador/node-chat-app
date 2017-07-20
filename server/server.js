const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New User connected');

  socket.emit('newMessage', {
    from: 'Cluj',
    text: 'Hey what is going on',
    createdAt: 123123
  });

  socket.on('createMessage', (message) => {
    console.log('createdMessage', message);
  });
  socket.on('createEmail', (newEmail) => {
    console.log('createEmail', newEmail);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});


server.listen(port, () => {
  console.log(`Server is up at port ${port}`);
})
