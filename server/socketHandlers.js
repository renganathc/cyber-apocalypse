const rooms = require('./rooms')

function registerSocket(io, socket) {

    socket.on("create_room", () => {

        const code = rooms.createRoom(socket.id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })

    })

    socket.on("join_room", ({ roomCode, player_name }) => {

        rooms.joinRoom(roomCode, socket.id, player_name)
        socket.join(roomCode)
        io.to(roomCode).emit("room_update", rooms.getPlayers(roomCode))
        
    })
}

module.exports = registerSocket