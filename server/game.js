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
        if (playerIds.length < 2) {
            return undefined
        }
        rooms[room_code].survivors = playerIds.length - 1
        const randomIndex = Math.floor(Math.random() * playerIds.length)
        const randomPlayerId = playerIds[randomIndex]
        players[randomPlayerId].role = "carrier"
        rooms[room_code].players[randomPlayerId].carrier_pos = 0
        return { player_name: players[randomPlayerId].name, survivors: rooms[room_code].survivors }
    }
}

function updateState(room_code) {
    if (room_code in rooms) {
        // console.log(rooms[room_code].timeLeft)
        let state = {
            timeLeft: rooms[room_code].timeLeft,
            players: {}
        }

        const k = 3
        const ACCEL = 0.6*Math.sqrt(k)
        const FRICTION = 0.9
        const MAX_SPEED = 6*k
        
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

function handleInfections(io, room_code, dist) {
    if (room_code in rooms) {
        const carriers = []
        const survivors = []
        for (let playerId in rooms[room_code].players) {
            if (rooms[room_code].players[playerId].role === "carrier") carriers.push(playerId)
            else survivors.push(playerId)
        }

        const dis2 = dist**2

        for (let carrier of carriers)  {
            for (let survivor of survivors) {
                const cx = rooms[room_code].players[carrier].x
                const cy = rooms[room_code].players[carrier].y
                const sx = rooms[room_code].players[survivor].x
                const sy = rooms[room_code].players[survivor].y

                if ((cx - sx)**2 + (cy - sy)**2 <= dis2) {

                    for (let playerId in rooms[room_code].players) {
                        rooms[room_code].players[playerId].vx = 0
                        rooms[room_code].players[playerId].vy = 0
                        rooms[room_code].players[playerId].inputX = 0
                        rooms[room_code].players[playerId].inputY = 0
                    }

                    rooms[room_code].players[survivor].role = "carrier"
                    rooms[room_code].players[survivor].carrier_pos = Object.keys(rooms[room_code].players).length - rooms[room_code].survivors
                    rooms[room_code].survivors--
                    rooms[room_code].zone = "message"
                    io.to(room_code).emit("message_mode", {tag: "infected", info: {carrier: rooms[room_code].players[carrier].name, infected: rooms[room_code].players[survivor].name, survivors: rooms[room_code].survivors}})

                    setTimeout(() => {
                        if (!(room_code in rooms)) return false
                        rooms[room_code].timeLeft += 2
                        rooms[room_code].frame -= 10
                        if (rooms[room_code].survivors > 0) {
                            rooms[room_code].zone = "game"
                            io.to(room_code).emit("game_mode")
                        } else {
                            rooms[room_code].zone = "game_over"
                            io.to(room_code).emit("game_over_mode", {roomInfo: rooms[room_code]})
                            console.log("Room " + room_code + " finished game")
                        }
                    }, 2000)

                    return true
                }

            }
        }
    }
    return false
}

module.exports = { switchZone, setPatientZero, updateState, handleInfections }