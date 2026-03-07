const rooms = require('./rooms')

function registerSocket(io, socket) {

    socket.on("create_room", ({ host_id }) => {

        const code = rooms.createRoom(host_id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })

    })

    socket.on("join_room", ({ roomCode, player_name, player_id }) => {

        rooms.joinRoom(roomCode, player_id, player_name)
        socket.join(roomCode)
        io.to(roomCode).emit("room_update", rooms.getPlayers(roomCode))
        
    })
}

module.exports = registerSocket