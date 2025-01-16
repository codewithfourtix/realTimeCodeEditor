import "./App.css";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";
import e from "express";

const socket = io("http://localhost:5000");

const App = () => {
  const [Joined, setJoined] = useState(false);
  const [RoomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("//Start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });
    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });
    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if ((RoomId, userName)) {
      socket.emit("join", RoomId, userName);
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setLanguage("javascript");
    setCode("//Start code here");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(RoomId);
    setCopySuccess("Copied!");
    setTimeout(() => {
      setCopySuccess("");
    }, 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { RoomId, code: newCode });
    socket.emit("typing", { RoomId, userName });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { RoomId, language: newLanguage });
  };

  if (!Joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join-Code Room</h1>
          <input
            type="text"
            placeholder="Room id"
            value={RoomId}
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }
  return (
    <div className="editor-environment">
      <div className="side-bar">
        <div className="room-info">
          <h2>Code Room: {RoomId}</h2>
          <button onClick={copyRoomId}>Copy Room Id</button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3>Users in Room: </h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
          <li>Ali Zulfiqar</li>
        </ul>
        <p className="typing-indicator">{typing}</p>
        <select
          id="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="C++">C++</option>
          <option value="java">Java</option>
          <option value="Python">Python</option>
        </select>
        <button className="leave-room" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editor-wrapper">
        <Editor
          height={"100%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: {
              enabled: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
