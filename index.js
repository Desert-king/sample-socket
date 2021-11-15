const app = require('express')();
var cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http,{
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || 3000;

app.use(cors())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


let rooms = [];
let roomsusers = [];
let checkUsers = [];
let linkedUsers = [];
let usernames = [];


function generateRandomString(length = 15)
{
    characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    charactersLength = strlen(characters);
    randomString = '';
    for (i = 0; i < length; i++) {
        randomString += characters[rand(0, charactersLength - 1)];
    }
    return randomString;
}
io.on('connection', (socket) => {

  
  socket.on("adduser", (data)=>{
      console.log(data);
        // console.log(socket.handshake.query['username']);
        _sock_username =data.username;
        _sock_useremail =data.useremail;

        _sock_username =(_sock_username == '') ? _sock_useremail : _sock_useremail;

        if (!rooms.includes(_sock_useremail)) {
            socket.username = _sock_username;
            socket.room = _sock_username;

            rooms.push(_sock_username); 

            usernames[_sock_username] = _sock_username;

            socket.join(_sock_username);

        }
        socket.emit('updatechat', _sock_useremail, "you have connected to _sock_useremail");
        socket.broadcast.to(_sock_username).emit('updatechat', 'SERVER', _sock_username + ' has connected to this room');
        socket.emit('updaterooms', rooms, _sock_username);
        socket.broadcast.emit('updaterooms', rooms);

        console.log(rooms);

  });

    socket.on('sendchat', data => {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
        socket.emit('otherMessage', data, socket.room);
  });


     socket.on('switchRoom', newroom => {
        socket.leave(socket.room);
        socket.join(newroom);

        socket.emit('updatechat', 'SERVER', 'you have connected to ' . newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);


        roomsusers.unshift(newroom+' . '+socket.username);
        console.log(roomsusers);
        socket.broadcast.emit('roomusers', roomsusers, socket.username);
        //socket.broadcast.emit('roomusers', newroom, socket.username);

    });

    
    // when the user disconnects.. perform this
    socket.on('disconnect', data => {


        // remove the username from global usernames list
        // delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has discsssonnected');
        delete rooms[socket.room];
        // unset(rooms[socket.room]);
        socket.leave(socket.room);
        delete usernames[socket.username];
        // unset(usernames[socket.username]);

        socket.emit('updaterooms', rooms);
        io.sockets.emit('updateusers', usernames);
        //var_dump(socket.room);

        rooms.splice(rooms.indexOf(socket.room), 1);

        // if ((key = array_search(socket.room, rooms)) !== false) {
        //     unset(rooms[key]);
        // }
        socket.broadcast.emit('updaterooms', rooms);

        console.log(socket.username);

    });
    

    
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:{port}/`);
});
