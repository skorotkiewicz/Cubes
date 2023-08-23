import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Tools from "./Tools";

const MultiCubes = () => {
  const [cubes, setCubes] = useState([]);
  const [currentColor, setCurrentColor] = useState(null);
  const [grid, setGrid] = useState(true);
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
      import.meta.env.DEV
        ? "ws://172.20.10.11:8080"
        : import.meta.env.VERCEL_URL,
      {
        path: "/api/",
      }
    );

    socket.on("connect", () => {
      sendMessage("player", { id: socket.id });
    });

    socket.onAny((...data) => {
      if (data[0] === "_initboard") {
        setCubes(data[1]);
      }

      if (data[0] === "_cube") {
        selectCube(null, { id: data[1].id, color: data[1].color }, 1);
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
      </div>
    </div>
  );
};

export default MultiCubes;
