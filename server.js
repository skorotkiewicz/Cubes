/* eslint-disable no-undef */
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

async function createServer() {
  const app = express();
  const server = createHttpServer(app);
  const resolve = (p) => path.resolve(__dirname, p);
  let vite;

  const io = new Server(server, {
    cors: {
      //   origin: ["http://172.20.10.11:5173", "http://127.0.0.1:5173"],
      origin: "*",
    },
    path: "/api/",
  });

  const players = new Map();
  const board = new Map();
  const messages = new Map();

  io.on("connection", (socket) => {
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

  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    app.use((await import("compression")).default());
    app.use(
      (await import("serve-static")).default(resolve("dist/client"), {
        index: false,
      })
    );
  }

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    let template, render;

    try {
      if (!isProd) {
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      } else {
        template = fs.readFileSync(resolve("dist/client/index.html"), "utf-8");
        render = (await import("./dist/server/entry-server.js")).render;
      }

      const appHtml = await render(url);
      const html = template.replace("<!--ssr-outlet-->", appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      !isProd && vite.ssrFixStacktrace(error);
      next(error);
    }
  });

  server.listen(process.env.PORT || 5173);
  //   app.listen(5173);
}

createServer();
