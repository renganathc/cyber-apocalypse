import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

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
  document.getElementById("players").textContent = JSON.stringify(room_data)
})

socket.on("room_not_found", () => {
  alert("No room with the entered code exists")
  window.location.replace('../index.html')
})

socket.on("room_destroyed", () => {
  alert("Host disconnected. Room destroyed")
  window.location.replace('../index.html')
})