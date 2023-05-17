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
require("dotenv").config();

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
  secret: process.env.COOKIE_SECRET || uuidv4(),
  resave: false,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "none",
    domain: "loudchat.onrender.com",
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

const chatNotificationService = new ChatNotificationService(io, serverSession);

app.get("/", (req: Request, res: Response) => {
  res.send("OK!");
});

export default server;
