import { Server, Socket } from "socket.io";
import { NotificationService } from "../types/notification.service";
import { NotificationSession } from "../types/notification.session";

export default class ChatNotificationService implements NotificationService {
  readonly CHAT_ROOM = "chat_room";
  readonly CHAT_EVENT = "chat_event";
  private _ioServer: Server;

  private static _instance: ChatNotificationService;

  private constructor(server: Server, session: NotificationSession) {
    console.log(`ChatNotificationService initialized`);
    this._ioServer = server;
    this._ioServer.engine.use(session);
    this._ioServer.on("connection", (socket: Socket) => {
      console.log(`socket ${socket.id} connected`);
      socket.join(this.CHAT_ROOM);

      socket.on(this.CHAT_EVENT, (message: string) => {
        console.log(`socket: ${socket.id} said ${message}`);
        socket.to(this.CHAT_ROOM).emit(this.CHAT_EVENT, message);
      });
    });

    this._ioServer.on("disconnect", (socket: Socket) => {
      console.log(`socket ${socket.id} disconnected`);
      socket.leave(this.CHAT_ROOM);
    });
  }

  public static getInstance(server: Server, session: NotificationSession) {
    if (!this._instance) {
      this._instance = new ChatNotificationService(server, session);
    }

    return this._instance;
  }
}
