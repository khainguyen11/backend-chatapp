import { rename } from "fs/promises";
import Message from "../models/MessagesModel.js";
import fs from "fs";

export const getMessage = async (request, response) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;
    if (!user1 || !user2) {
      return response.status(400).send("Both User ID's are required");
    }
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });
    console.log(messages);

    return response.status(200).json(messages);
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required");
    }
    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${request.file.originalname}`;
    fs.mkdirSync(fileDir, { recursive: true });
    console.log(fileName);

    console.log(request.file.path);

    fs.renameSync(request.file.path, fileName);
    return response.status(200).json({ filePath: fileName });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
