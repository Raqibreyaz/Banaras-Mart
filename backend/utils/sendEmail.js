import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const sendEmail = async (user) => {
  const { email, _id, fullname } = user;

  const { FRONTEND_URL, JWT_SECRET_KEY } = process.env;

  if (!FRONTEND_URL || !JWT_SECRET_KEY)
    throw new ApiError(400, "missing environment variables");

  const token = jwt.sign({ email, userId: _id }, JWT_SECRET_KEY, {
    expiresIn: 1800,
  });

  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: `Banaras Mart ${process.env.NODEMAILER_EMAIL}`,
    subject: "Password Reset Request",
    text: `Hi ${fullname} you or someone on your behalf requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
    html: `<p>Hi ${fullname} you or someone on your behalf requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
  };

  return await transporter.sendMail(msg);
};
