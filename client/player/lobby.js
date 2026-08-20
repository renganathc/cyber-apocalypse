import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"
import { BACKEND_URL } from "../config.js"

const socket = io(BACKEND_URL)

function showScreen(screenId){
    document.querySelectorAll(".screen").forEach(s=>{
        s.classList.remove("active")
    })

    document.getElementById(screenId).classList.add("active")
}

socket.on("connect", () => {
    console.log("Connected at server: ", socket.id)

    const code = sessionStorage.getItem("roomCode");
    const name = sessionStorage.getItem("player_name");
    const client_id = localStorage.getItem("client_id");

    console.log(code, name, client_id)

    if (!code || !name || !client_id) {
      alert("An error ocured. Try again")
      window.location.replace('../index.html')
    }

    socket.emit("join_room", {
      roomCode: code,
      player_name: name,
      player_id: client_id
    })
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})

socket.on("room_update", (room_data) => {
  console.log("players in room...\n", room_data)
  socket.on("room_update", (room_data) => {

  const list = document.getElementById("players")

  list.innerHTML = ""

  for (const playerId in room_data.players) {

    const player = room_data.players[playerId]

    const li = document.createElement("li")

    li.textContent = player.name

    list.appendChild(li)

  }

})
})

socket.on("room_not_found", () => {
  alert("No room with the entered code exists")
  window.location.replace('../index.html')
})

socket.on("game_ongoing", () => {
  alert("Players in the room are currently in a game. Cannot join room")
  window.location.replace('../index.html')
})

socket.on("room_destroyed", () => {
  alert("Host disconnected. Room destroyed")
  window.location.replace('../index.html')
})

socket.on("message_mode", (data) => {

    const text = document.getElementById("message_text")

    text.style.transform="scale(0.6)"
    text.style.opacity="0"

    setTimeout(()=>{
    text.style.transition="all .4s ease"
    text.style.transform="scale(1)"
    text.style.opacity="1"
    },50)

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

let inputX = 0
let inputY = 0

socket.on("game_mode", () => {
    showScreen("controller_screen")

    requestAnimationFrame(() => {
        const manager = nipplejs.create({
        zone: document.getElementById("joystick_zone"),
        mode: "static",
        position: { left: "50%", top: "50%" },
        color: "orange",
        size: 180
      })
    

      manager.on("move", (evt, data) => {

          const angle = data.angle.radian
          const distance = Math.min(data.distance / 50, 1)

          inputX = Math.cos(angle) * distance
          inputY = Math.sin(angle) * distance

          socket.emit("player_input", {
            roomCode: sessionStorage.getItem("roomCode"),
            playerId: localStorage.getItem("client_id"),
            inputX,
            inputY: -1*inputY
          })

      })

      manager.on("end", () => {
        
          inputX = 0
          inputY = 0

          socket.emit("player_input", {
            roomCode: sessionStorage.getItem("roomCode"),
            playerId: localStorage.getItem("client_id"),
            inputX,
            inputY
          })

      })

    })
})

socket.on("game_over_mode", () => {
    window.location.replace('../index.html')
})