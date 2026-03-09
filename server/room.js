rooms = {}

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }

    return code
}

function createRoom(host_id) {
    const code = generateCode()

    rooms[code] = {
        host: host_id,
        zone: 'lobby',
        players: {},
        survivors: 0,
        timeLeft: 120,
        frame: 0
    }

    console.log("room " + code + " created")

    return code
}

function joinRoom(io, room_code, player_id, player_name, socket_id) {
    const player_info = {
        name: player_name,
        socketId : socket_id,
        x: Math.floor(Math.random() * 1920),
        y: Math.floor(Math.random() * 1080),
        vx: 0,
        vy: 0,
        inputX: 0,
        inputY: 0,
        role: 'survivor',
        status: 'active'
    }
    if (room_code in rooms) {

        if (rooms[room_code].zone === "game" || rooms[room_code].zone === "message") {
            if (player_id in rooms[room_code].players) {
                const sID = rooms[room_code].players[player_id].socketId
                const sock = io.sockets.sockets.get(sID)
                if (sock) {
                    sock.disconnect(true)
                }
                rooms[room_code].players[player_id].socketId = socket_id
                rooms[room_code].players[player_id].name = player_name
                console.log("Player " + player_id + " rejoined room " + room_code)
                return "rejoined"
            } else {
                return "game-ongoing"
            }
        } else if (rooms[room_code].zone === "lobby") {
            if (player_id in rooms[room_code].players) {
                const sID = rooms[room_code].players[player_id].socketId
                const sock = io.sockets.sockets.get(sID)
                if (sock) {
                    sock.disconnect(true)
                }
            }
            rooms[room_code].players[player_id] = player_info
            console.log("Player " + player_id + " joined room " + room_code)
            return "joined"
        } else {
            return "not-found"
        }

    } else {
        console.log("Player " + player_id + " tried to join a room that does not exist")
        return "not-found"
    }
}

function removePlayer(socket_id) {
    for (let roomCode in rooms) {
        for (let player_id in rooms[roomCode].players) {
            if (rooms[roomCode].players[player_id].socketId === socket_id && rooms[roomCode].zone === "lobby") {
                console.log("Player " + player_id + " removed")
                delete rooms[roomCode].players[player_id]
                return { player_id, roomCode }
            }
        }
    }
}

function updatePlayerStatus(socket_id, status) {
    for (let roomCode in rooms) {
        for (let player_id in rooms[roomCode].players) {
            if (rooms[roomCode].players[player_id].socketId === socket_id) {
                rooms[roomCode].players[player_id].status = status
            }
        }
    }
}

function destroyRoom(socket_id) {
    for (let roomCode in rooms) {

        if (rooms[roomCode].host === socket_id) {
            console.log("Room " + roomCode + " destroyed")
            delete rooms[roomCode]
            return roomCode
        }

    }
}

function getPlayers(code) {
    return rooms[code]
}

module.exports = { rooms, createRoom, joinRoom, getPlayers, removePlayer, updatePlayerStatus, destroyRoom }