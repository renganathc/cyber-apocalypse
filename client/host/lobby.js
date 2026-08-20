import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"
import { BACKEND_URL } from "../config.js"

const socket = io(BACKEND_URL)

let game
let playerSprites = {}

const buildings = [
  { x: 264, y: 172, width: 359, height: 343 },
  { x: 1103, y: 329, width: 360, height: 524 }
]

function startPhaser(){

    const config = {
        type: Phaser.AUTO,
        width: 1752,
        height: 1012,
        parent: "phaser_container",
        backgroundColor: "#1a1a1a",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: {
            preload,
            create
        }
    }

    game = new Phaser.Game(config)
}

let sceneRef

function preload(){
    this.load.image("map", "./assets/city_map.png")
    this.load.image("buil1", "./assets/buil_1.png")
    this.load.image("buil2", "./assets/buil_2.png")
}

function create(){
    sceneRef = this
    
    const buil1 = this.add.image(buildings[0].x + buildings[0].width/2, buildings[0].y + buildings[0].height/2, "buil1")
    const buil2 = this.add.image(buildings[1].x + buildings[1].width/2, buildings[1].y + buildings[1].height/2, "buil2")

    buil1.setDepth(-1)
    buil2.setDepth(-1)
    buil1.setDisplaySize(buildings[0].width, buildings[0].height)
    buil2.setDisplaySize(buildings[1].width, buildings[1].height)
}

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
    
    const playerList = document.getElementById("players")

    playerList.innerHTML = ""

    for (const playerId in room_data.players) {

        const player = room_data.players[playerId]
        const li = document.createElement("li")
        li.textContent = player.name
        playerList.appendChild(li)
    }
})

socket.on("message_mode", (data) => {

    showScreen("message_screen")

    console.log(data)

    if(data.tag === "patient-zero"){
        document.getElementById("message_text").textContent = data.info.name + " is Patient Zero..."
        document.getElementById("message_sub_text").textContent = "Survivors: " + data.info.survivors
    } else if(data.tag === "infected") {
        document.getElementById("message_text").textContent = data.info.infected + " was Infected by " + data.info.carrier
        document.getElementById("message_sub_text").textContent = "Survivors: " + data.info.survivors
    }

})

socket.on("game_mode", () => {
    showScreen("game_screen")
    startPhaser()
})

socket.on("game_state", (data) => {

    if (!sceneRef) return

    const remainingTime = data.timeLeft

    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60

    document.getElementById("game_timer").textContent =
        minutes + ":" + seconds.toString().padStart(2,"0")

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

socket.on("game_over_mode", ({ roomInfo }) => {
    showScreen("results_screen")
    console.log(roomInfo)
    const sortedPlayers = Object.values(roomInfo.players)
            .filter((p) => p.carrier_pos !== -1)
            .sort((a, b) => b.carrier_pos - a.carrier_pos)

    const survivors = Object.values(roomInfo.players)
            .filter((p) => p.carrier_pos === -1)

    for (const player of survivors) {
        const element = document.createElement("li")
        element.textContent = "Survivor - " + player.name
        document.getElementById("player_ranks").appendChild(element)
    }

    for (const player of sortedPlayers) {
        const element = document.createElement("li")
        element.textContent = (Object.keys(roomInfo.players).length - player.carrier_pos) + " - " + player.name
        document.getElementById("player_ranks").appendChild(element)
    }
})