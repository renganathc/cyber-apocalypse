rooms = {

}

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
        players: []
    }

    return code
}

function joinRoom(room_code, player_id, player_name) {
    player_info = {
        playerID: player_id,
        playerName: player_name
    }
    rooms[room_code].players.push(player_info)
}

function getPlayers(code) {
    return rooms[code].players
}

module.exports = { createRoom, joinRoom, getPlayers }