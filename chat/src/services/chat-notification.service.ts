import { Server, Socket } from "socket.io";
import { NotificationSession } from "../interfaces/notification.interface";
import { chatFrequencyService } from "./chat-frequency.service";

export default class ChatNotificationService {
  readonly CHAT_ROOM = "chat_room";
  readonly CHAT_EVENT = "chat_event";
  readonly CONNECT_EVENT = "connect_event";

  private static _instance: ChatNotificationService;

  private _ioServer: Server;

  constructor(server: Server, session: NotificationSession) {
    console.log(`ChatNotificationService initialized`);

    this._ioServer = server;
    this._ioServer.engine.use(session);
    this._ioServer.on("connection", (socket: Socket) => {
      const socketLogStr = this.getSocketLogString(socket);
      const sessionId = socket.request.session.id;
      console.log(`${socketLogStr} connected`);
      socket.join(this.CHAT_ROOM);

      //get all cached messages and respond
      const cachedMessages = chatFrequencyService.getAllMessages();

      socket.emit(this.CONNECT_EVENT, cachedMessages);

      socket.on(this.CHAT_EVENT, (message: string) => {
        console.log(`${socketLogStr} said ${message}`);
        const userMessage = chatFrequencyService.addUserMessage(
          message,
          sessionId
        );

        //cache this message and send back with size to all (including self)
        // socket.to(this.CHAT_ROOM).emit(this.CHAT_EVENT, message);
        this._ioServer.to(this.CHAT_ROOM).emit(this.CHAT_EVENT, userMessage);
      });
    });

    this._ioServer.on("disconnect", (socket: Socket) => {
      const socketLogStr = this.getSocketLogString(socket);
      console.log(`${socketLogStr} disconnected`);
      socket.leave(this.CHAT_ROOM);
    });
  }

  private getSocketLogString(socket: Socket) {
    return `session ${socket.request.session.id} with socketid ${socket.id}`;
  }
}
