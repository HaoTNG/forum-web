import express, { Application } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db';
import { errorHandler } from './middlewares/errorMiddleware';
import morgan from 'morgan';
import cors from "cors";
import cookieParser from "cookie-parser";
import { setupSocket } from './socket';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser()); 

const FE_PORTAL_URL = process.env.FE_PORTAL_URL as string;
const NGROK_URL = process.env.NGROK_URL as string;

const allowedOrigins = [
  FE_PORTAL_URL,
  NGROK_URL
].filter(Boolean); 

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

setupSocket(server);
connectDB();
app.use(morgan(':method :url :status - :response-time ms'));
app.use(errorHandler);

export default app;
