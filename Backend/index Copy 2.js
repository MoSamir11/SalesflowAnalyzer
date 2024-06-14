require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: ["https://facial-emotion-recognition-dev-v2.azurewebsites.net", "http://localhost:3000"],
        methods: [ "GET", "POST" ]
    }
})

const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    socket.on("join room", data => {
		let {roomID, email, person} = data
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            //users[roomID].push(socket.id);
			users[roomID].push({"id": socket.id, "email" : email, "role" : person});
        } else {
            //users[roomID] = [socket.id];
			users[roomID] = [{"id": socket.id, "email" : email, "role" : person}];
        }
        socketToRoom[socket.id] = roomID;
        //const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
		const usersInThisRoom = users[roomID].filter(obj => obj.id !== socket.id);
		console.log(usersInThisRoom)
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
		//console.log(payload)
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, role: payload.person });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, role: payload.role });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(process.env.PORT || 3001, () => console.log('server is running on port 8000'));


