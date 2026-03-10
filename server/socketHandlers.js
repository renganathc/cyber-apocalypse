const room = require('./room')
const game = require('./game')

function registerSocket(io, socket) {

    socket.on("create_room", ({ host_id }) => {

        const code = room.createRoom(host_id)
        socket.join(code)
        socket.emit("room_created", { roomCode: code })
        socket.emit("room_update", room.getPlayers(code))

    })

    socket.on("join_room", ({ roomCode, player_name, player_id }) => {

        const status = room.joinRoom(io, roomCode, player_id, player_name, socket.id)
        if (status === "joined") {
            socket.join(roomCode)
            io.to(roomCode).emit("room_update", room.getPlayers(roomCode))
        } else if (status === "rejoined") {
            socket.join(roomCode)
            socket.emit("game_mode")
        } else if (status === "game-ongoing") {
            io.to(socket.id).emit("game_ongoing")
        } else {
            io.to(socket.id).emit("room_not_found")
        }
        
    })

    socket.on("request_game_start", (data) => {

        const room_code = data.roomCode

        if (!(room_code in room.rooms)) return
        if (room.rooms[room_code].zone !== 'lobby') return

        const result = game.switchZone(room_code, "message")
        if (result === "success") {
            const patient_zero_info = game.setPatientZero(room_code)
            if (patient_zero_info === undefined) {
                game.switchZone(room_code, "lobby")
                return
            }
            const { player_name, survivors } = patient_zero_info
            io.to(room_code).emit("message_mode", {tag: "patient-zero", info: {name: player_name, survivors}})
            console.log("Room " + room_code + " starting game")

            setTimeout(() => {
                if (!(room_code in room.rooms)) return
                const result = game.switchZone(room_code, "game")
                if (result === "success") {
                    io.to(room_code).emit("game_mode")
                    console.log("Room " + room_code + " started game successfully")


                    const TICK_RATE = 50
                    const interval = setInterval(() => {
                        if (!(room_code in room.rooms) || room.rooms[room_code].zone === "game_over") {
                            clearInterval(interval)
                            return
                        }
                        const state = game.updateState(room_code)
                        if (!state) {
                            console.log("Room " + room_code + " encountered an issue while game was running. Redirecting room to lobby")
                            // io.to(room_code).emit("lobby_mode")
                            clearInterval(interval)
                            return
                        }
                        if (state.timeLeft <= 0) {
                            game.switchZone(room_code, "game_over")
                            io.to(room_code).emit("game_over_mode", {roomInfo: room.rooms[room_code]})
                            console.log("Room " + room_code + " finished game")
                            clearInterval(interval)
                            return
                        }

                        const inf_result = game.handleInfections(io, room_code, 52)
                        if (inf_result === true) {
                            return
                        }
                        io.to(room_code).emit("game_state", state) // need to modify later to send only to host
                        
                    }, TICK_RATE)


                } else {
                    game.switchZone(room_code, "lobby")
                    console.log("Room " + room_code + " encountered an issue while starting game. Redirecting room to lobby")
                    io.to(room_code).emit("lobby_mode")
                }
            }, 2000)
        }
    })

    socket.on("player_input", ({ roomCode, playerId, inputX, inputY }) => {
        if (roomCode in room.rooms) {
            if (playerId in room.rooms[roomCode].players) {
                room.rooms[roomCode].players[playerId].inputX = inputX
                room.rooms[roomCode].players[playerId].inputY = inputY
            }
        }
    })
}

function deregisterSocket(io, socket_id) {
    console.log("Disconnected from client", socket_id)
    const destroyed_room_code = room.destroyRoom(socket_id)
    if (destroyed_room_code !== undefined) {
        io.to(destroyed_room_code).emit("room_destroyed")
        return
    }
    const result = room.removePlayer(socket_id)
    if (result !== undefined) {
        const { removed_player_id, roomCode } = result
        io.to(roomCode).emit("room_update", room.getPlayers(roomCode))
        return
    }
}

module.exports = { registerSocket, deregisterSocket }