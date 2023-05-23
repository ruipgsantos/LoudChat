import { Server, Socket } from "socket.io";
import { NotificationSession } from "../interfaces/notification.interface";
import { ChatFrequencyService } from "./chat-frequency.service";
import Observer from "../interfaces/observer.interface";
import { ChatCacheService } from "./chat-cache.service";

export default class ChatNotificationService implements Observer {
  readonly CHAT_ROOM = "chat_room";
  readonly CHAT_EVENT = "chat_event";
  readonly TICK_EVENT = "tick_event";
  readonly CONNECT_EVENT = "connect_event";

  private _ioServer: Server;
  private _chatFrequencyService: ChatFrequencyService;

  constructor(
    server: Server,
    session: NotificationSession,
    chatFrequencyService: ChatFrequencyService
  ) {
    console.log(`ChatNotificationService initialized`);

    this._chatFrequencyService = chatFrequencyService;

    this._ioServer = server;
    this._ioServer.engine.use(session);
    this._chatFrequencyService.subscribe(this);
    this._ioServer.on("connection", async (socket: Socket) => {
      const socketLogStr = this.getSocketLogString(socket);
      const sessionId = socket.request.session.id;
      console.log(`${socketLogStr} connected`);
      socket.join(this.CHAT_ROOM);

      //get all cached messages and respond
      const cachedMessages = await this._chatFrequencyService.getAllMessages();

      socket.emit(this.CONNECT_EVENT, cachedMessages);

      socket.on(this.CHAT_EVENT, async (message: string) => {
        console.log(`${socketLogStr} said ${message}`);
        const userMessage = await this._chatFrequencyService.addUserMessage(
          message,
          sessionId
        );

        //cache this message and send back with size to all (including self)
        this._ioServer.to(this.CHAT_ROOM).emit(this.CHAT_EVENT, userMessage);
      });
    });

    this._ioServer.on("disconnect", (socket: Socket) => {
      const socketLogStr = this.getSocketLogString(socket);
      console.log(`${socketLogStr} disconnected`);
      socket.leave(this.CHAT_ROOM);
    });
  }

  publish(): void {
    this._ioServer.to(this.CHAT_ROOM).emit(this.TICK_EVENT);
  }

  private getSocketLogString(socket: Socket) {
    return `session ${socket.request.session.id} with socketid ${socket.id}`;
  }
}
