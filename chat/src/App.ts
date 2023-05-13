import express, { Request, Response } from "express";
import http from "http";
import session, { Session } from "express-session";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import { getCors } from "./utils";
import ChatNotificationService from "./services/chat-notification.service";
import { ChatFrequencyService } from "./services/chat-frequency.service";
import { ChatCacheService } from "./services/chat-cache.service";

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: getCors(),
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const serverSession = session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax",
  },
});

app.use(serverSession);

//session for socket.io
declare module "http" {
  interface IncomingMessage {
    session: Session & Partial<session.SessionData>;
  }
}

//sockets for chat
const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    origin: getCors(),
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const chatCache = new ChatCacheService();
const chatFreqService = new ChatFrequencyService(chatCache);
const chatNotificationService = new ChatNotificationService(
  io,
  serverSession,
  chatFreqService
);

app.get("/", (req: Request, res: Response) => {
  res.send("OK!");
});

process.on("exit", () => {
  chatFreqService.shutDown();
});

export default server;
