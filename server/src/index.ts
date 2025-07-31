import  express  from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import routes from "./routes/authRoutes";
import twilio from 'twilio';

dotenv.config();

const app = express();
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const PORT = process.env.PORT || 8000;


const corsOption:cors.CorsOptions ={
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    optionsSuccessStatus: 200
}
// Middelware
app.use(cors());
app.use(express.json());

try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL is not defined in environment variables.");
    }
    mongoose.connect(mongoUrl);
} catch (error) {
    console.error(error);
}

app.use("/api", routes);

app.listen(PORT ,()=>{console.log(`Server is running on port ${PORT}`);});
