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
        players: {}
    }

    console.log("room " + code + " created")

    return code
}

function joinRoom(io, room_code, player_id, player_name, socket_id) {
    const player_info = {
        name: player_name,
        socketId : socket_id,
        role: 'survivor',
        status: 'active'
    }
    if (room_code in rooms) {
        if (player_id in rooms[room_code].players) {
            const sID = rooms[room_code].players[player_id].socketId
            io.sockets.sockets.get(sID).disconnect(true)
        }
        console.log("Player " + player_id + " joined room " + room_code)
        rooms[room_code].players[player_id] = player_info
        return "joined"
    } else {
        console.log("Player " + player_id + " tried to join a room that does not exist")
        return "not_found"
    }
}

function removePlayer(socket_id) {
    for (let roomCode in rooms) {
        for (let player_id in rooms[roomCode].players) {
            if (rooms[roomCode].players[player_id].socketId === socket_id) {
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