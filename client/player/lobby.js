import { io } from "/node_modules/socket.io-client/dist/socket.io.esm.min.js"

const socket = io("http://localhost:3000")

socket.on("connect", () => {
    console.log("Connected at server: ", socket.id)

    const code = sessionStorage.getItem("roomCode");
    const name = sessionStorage.getItem("player_name");

    console.log(code, name)

    if (!code || !name) {
      alert("An error ocured. Try again")
      window.location.replace = '../index.html'
      return
    }

    socket.emit("join_room", {
      roomCode: code,
      player_name: name
    })
})

socket.on("disconnect", () => {
    console.log("Disconnected from server")
})

socket.on("room_update", (room_data) => {
  console.log("players in room...\n", room_data)
  document.getElementById("players").textContent = JSON.stringify(room_data)
})