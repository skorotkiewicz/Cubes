/* eslint-disable no-undef */
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { RateLimiterMemory } from "rate-limiter-flexible";
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

const width = 1024;
const height = 1024;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
// const imagePath = path.join(__dirname, "public/place.png");
const imagePath = "/data/place.png";
const initialColor = { r: 255, g: 255, b: 255, alpha: 1 };
let lastChange = new Date();

async function getInitialArray(width, height) {
  if (fs.existsSync(imagePath)) {
    const image = await sharp(imagePath).ensureAlpha().raw().toBuffer();
    return new Uint8ClampedArray(image);
  } else {
    // console.log("Error reading data, creating new blank image");
    const blankImage = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: initialColor,
      },
    })
      .png()
      .raw()
      .toBuffer();
    return blankImage;
  }
}

async function downloadImage(canvasArray) {
  const image = sharp(canvasArray, {
    raw: {
      width,
      height,
      channels: 4,
    },
  });
  await image.toFile(imagePath);
}

async function main() {
  const canvasArray = await getInitialArray(width, height);
  await downloadImage(canvasArray);

  setInterval(async () => {
    const now = new Date();
    const needsToUpdate = now.getTime() - lastChange.getTime() < 1000;

    if (needsToUpdate) {
      await downloadImage(canvasArray); // Updating local image
    }
  }, 1000);

  const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 points
    duration: 1, // per second
  });

  const app = express();
  const server = createHttpServer(app);
  const resolve = (p) => path.resolve(__dirname, p);
  let vite;

  const io = new Server(server, {
    cors: {
      origin: ["http://172.20.10.11:5173", "https://cubes.fly.dev"],
    },
    path: "/api/",
    transports: ["websocket"],
  });

  const players = new Map();
  const messages = new Map();

  io.on("connection", (socket) => {
    socket.on("player", (data) => {
      const name = username();
      const initMessages = Array.from(messages.values()).slice(-30);

      players.set(data.id, { id: data.id, name });

      socket.emit("_init", initMessages, name);
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

    socket.on("pixel", async (pixel) => {
      // console.log("Recieved pixel: ", pixel);
      try {
        await rateLimiter.consume(socket.handshake.headers["x-real-ip"]);
        const [x, y, r, g, b] = pixel;
        const index = (width * y + x) * 4;

        const original_r = canvasArray[index];
        const original_g = canvasArray[index + 1];
        const original_b = canvasArray[index + 2];

        if (original_r !== r || original_g !== g || original_b !== b) {
          canvasArray[index] = r;
          canvasArray[index + 1] = g;
          canvasArray[index + 2] = b;
          canvasArray[index + 3] = 255;
          lastChange = new Date();
          socket.broadcast.emit("_pixel", pixel);
        }
      } catch (rejRes) {
        socket.disconnect(true);
      }
    });

    socket.on("disconnect", async () => {
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

  app.use(express.static("/data"));
  // app.use("/", express.static(path.join(__dirname, "public")));

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

      const appHtml = await render({ path: url });
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

main();
