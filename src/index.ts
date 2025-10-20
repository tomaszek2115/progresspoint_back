import express from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const { email, username, passwordHash } = req.body;
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });
  res.status(201).json(user);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));