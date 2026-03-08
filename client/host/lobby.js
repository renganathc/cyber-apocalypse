import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

let game
let playerSprites = {}

function startPhaser(){

    const config = {
        type: Phaser.AUTO,
        width: 960,
        height: 540,
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

    if(!sceneRef) return

    const serverPlayers = data.players

    for(const playerId in serverPlayers){

        const player = serverPlayers[playerId]

        if(!playerSprites[playerId]){

            playerSprites[playerId] =
                sceneRef.add.circle(player.x, player.y, 20, 0x00ff00)

        }else{

            playerSprites[playerId].x = player.x
            playerSprites[playerId].y = player.y

        }
    }

    for(const playerId in playerSprites){

        if(!(playerId in serverPlayers)){

            playerSprites[playerId].destroy()
            delete playerSprites[playerId]

        }

    }

})