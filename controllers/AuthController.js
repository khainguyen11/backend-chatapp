import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import Bcrypt from "bcrypt";
import { renameSync, unlinkSync } from "fs";
import { request, response } from "express";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (request, response) => {
  try {
    // console.log(request.body);

    const { Email, Password } = request.body;
    if (!Email || !Password) {
      return response.status(400).send("Email and Password is required");
    }
    const user = await User.create({ email: Email, password: Password });

    response.cookie("jwt", createToken(Email, user.id), {
      maxAge, // thoi gian song cua cookie trinh duyet tinh va gan vao expires
      secure: true, //gui qua giao thuc https
      sameSite: "None", //cookie dc gui cho cac yeu cau khac mien
    });
    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const login = async (request, response) => {
  try {
    // console.log(request.body);

    const { Email, Password } = request.body;
    if (!Email || !Password) {
      return response.status(400).send("Email and Password is required");
    }
    const user = await User.findOne({ email: Email });
    if (!user) {
      return response.status(404).send("Email with the given email not found");
    }
    const Auth = Bcrypt.compare(Password, user.password);
    if (!Auth) {
      return response.status(400).send("Email is not correct");
    }
    response.cookie("jwt", createToken(Email, user.id), {
      maxAge, // thoi gian song cua cookie trinh duyet tinh va gan vao expires
      secure: true, //gui qua giao thuc https
      sameSite: "None", //cookie dc gui cho cac yeu cau khac mien
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal Server Error");
  }
};
export const getUserInfo = async (request, response) => {
  try {
    const userData = await User.findById(request.userId);
    if (!userData) {
      return response.status(404).send("User with the given id not found");
    }
    return response.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {}
};

export const updateProfile = async (request, response) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;
    if (!firstName || !lastName) {
      return response
        .status(400)
        .send("FirstName lastName and color is required");
    }
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName,
        lastName: lastName,
        color: color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );
    // console.log(userData);

    return response.status(200).json({
      user: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {}
};
export const addProfileImage = async (request, response) => {
  try {
    console.log("file ne");

    console.log(request);

    if (!request.file) {
      return response.status(400).send("File is required.");
    }
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + request.file.originalname;
    // console.log(fileName);

    renameSync(request.file.path, fileName);
    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );
    return response.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {}
};
export const removeProfileImage = async (request, response) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).send("User not found.");
    }
    if (user.image) {
      unlinkSync(user.image);
    }
    user.image = null;
    await user.save();
    return response.status(200).send("Profile image removed successfuly");
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal server error");
  }
};
export const logout = async (request, response) => {
  try {
    response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    response.status(200).send("logout successfull");
  } catch (error) {
    console.log(error);
    return response.status(500).send("Internal server error");
  }
};
