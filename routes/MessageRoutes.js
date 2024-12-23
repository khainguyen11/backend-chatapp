import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessage, uploadFile } from "../controllers/MessagesController.js";
import multer from "multer";

const MessageRoutes = Router();
const upload = multer({ dest: "uploads/files" });
MessageRoutes.post("/get-messages", verifyToken, getMessage);
MessageRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  uploadFile
);
export default MessageRoutes;
