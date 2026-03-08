const rooms = require('./rooms')
const game = require('/game')

function registerSocket(io, socket) {

    socket.on("create_room", ({ host_id }) => {

        const code = rooms.createRoom(host_id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })
        socket.emit("room_update", rooms.getPlayers(code))

    })

    socket.on("join_room", ({ roomCode, player_name, player_id }) => {

        const status = rooms.joinRoom(io, roomCode, player_id, player_name, socket.id)
        if (status === "joined") {
            socket.join(roomCode)
            io.to(roomCode).emit("room_update", rooms.getPlayers(roomCode))
        } else {
            io.to(socket.id).emit("room_not_found")
        }
        
    })

    socket.on("request_start_game", ({ room_code }) => {

        if (!(room_code in rooms)) return
        if (rooms[room_code].zone !== "lobby") return

        const result = game.switchZone(room_code, "message")
        if (result === "success") {
            const player_id = game.setPatientZero(room_code)
            if (player_id === undefined) {
                game.switchZone(room_code, "lobby")
                return
            }
            io.to(room_code).emit("message_mode", {tag: "patient-zero", info: player_id})
            console.log("Room " + room_code + " started game")

            setTimeout(() => {
                if (!(room_code in rooms)) return
                const result = game.switchZone(room_code, "game")
                if (result === "success") {
                    io.to(room_code).emit("game_mode")
                } else {
                    game.switchZone(room_code, "lobby")
                    io.to(room_code).emit("lobby_mode")
                }
            }, 2000)
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