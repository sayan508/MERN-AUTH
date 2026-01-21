import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import  'dotenv/config.js';
import { connect } from 'mongoose';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';    
import userRouter from './routes/userRoutes.js';
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));


app.get("/", (req, res) => res.send("Server is up and running!"));
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});