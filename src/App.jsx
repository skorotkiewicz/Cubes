import { useCallback, useEffect, useRef, useState } from "react";
import Panzoom from "panzoom";
import { RgbColorPicker } from "react-colorful";
import { height, imageUrl, width } from "./config";
import useSocket from "./hooks/useSocket";
import placePixel from "./assets/placePixel.svg";
import copyColor from "./assets/copyColor.svg";
import Shoutbox from "./components/Shoutbox";
import "./App.scss";

function App() {
  const { socket, setSocket, connectToSocket } = useSocket();

  const canvasRef = useRef(null);
  const ref = useRef(null);
  const canvasWrapper = useRef(null);
  const [ctx, setCtx] = useState();
  // const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState({ r: 0, g: 0, b: 0 });
  const [openPicker, setOpenPicker] = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [countUsers, setCountUsers] = useState(0);

  const setPixel = useCallback(
    (x, y, color, emit = false) => {
      if (ctx && socket) {
        ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},255)`;
        ctx.fillRect(x, y, 1, 1);
        if (emit) {
          socket.emit("pixel", [x, y, color.r, color.g, color.b]);
        }
      }
    },
    [ctx, socket]
  );

  useEffect(() => {
    if (socket) {
      socket.on("_pixel", (pixel) => {
        const [x, y, r, g, b] = pixel;
        setPixel(x, y, { r, g, b });
      });

      socket.onAny((...data) => {
        switch (data[0]) {
          case "_count":
            setCountUsers(data[1]);
            break;

          case "_init":
            setMessages(data[1]);
            setUsername(data[2]);
            break;

          case "_message":
            setMessages((prev) => [...prev, data[1]]);
            break;

          default:
            break;
        }
      });
    }
  }, [socket]);
  // }, [socket, setPixel]);

  useEffect(() => {
    const img = new Image(width, height);
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
    };
  }, [ctx, socket]);

  useEffect(() => {
    const div = ref.current;
    const initialZoom = 2;
    if (div) {
      const panzoom = Panzoom(div, {
        zoomDoubleClickSpeed: 1,
        initialZoom,
      });
      panzoom.moveTo(
        window.innerWidth / 2 - (width / 2) * initialZoom,
        window.innerHeight / 2 - (height / 2) * initialZoom
      );

      return () => {
        panzoom.dispose();
      };
    }
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapper.current;
    if (canvas && wrapper) {
      const ctx = canvas.getContext("2d");
      setCtx(ctx);

      const putPixel = (ev) => {
        ev.preventDefault();
        if (ev.ctrlKey && ctx) {
          const [x, y] = [ev.offsetX - 1, ev.offsetY - 1];
          const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
          setColor({ r, g, b });
        } else {
          const [x, y] = [ev.offsetX - 1, ev.offsetY - 1];
          setPixel(x, y, color, true);
        }
      };

      const copyColor = (ev) => {
        ev.preventDefault();
        if (ctx) {
          if (ev.button === 1) {
            const [x, y] = [ev.offsetX - 1, ev.offsetY - 1];
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            setColor({ r, g, b });
          }
        }
      };

      // const setCursor = (ev) => {
      //   const [x, y] = [ev.offsetX - 1, ev.offsetY - 1];
      //   setCursorPos({ x, y });
      // };

      wrapper.addEventListener("contextmenu", putPixel);
      wrapper.addEventListener("auxclick", copyColor);
      // wrapper.addEventListener("mousemove", setCursor);
      return () => {
        wrapper.removeEventListener("contextmenu", putPixel);
        wrapper.removeEventListener("auxclick", copyColor);
        // wrapper.removeEventListener("mousemove", setCursor);
      };
    }
  }, [color, setColor, setPixel]);

  return (
    <div className="App">
      {!socket && (
        <div className="connection">
          <span>Not connected</span>
          <button
            onClick={() => {
              const socket = connectToSocket();
              setSocket(socket);
            }}
          >
            Reconnect
          </button>
        </div>
      )}
      {socket && (
        <>
          <div className="Canvas">
            <div className="_c" ref={ref}>
              <div className="ctxw" ref={canvasWrapper}>
                <canvas
                  id="canvas"
                  width={width}
                  height={height}
                  className="canvas"
                  ref={canvasRef}
                >
                  Canvas not supported on your browser.
                </canvas>
              </div>
            </div>
          </div>

          <div className="Tools">
            <label className="inputColor">
              <span>Color</span>
              {openPicker && (
                <RgbColorPicker
                  className="picker"
                  color={color}
                  onChange={setColor}
                />
              )}
              <button
                onClick={() => setOpenPicker((prev) => !prev)}
                style={{
                  backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                }}
              />
            </label>
            <div className="Controls">
              <span>Controls</span>
              <div>
                <img src={copyColor} alt="Copy color" />
                Copy color
              </div>
              <div>
                <img src={placePixel} alt="Place pixel" />
                Place pixel
              </div>
            </div>
            <div className="Infos">
              <div className="count">Users: {countUsers}</div>
              {/* <div className="title">Cursor position</div>
              <div className="infoBox">
                <div className="posBox">
                  <span className="posName">X:</span>
                  <span className="pos">{cursorPos.x}</span>
                </div>
                <div className="posBox">
                  <span className="posName">Y:</span>
                  <span className="pos">{cursorPos.y}</span>
                </div>
              </div> */}
            </div>
          </div>
          <Shoutbox
            name={username}
            msgs={messages}
            setMsgs={setMessages}
            socket={socket}
          />
        </>
      )}
    </div>
  );
}

export default App;
