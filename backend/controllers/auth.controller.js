import crypto from "crypto";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateCookieAndSetCookie } from "../utils/generateCookieAndSetCookie.js";
import {
  sendResetPasswordSuccess,
  sendResetPasswordToken,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";

dotenv.config();

export async function signup(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("All Fields Are Required");
    }
    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      throw new Error("User with this email already exists");
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const verificationToken = generateVerificationToken();
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    //jwt
    generateCookieAndSetCookie(res, user._id);

    sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateCookieAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {}
}

export function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout success" });
}

export async function verifyEmail(req, res) {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({
      success: true,
      message: "verification success",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error while verifying email", error);
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();
    await sendResetPasswordToken(
      email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    );

    res
      .status(200)
      .json({ success: true, message: "Reset password token sent" });
  } catch (error) {
    console.log("Error in forgot password");
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or Expired token" });
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendResetPasswordSuccess(user.email);

    res.status(200).json({ success: true, message: "password reset success" });
  } catch (error) {
    console.log("Error in reset password");
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function checkAuth(req, res) {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if(!user)
      return res.status(400).json({success:false,message:"user not found"})

    res.status(200).json({success:true,user:{
      ...user._doc,
      password:undefined
    }})
  } catch (error) {
    console.log("Error in checking auth password");
    res.status(400).json({ success: false, message: error.message });
  }
}
