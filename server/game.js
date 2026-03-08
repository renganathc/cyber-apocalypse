const { rooms } = require('./room')

function switchZone(room_code, zone) {
    if (room_code in rooms) {
        rooms[room_code].zone = zone
        return "success"
    } else {
        return "room_not_found"
    }
}

function setPatientZero(room_code) {
    if (room_code in rooms) {
        const players = rooms[room_code].players
        const playerIds = Object.keys(players)
        if (playerIds.length === 0) {
            return undefined
        }
        const randomIndex = Math.floor(Math.random() * playerIds.length)
        const randomPlayerId = playerIds[randomIndex]
        players[randomPlayerId].role = "carrier"
        return { player_name: players[randomPlayerId].name, survivors: playerIds.length }
    }
}

function updateState(room_code) {
    if (room_code in rooms) {
        console.log(rooms[room_code].timeLeft)
        let state = {
            timeLeft: rooms[room_code].timeLeft,
            players: {}
        }
        for (let playerId in rooms[room_code].players) {
            const { name, x, y, role } = rooms[room_code].players[playerId]
            state.players[playerId] = {
                name,
                x,
                y,
                role
            }
        }
        rooms[room_code].frame++
        if (rooms[room_code].frame === 20) {
            rooms[room_code].timeLeft--
            rooms[room_code].frame = 0
        }
        return state
    }
}

module.exports = { switchZone, setPatientZero, updateState }