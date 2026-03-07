import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

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
})

socket.on("room_update", (room_data) => {
  console.log("players in room...\n", room_data)
  document.getElementById("players").textContent = JSON.stringify(room_data)
})