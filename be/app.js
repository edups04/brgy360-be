import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { userRoutes } from "./src/routes/userRoutes.js";
import { barangayRoutes } from "./src/routes/barangayRoutes.js";
import { newsAnnouncementRoutes } from "./src/routes/newsAnnouncementsRoutes.js";
import { projectRoutes } from "./src/routes/projectRoutes.js";
import { accomplishmentsAchievementsRoutes } from "./src/routes/accomplishmentsAchievementsRoutes.js";
import { budgetRoutes } from "./src/routes/budgetRoutes.js";
import { fileRequestRoutes } from "./src/routes/fileRequestRoutes.js";
import { chatBotRoutes } from "./src/routes/chatBotRoutes.js";

// ! FOR WEB HOSTING
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

let app = express();
dotenv.config();
const server = app.listen(process.env.PORT);

// ! FOR REAL-TIME UPDATES
import { WebSocketServer } from "ws";

// * STEP 1 WS - setup the web socket connection
// * connect fe using url (ws://localhost:PORT_HERE)
const wss = new WebSocketServer({ server });

// * MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// * connecting to the mongodb server
const connectMongoDB = async () => {
  try {
    const URL = process.env.MONGODB;
    const connected = await mongoose.connect(URL);
    if (connected) {
      console.log("CONNECTED TO MONGO DB");
      console.log(URL);
    } else {
      console.log("CANNOT CONNECT TO MONGO DB");
    }
  } catch (error) {
    console.error(error);
  }
};
await connectMongoDB();

// * STEP 2 WS - connect the client (frontend)
// * to the websocket connection for real-time updates
wss.on("connection", (ws) => {
  console.log("Client connected");

  // * if fe sends some message/data it will log here
  ws.on("message", (message) => {
    console.log("Received Message:", JSON.parse(message));
    // * after receiving some data u can also return some message on the backend
    ws.send(
      JSON.stringify({
        realTimeType: "ws connection",
        message: "Message received, this is a response from backend",
        success: true,
      })
    );
  });
});

// * dir for images (if applicable)
app.use("/api/images", express.static("./public/images"));
app.use("/api/files", express.static("./public/files"));

app.use("/api/users", userRoutes);
app.use("/api/barangays", barangayRoutes);
app.use("/api/news-announcements", newsAnnouncementRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/accomplishments-achievements", accomplishmentsAchievementsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/file-requests", fileRequestRoutes);
app.use("/api/chat-bot-messages", chatBotRoutes);

// ! TO RENDER FRONTEND ON WEB HOSTING
// app.use(express.static(path.join(__dirname, "/fe/build/")));
app.use(express.static(path.join(__dirname, "/fe/dist/")));

// ! RENDER FRONTEND ON ANY PATH
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/fe/dist/index.html"))
  // res.sendFile(path.join(__dirname, "/fe/build/index.html"))
);

// * start server
app.get("/", async (req, res) => {
  res.json({ message: "Server Started", port: process.env.PORT });
});

// * to be accessible in websocket routes
export { wss };