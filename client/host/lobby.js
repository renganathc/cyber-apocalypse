import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://172.50.20.149:3000")

let game
let playerSprites = {}

function startPhaser(){

    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        parent: "phaser_container",
        backgroundColor: "#1a1a1a",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: {
            create,
            update
        }
    }

    game = new Phaser.Game(config)
}

let sceneRef

function create(){
    sceneRef = this
}

function update(){}


function showScreen(screenId){
    document.querySelectorAll(".screen").forEach(s=>{
        s.classList.remove("active")
    })

    document.getElementById(screenId).classList.add("active")
}

socket.on("connect", () => {
    console.log("Connected at server: ", socket.id)

    socket.emit("create_room", {host_id: socket.id})
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})

socket.on("room_created", (data) => {
    console.log("Room created:", data.roomCode)
    document.getElementById("room_code").textContent = "Room Code: " + data.roomCode

    document.getElementById("start_game").onclick = () => {
        socket.emit("request_game_start", { roomCode: data.roomCode })
    }
})

socket.on("room_update", (room_data) => {
    console.log("players in room...\n", room_data)
    document.getElementById("players").textContent = JSON.stringify(room_data)
})

socket.on("message_mode", (data) => {

    showScreen("message_screen")

    console.log(data)

    if(data.tag === "patient-zero"){
        document.getElementById("message_text").textContent = data.info.name + " is Patient Zero..."
        document.getElementById("message_sub_text").textContent = "Survivors: " + data.info.survivors
    }

})

socket.on("game_mode", () => {
    showScreen("game_screen")
    startPhaser()
})

socket.on("game_state", (data) => {

    if (!sceneRef) return

    const serverPlayers = data.players

    for (const playerId in serverPlayers) {

        const player = serverPlayers[playerId]

        const color = player.role === "carrier" ? 0xff0000 : 0x00ff00

        if (!playerSprites[playerId]) {

            const circle = sceneRef.add.circle(player.x, player.y, 25, color)

            const label = sceneRef.add.text(
                player.x,
                player.y - 50,
                player.name,
                {
                    fontSize: "25px",
                    color: "#ffffff",
                    fontStyle: "bold"
                }
            ).setOrigin(0.5).setStroke("#000000", 2)

            playerSprites[playerId] = { circle, label }

        } else {

            const obj = playerSprites[playerId]

            obj.circle.x = player.x
            obj.circle.y = player.y
            obj.circle.fillColor = color

            obj.label.x = player.x
            obj.label.y = player.y - 50
            obj.label.text = player.name

        }
    }

    for (const playerId in playerSprites) {

        if (!(playerId in serverPlayers)) {

            playerSprites[playerId].circle.destroy()
            playerSprites[playerId].label.destroy()

            delete playerSprites[playerId]

        }
    }

})