document.getElementById("createRoom").onclick = () => {
  window.location.href = "./host/lobby.html"
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

  let client_id = localStorage.getItem("client_id");
  if (!client_id) {
    client_id = crypto.randomUUID();
    localStorage.setItem("client_id", client_id);
  }

  sessionStorage.setItem("roomCode", code.trim());
  sessionStorage.setItem("player_name", name.trim());

  window.location.href = "./player/lobby.html";
}