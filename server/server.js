const { Server } = require('socket.io')
const express = require('express')
const http = require('http')
const cors = require('cors')
const { registerSocket, deregisterSocket } = require("./socketHandlers")

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})


io.on("connection", (socket) => {
    console.log("Connected at client: ", socket.id)

    socket.on("disconnect", () => {
        deregisterSocket(io, socket.id)
    })

    registerSocket(io, socket)
})

server.listen(3000, () => {
    console.log("Server is listening on port 3000")
})