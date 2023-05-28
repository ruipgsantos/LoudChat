
import "./chatwindow.css";
import { useEffect, useCallback, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { UserMessage } from "./external/UserMessage";
import { CHAT_EVENT, CONNECT_EVENT, TICK_EVENT, USER_EVENT } from "./external/SocketEvents";


export default function ChatWindow() {

    const [userCount, setUserCount] = useState(0);
    const [talkText, setTalkText] = useState<string>("");
    const [currentChat, setCurrentChat] = useState<UserMessage[]>([]);
    const chatTextRef = useRef<any>(null);
    const [socket, setSocket] = useState<Socket>();
    const [loaded, setLoaded] = useState<Boolean>(false);

    const keepToBottom = useCallback(() => {
        setTimeout(() => {
            if (chatTextRef.current) {
                chatTextRef.current.scrollTop = chatTextRef.current?.scrollHeight
            }
        }, 100)
    }, [])

    //simply send message to server, talk
    const talk = useCallback(() => {
        if (socket) {
            const phrase = talkText;
            socket?.emit(CHAT_EVENT, phrase);
            setTalkText("");

            keepToBottom();
        }
    }, [keepToBottom, socket, talkText])


    //wait for socket connect
    const setupSocket = useCallback(() => {
        if (socket) return;
        const socketio = io(process.env.REACT_APP_CHAT_API as string, { withCredentials: true });
        socketio.on("connect", () => {
            setSocket(socketio);
        });

        socketio?.on(CHAT_EVENT, (userMessage: UserMessage) => {
            if (userMessage) {
                setCurrentChat((cc) => {
                    return [...cc, userMessage]
                })
                keepToBottom();
            }
        });

        socketio?.on(CONNECT_EVENT, (userMessages: UserMessage[]) => {
            if (userMessages && userMessages.length > 0) {
                setCurrentChat(userMessages);
                keepToBottom();
            }

            setLoaded(true);

        })

        socketio?.on(TICK_EVENT, () => {
            setCurrentChat((cc) => {
                const aux = [...cc];
                return aux.map((um: UserMessage) => {
                    if (um.size > 0) {
                        um.size--;
                    }
                    return um;
                })
            })
        })

        socketio?.on(USER_EVENT, (svUserCount: number) => {
            if (svUserCount != null) {
                setUserCount(svUserCount);
            }
        })
    }, [keepToBottom, socket])

    //start socketio
    useEffect(() => {
        setupSocket();
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getMessageElements = () => {
        const res: JSX.Element[] = [];

        for (let i = 0; i < currentChat.length; i++) {
            const words = currentChat[i].message.split(' ');
            for (let j = 0; j < words.length; j++) {
                res.push(<span key={`${i}${j}`} style={{ fontSize: currentChat[i].size * 1.5 + 10, transition: "font-size 5s", marginTop: (-1 * currentChat[i].size) }}>{words[j]}</span>)
            }
        }

        return res;
    }

    const getPlaceholder = () => {
        if (userCount < 2) {
            return 'You are alone...';
        } else if (userCount === 2) {
            return 'There is 1 person here...';
        }

        return `There are ${userCount - 1} people here...`;



    }

    return (
        <div className="chatwindow">
            {loaded ? <div className="loadedContainer">
                <div className="chatContainer">
                    <div ref={chatTextRef} className="textArea">
                        {getMessageElements()}
                    </div>
                </div>
                <div className="inputContainer">
                    <input
                        maxLength={50}
                        onSelect={(e) => e.preventDefault()}
                        onSelectCapture={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onDrag={(e) => e.preventDefault()}
                        onDrop={(e) => e.preventDefault()}
                        autoComplete="false"
                        placeholder={getPlaceholder()} onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                talk();
                            }
                        }} value={talkText} onChange={(event) => {
                            setTalkText(tt => event.target.value);
                        }}></input>
                </div>
            </div> : <div className="loadingContainer">
                <div>
                    Loud</div>
                <div>
                    Chat</div>
            </div>}


        </div>
    )
}

