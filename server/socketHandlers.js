const rooms = require('./rooms')

function registerSocket(io, socket) {

    socket.on("create_room", ({ host_id }) => {

        const code = rooms.createRoom(host_id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })

    })

    socket.on("join_room", ({ roomCode, player_name, player_id }) => {

        const status = rooms.joinRoom(roomCode, player_id, player_name, socket.id)
        if (status === "joined") {
            socket.join(roomCode)
            io.to(roomCode).emit("room_update", rooms.getPlayers(roomCode))
        } else {
            io.to(socket.id).emit("room_not_found")
        }
        
    })
}

function deregisterSocket(io, socket_id) {
    console.log("Disconnected from client", socket_id)
    const destroyed_room_code = rooms.destroyRoom(socket_id)
    if (destroyed_room_code !== undefined) {
        io.to(destroyed_room_code).emit("room_destroyed")
        return
    }
    const result = rooms.removePlayer(socket_id)
    if (result !== undefined) {
        const { removed_player_id, roomCode } = result
        io.to(roomCode).emit("room_update", rooms.getPlayers(roomCode))
        return
    }
}

module.exports = { registerSocket, deregisterSocket }