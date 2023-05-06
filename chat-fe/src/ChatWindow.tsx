
import "./chatwindow.css";
import { useEffect, useCallback, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

export default function ChatWindow() {
    const [talkText, setTalkText] = useState<string>("");

    const [currentChat, setCurrentChat] = useState("");
    const chatTextRef = useRef(null);

    const [socket, setSocket] = useState<Socket>();
    const [connected, setConnected] = useState<boolean>(false);

    //simply send message to server, talk
    const talk = useCallback(() => {
        if (connected) {
            const phrase = talkText;
            socket?.emit("chat_event", phrase);
            setCurrentChat(cc => `${cc} ${phrase}`);
            setTalkText("");
        }
    }, [connected, socket, talkText])


    //wait for socket connect
    const setupSocket = useCallback(() => {
        if (socket) return;
        const socketio = io("http://localhost:3001");
        socketio.on("connect", () => {
            setSocket(socketio);
            setConnected(true);
        });
    }, [socket])

    //set chat event
    useEffect(() => {
        socket?.on("chat_event", (arg) => {
            setCurrentChat(cc => `${cc} ${arg}`);
        });
    }, [socket])

    //start socketio
    useEffect(() => {
        setupSocket();
    }, [])


    return (
        <div className="chatwindow">
            <textarea ref={chatTextRef} value={currentChat} readOnly
            >
            </textarea>
            <input onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    talk();
                }
            }} value={talkText} onChange={(event) => {
                setTalkText(tt => event.target.value);
            }}></input>
        </div>
    )
}

