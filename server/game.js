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

        const ACCEL = 0.6
        const FRICTION = 0.9
        const MAX_SPEED = 6
        
        for (let playerId in rooms[room_code].players) {
            const p = rooms[room_code].players[playerId]

            p.vx += p.inputX * ACCEL
            p.vy += p.inputY * ACCEL
            p.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vx))
            p.vy = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vy))
            p.vx *= FRICTION
            p.vy *= FRICTION
            p.x += p.vx
            p.y += p.vy
            p.x = Math.max(0, Math.min(1920, p.x))
            p.y = Math.max(0, Math.min(1080, p.y))

            const { name, x, y, role } = p
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