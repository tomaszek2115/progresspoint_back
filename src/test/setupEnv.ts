import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { PrismaClient } from "../../generated/prisma/client";

// 1. Wybór pliku środowiskowego
const envFile = process.env.CI ? ".env.test.ci" : ".env.test";

// 2. Wczytanie zmiennych środowiskowych z override
dotenv.config({ path: path.resolve(process.cwd(), envFile), override: true });

console.log("Loaded env from:", envFile);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

// 3. Thread-safe: generowanie klienta i db push tylko raz
// sprawdzamy, czy jest pierwszy worker Jesta lub brak JEST_WORKER_ID (np. lokalnie)
const isFirstWorker = !process.env.JEST_WORKER_ID || process.env.JEST_WORKER_ID === "1";

if (isFirstWorker) {
  console.log("Running prisma generate and db push for first worker...");
  
  // Prisma CLI dostaje jawnie DATABASE_URL
  const env = { ...process.env };

  execSync("npx prisma generate", { stdio: "inherit", env });
  execSync("npx prisma db push", { stdio: "inherit", env });
}

// 4. Utworzenie instancji PrismaClient
// Każdy worker importujący setupEnv dostaje tego samego klienta
const prisma = new PrismaClient();

export default prisma;
