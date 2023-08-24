import { useState, useEffect, useRef } from "react";
import { useAtom } from "react-atomize-store";

const Chat = ({ ws }) => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [userName] = useAtom("username");
  const [messages, setMessages] = useAtom("messages");
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (data) => {
    if (!(data.length >= 1)) return;

    setMessages((prev) => [
      ...prev,
      { date: new Date(), name: userName, message: data },
    ]);
    ws.emit("message", data);
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
        <button className="open" onClick={() => setOpen(true)}>
          Chat
        </button>
      )}

      {open && (
        <div className="chat-popup">
          <div className="container">
            <h3>
              Chat
              <button className="close" onClick={() => setOpen(false)}>
                X
              </button>
            </h3>

            <div ref={messagesContainerRef} className="messages">
              {messages.map((d, i) => (
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

export default Chat;
