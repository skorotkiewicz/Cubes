import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: ["http://172.20.10.11:5173", "http://127.0.0.1:5173"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  },
  path: "/api/",
});

// socket.emit(); // to sender
// to all clients in the current namespace except the sender
// socket.broadcast.emit()
// io.emit() // to all connected clients

const players = new Map();
const board = new Map();

io.on("connection", (socket) => {
  // console.log(socket.id);

  socket.on("player", (data) => {
    const json = {};
    players.set(data.id, { id: data.id });

    for (const [key, value] of board) {
      json[key] = value;
    }

    socket.emit("_initboard", json);
  });

  socket.on("cube", (data) => {
    board.set(data.id, data.color);

    socket.broadcast.emit("_cube", {
      id: data.id,
      color: data.color,
    });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
  });
});

server.listen(8080);
