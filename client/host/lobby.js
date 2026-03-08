import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

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
})

socket.on("game_state", (data) => {
    console.log(data)
})