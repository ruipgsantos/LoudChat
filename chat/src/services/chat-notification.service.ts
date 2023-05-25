import { Server, Socket } from "socket.io";
import { NotificationSession } from "../interfaces/notification.interface";
import { ChatFrequencyService } from "./chat-frequency.service";
import Observer from "../interfaces/observer.interface";

export default class ChatNotificationService implements Observer {
  readonly CHAT_ROOM = "chat_room";
  readonly CHAT_EVENT = "chat_event";
  readonly TICK_EVENT = "tick_event";
  readonly CONNECT_EVENT = "connect_event";
  readonly USER_EVENT = "user_event";

  private _ioServer: Server;
  private _chatFrequencyService: ChatFrequencyService;

  private _userSessions = new Set();
  private addSession(sessionId: string) {
    if (this._userSessions.has(sessionId)) return;
    this._userSessions.add(sessionId);
    this._ioServer
      .to(this.CHAT_ROOM)
      .emit(this.USER_EVENT, this._userSessions.size);
    console.log(`there are ${this._userSessions.size} people listening`);
  }
  private removeSession(sessionId: string) {
    if (!this._userSessions.has(sessionId)) return;
    this._userSessions.delete(sessionId);
    this._ioServer
      .to(this.CHAT_ROOM)
      .emit(this.USER_EVENT, this._userSessions.size);
    console.log(`there are ${this._userSessions.size} people listening`);
  }

  constructor(
    server: Server,
    session: NotificationSession,
    chatFrequencyService: ChatFrequencyService
  ) {
    console.log(`ChatNotificationService initialized`);

    this._chatFrequencyService = chatFrequencyService;

    this._ioServer = server;
    this._ioServer.engine.use(session);
  }

  public async startup(): Promise<void> {
    await this._chatFrequencyService.startup();
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

        this._ioServer.to(this.CHAT_ROOM).emit(this.CHAT_EVENT, userMessage);
      });

      this.addSession(sessionId);

      socket.on("disconnect", () => {
        this.removeSession(socket.request.session.id);
        const socketLogStr = this.getSocketLogString(socket);
        console.log(`${socketLogStr} disconnected`);
        socket.leave(this.CHAT_ROOM);
      });
    });

    console.log(`${ChatNotificationService.name} started`);
  }

  publish(): void {
    this._ioServer.to(this.CHAT_ROOM).emit(this.TICK_EVENT);
  }

  private getSocketLogString(socket: Socket) {
    return `session ${socket.request.session.id} with socketid ${socket.id}`;
  }
}
