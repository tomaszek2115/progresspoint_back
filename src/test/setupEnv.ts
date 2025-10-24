import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { execSync } from "child_process";

const envFile = process.env.CI ? ".env.test.ci" : ".env.test";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log("Loaded env from:", envFile);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

execSync("npx prisma db push", { stdio: "inherit" });
const prisma = new PrismaClient();

export default prisma;