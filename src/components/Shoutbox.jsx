/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";

const Shoutbox = ({ name, msgs, setMsgs, socket }) => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [msg, setMsg] = useState("");
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }

    if (!open) setUnread((prev) => prev + 1);
  }, [msgs]);

  const sendMessage = (data) => {
    if (!(data.length >= 1)) return;

    setMsgs((prev) => [...prev, { date: new Date(), name, message: data }]);
    socket.emit("message", data);
    setMsg("");
  };

  const timeParser = (date) => {
    try {
      const hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
      const minute = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
      return `${hour}:${minute}`;
      // eslint-disable-next-line no-empty
    } catch (_) {}
  };

  return (
    <div className="chat">
      {!open && (
        <button
          className="open"
          onClick={() => {
            setOpen(true);
            setUnread(0);
          }}
        >
          Shoutbox {unread > 0 && <span>{unread}</span>}
        </button>
      )}

      {open && (
        <div className="chat-popup">
          <div className="container">
            <h3>
              Shoutbox
              <button className="close" onClick={() => setOpen(false)}>
                X
              </button>
            </h3>

            <div ref={messagesContainerRef} className="messages">
              {msgs.map((d, i) => (
                <div key={i}>
                  <span className="time">{timeParser(new Date(d.date))} |</span>{" "}
                  <span className="name">{d.name}:</span>{" "}
                  <span className="msg">{d.message}</span>
                </div>
              ))}
            </div>

            <div className="inputs">
              <input
                type="text"
                value={msg}
                maxLength={255}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(msg);
                  }
                }}
              />
              <button onClick={() => sendMessage(msg)}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shoutbox;
