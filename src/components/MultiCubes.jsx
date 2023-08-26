import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAtom } from "react-atomize-store";
import Tools from "./Tools";
import Shoutbox from "./Shoutbox";

const MultiCubes = () => {
  const [cubes, setCubes] = useState([]);
  const [currentColor, setCurrentColor] = useState(null);
  const [grid, setGrid] = useState(true);
  const [countUsers, setCountUsers] = useState(0);
  const [, setUserName] = useAtom("username");
  const [, setMessages] = useAtom("messages");
  const [connectStatus, setConnectStatus] = useState(false);
  const [supa, setSupa] = useState(false);

  const ws = useRef(null);

  const selectCube = (id, recv, type) => {
    const rId = recv?.id;
    const rColor = recv?.color;

    if (cubes && cubes[id || rId]) {
      setCubes((prev) => {
        const newCubes = { ...prev };
        delete newCubes[id || rId];
        return newCubes;
      });

      if (type !== 1) sendMessage("cube", { id, color: null });
    } else {
      setCubes((prev) => ({
        ...prev,
        [id || rId]: currentColor || rColor,
      }));

      if (type !== 1) sendMessage("cube", { id, color: currentColor });
    }
  };

  const cubeSize = 25;
  const margin = 1;

  const rows = 25,
    cols = 35;

  const sendMessage = (name, data) => {
    ws.current.emit(name, data);
  };

  useEffect(() => {
    const socket = io(
      import.meta.env.DEV ? "ws://172.20.10.11:5173" : "wss://cubes.fly.dev",
      {
        path: "/api/",
        transports: ["websocket"],
      }
    );

    socket.on("connect", () => {
      setConnectStatus(socket.connected);
      sendMessage("player", { id: socket.id });
    });

    socket.onAny((...data) => {
      if (data[0] === "_cube") {
        selectCube(null, { id: data[1].id, color: data[1].color }, 1);
      }

      if (data[0] === "_count") {
        setCountUsers(data[1]);
      }

      if (data[0] === "_init") {
        setMessages(data[1]);
        setUserName(data[2]);
        setCubes(data[3]);
      }

      if (data[0] === "_message") {
        setMessages((prev) => [...prev, data[1]]);
      }

      if (data[0] === "_supa") {
        setSupa(true);

        setTimeout(() => {
          setSupa(false);
        }, 1000);
      }
    });

    ws.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div
        className={`cube${grid ? " grid" : " nogrid"}`}
        style={{
          width: `${cols * (cubeSize + margin * 2)}px`,
        }}
      >
        {new Array(rows * cols).fill().map((_, i) => (
          <div
            key={i}
            style={{ backgroundColor: cubes && cubes[i] }}
            onClick={() => {
              if (currentColor) {
                selectCube(i);
              }
            }}
          >
            &nbsp;
          </div>
        ))}
      </div>

      <Tools currentColor={currentColor} setCurrentColor={setCurrentColor} />

      <div className="btn">
        <button onClick={() => setGrid((prev) => !prev)}>
          {grid ? "Off Grid" : "On Grid"}
        </button>
        {connectStatus ? (
          <span>Users: {countUsers}</span>
        ) : (
          <span>Connecting...</span>
        )}
        {supa && <span>supa</span>}
      </div>
      {connectStatus && <Shoutbox ws={ws.current} />}
    </div>
  );
};

export default MultiCubes;
