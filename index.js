import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import { createServer } from "node:http";
import MessageRoutes from "./routes/MessageRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", MessageRoutes);
const server = createServer(app);
server.listen(port, () => {
  console.log(`Server is runing http://localhost:${port}`);
});
setupSocket(server);
// console.log(server);

mongoose
  .connect(databaseURL)
  .then(() => {
    console.log("DB Connection Success");
  })
  .catch((err) => {
    console.log(err);
  });
