import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"
const socket = io("http://localhost:3000")

socket.on("connect", () => {
    console.log("Connected at server: ", socket.id)
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})

socket.on("room_created", (data) => {
   console.log("Room created:", data.roomCode)
})

socket.on("room_update", (room_data) => {
  console.log("players in room...\n", room_data)
})

document.getElementById("createRoom").onclick = () => {
  socket.emit("create_room")
}

document.getElementById("joinRoom").onclick = () => {
  let code = prompt("Enter room code")
  if (code === null || code.trim() === "") {
    alert("Room code cannot be empty")
    return
  }

  let name = prompt("Enter your name")
  if (name === null || name.trim() === "") {
    alert("Name cannot be empty")
    return
  }

  socket.emit("join_room", { roomCode: code.trim(), player_name: name.trim()})
 
}