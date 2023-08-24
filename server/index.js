import { createServer } from "http";
import { Server } from "socket.io";
import {
  uniqueNamesGenerator,
  adjectives,
  // colors,
  animals,
} from "unique-names-generator";

const username = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
  });
};

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
const messages = new Map();

io.on("connection", (socket) => {
  // console.log(socket.id);

  socket.on("player", (data) => {
    const initBoard = {};
    const name = username();
    const initMessages = Array.from(messages.values()).slice(-30);

    players.set(data.id, { id: data.id, name });

    for (const [key, value] of board) {
      initBoard[key] = value;
    }

    socket.emit("_init", initMessages, name, initBoard);
    io.emit("_count", players.size);
  });

  socket.on("cube", (data) => {
    board.set(data.id, data.color);

    socket.broadcast.emit("_cube", {
      id: data.id,
      color: data.color,
    });
  });

  socket.on("message", (data) => {
    if (!(data.length >= 1) || data.length > 255) return;

    const name = players.get(socket.id)?.name;
    const date = new Date();

    messages.set(name + date, { date, name, message: data });

    socket.broadcast.emit("_message", {
      date,
      name,
      message: data,
    });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("_count", players.size);
  });
});

server.listen(8080);
