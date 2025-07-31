import { Request, Response } from "express";
import bycrpt from "bcrypt";
import { User } from "../models/user";
import { getUserIdFromToken, valdiateSignup } from "../uilits/uilitis";
import jwt from "jsonwebtoken";


export default class UserController {
  public static async signUp(req: Request, res: Response): Promise<void> {
    const saltRounds = 10;
    const { name, email, password, phoneNumber } = req.body;
    const isvalid = valdiateSignup(req, res);
    // await validatePhoneNumberTwilio(phoneNumber);
    if (!isvalid) {
      res.status(400).json({ error: "Validation failed." });
      return;
    }
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      res.status(400).json({ error: "Email is already registered." });
      return;
    }
    try {
      const hashedpassword = await bycrpt.hash(password, saltRounds);
      const newUser = await User.create({
        name,
        email,
        password: hashedpassword,
        phoneNumber,
      });
      res.json({
        message: "User registered successfully",
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const dbUser = await User.findOne({ email }).exec();
    if (!dbUser) {
      res
        .status(400)
        .json({ error: "Email is not registered. Please SignUp." });
      return;
    }
    const isMatch = await bycrpt.compare(password, dbUser.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const token = jwt.sign(
        { id: dbUser._id, name: dbUser.name, email },
        jwtSecret,
        { expiresIn: "1d" }
      );
      res.json({
        message: "Login successful",
        token,
      });
    }
  }

  public static async updateUser(req: Request, res: Response): Promise<void> {
    const {
      email,
      password,
      updatedPassword: { newPassword },
    } = req?.body;
    const dbUser = await User.findOne({ email }).exec();
    if (!dbUser) {
      res.status(404).json({ error: "user not found " });
      return;
    }
    try {
     const oldPassword = dbUser.password;
     const isMatch =  bycrpt.compare(password, oldPassword);
    if(!isMatch) {
      res.status(400).json({ error: "password is incorrect." });
      return;
    }
     const hashedPassword = await bycrpt.hash(newPassword, 10);
     await User.updateOne({ email }, { password: hashedPassword });
      res.status(200).json({ message: "password updated successfully." });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ data: err?.message });
      return;
    }
  }

   public static async deleteUser(req: Request, res: Response): Promise<void> {
   const id = await getUserIdFromToken(req);
   console.log("User ID from token:", id);
    const dbUser = await User.findOne({_id: id }).exec();
    if (!dbUser) {
      res.status(404).json({ error: "user not found " });
      return;
    }
    try {
      await User.deleteOne({_id:id});
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ data: err?.message });
      return;
    }
  }
}
