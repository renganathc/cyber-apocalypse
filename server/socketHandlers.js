const rooms = require('./rooms')

function registerSocket(io, socket) {

    socket.on("create_room", () => {

        const code = rooms.createRoom(socket.id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })

    })

    socket.on("join_room", ({ roomCode }) => {
        
    })
}

module.exports = registerSocket