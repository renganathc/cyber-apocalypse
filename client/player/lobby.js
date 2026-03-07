import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

socket.on("connect", () => {
    console.log("Connected at server: ", socket.id)
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})

socket.on("room_update", (room_data) => {
  console.log("players in room...\n", room_data)
  document.getElementById("players").textContent = JSON.stringify(room_data)
})



document.getElementById("join_btn").onclick = () => {

  const code = document.getElementById("room_code_input").value.trim()
  const name = document.getElementById("player_name_input").value.trim()

  if (!code) {
    alert("Room code cannot be empty")
    return
  }

  if (!name) {
    alert("Name cannot be empty")
    return
  }

  socket.emit("join_room", {
    roomCode: code,
    player_name: name
  })
}