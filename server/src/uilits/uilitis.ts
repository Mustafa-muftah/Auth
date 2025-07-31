import { Request, Response } from 'express';
import { isEmail } from 'validator';
import twilio from 'twilio';
import jwt from "jsonwebtoken";


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID ,
  process.env.TWILIO_AUTH_TOKEN 
);


export const valdiateSignup =(req:Request , res:Response)=>{
 const { name, email, password ,phoneNumber } = req.body;
 if (!name || !email || !password || !phoneNumber) {
     res.status(400).json({ error: "All fields are required." });
     return false;
 }  
 if (!isEmail(email)) {
     res.status(400).json({ error: "Invalid email format." });
     return false;
 }
 if (password.length < 6) {
     res.status(400).json({ error: "Password must be at least 6 characters long." });
     return false;
 }
 if (phoneNumber.length < 10 || phoneNumber.length > 15) {
     res.status(400).json({ error: "Phone number must be between 10 and 15 digits." });
     return false;
 }
 return true;
}

export const getUserIdFromToken = async (req: Request): Promise<string | null> => {
  const authHeader = req.headers["token"] as string;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

  if (!token) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      return decoded.id;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
  return null;
}

export const validatePhoneNumberTwilio = async(phoneNumber: string): Promise<number> => {
    const createOTP =() => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    }
    const otp = createOTP();
    try {
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER || "+201153190270", // Replace with your Twilio phone number
            to: phoneNumber
        });
        return otp;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
}

