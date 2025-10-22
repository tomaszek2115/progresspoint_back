import express from 'express';
import prisma from './prisma';
import userRouter from "./user/user.routes";
import { authRouter } from './auth/auth.routes';
import cors from 'cors';

// create instance of express
const app = express();

// middleware for parsing json bodies
app.use(express.json());

// use user routes
app.use("/user", userRouter);
app.use("/auth", authRouter);

// cors configuration
app.use(cors({
  origin: "http://localhost:6969", // frontend url
  credentials: true
}));

// health check route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));

export { app };