
import "./chatwindow.css";
import { useEffect, useCallback, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

const CHAT_EVENT: string = process.env.REACT_APP_CHAT_EVENT || "chat_event";

export default function ChatWindow() {
    const [talkText, setTalkText] = useState<string>("");

    const [currentChat, setCurrentChat] = useState("");
    const chatTextRef = useRef<any>(null);

    const [socket, setSocket] = useState<Socket>();
    const [connected, setConnected] = useState<boolean>(false);

    const keepToBottom = useCallback(() => {
        setTimeout(() => {
            chatTextRef.current!.scrollTop = chatTextRef.current?.scrollHeight
        }, 100)
    }, [])

    //simply send message to server, talk
    const talk = useCallback(() => {
        if (connected) {
            const phrase = talkText;
            socket?.emit(CHAT_EVENT, phrase);
            setCurrentChat(cc => `${cc} ${phrase}`);
            setTalkText("");

            keepToBottom();
        }
    }, [connected, keepToBottom, socket, talkText])


    //wait for socket connect
    const setupSocket = useCallback(() => {
        if (socket) return;
        const socketio = io(process.env.REACT_APP_CHAT_API as string);
        socketio.on("connect", () => {
            setSocket(socketio);
            setConnected(true);
        });
    }, [socket])

    //set chat event
    useEffect(() => {
        socket?.on(CHAT_EVENT, (arg) => {
            setCurrentChat(cc => `${cc} ${arg}`);
            keepToBottom();
        });
    }, [keepToBottom, socket])

    //start socketio
    useEffect(() => {
        setupSocket();
    }, [])


    return (
        <div className="chatwindow">
            <div className="chatContainer">
                <textarea ref={chatTextRef} value={currentChat} readOnly
                >
                </textarea>
            </div>
            <div className="inputContainer">
                <input onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        talk();
                    }
                }} value={talkText} onChange={(event) => {
                    setTalkText(tt => event.target.value);
                }}></input>
            </div>
        </div>
    )
}

