import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { socketUrl } from "../config";

const useSocket = () => {
  const [socket, setSocket] = useState();

  const connectToSocket = () => {
    const socket = io(socketUrl, {
      reconnection: false,
      path: "/api/",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setSocket(socket);
      socket.emit("player", { id: socket.id });
    });

    socket.on("disconnect", (reason) => {
      setSocket(undefined);
      alert("Socket disconected, reason: " + reason);
    });

    socket.on("connect_error", () => {
      setSocket(undefined);
      alert("Error connecting to socket");
    });
    return socket;
  };

  useEffect(() => {
    const socket = connectToSocket();
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);
  return { socket, setSocket, connectToSocket };
};

export default useSocket;
