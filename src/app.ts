import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import { errorHandler } from './middlewares/errorMiddleware';
import morgan from 'morgan';
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cookieParser()); 

const FE_PORTAL_URL = process.env.FE_PORTAL_URL as string;
const NGROK_URL = process.env.NGROK_URL as string;

const allowedOrigins = [
  FE_PORTAL_URL,
  NGROK_URL
].filter(Boolean); // tránh null/undefined

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Serve uploads folder
//app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

connectDB();
app.use(morgan(':method :url :status - :response-time ms'));
app.use(errorHandler);

export default app;
