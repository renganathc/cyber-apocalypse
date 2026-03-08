const { rooms } = require('./rooms')

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
        players[randomPlayerId].status = "carrier"
        return randomPlayerId
    }
}

module.exports = { switchZone, setPatientZero }