# 1. Używamy lekkiego Node
FROM node:20-alpine

# 2. Ustawiamy katalog roboczy
WORKDIR /app

# 3. Kopiujemy package.json i package-lock.json
COPY package*.json ./

# 4. Instalujemy zależności
RUN npm install

# 5. Kopiujemy resztę kodu
COPY . .

# 6. Generujemy klienta Prisma
RUN npx prisma generate

# 7. Budujemy projekt (jeśli masz TypeScript)
RUN npx tsc

# 8. Komenda startowa (po migracji)
CMD npx prisma migrate deploy && npm run dev
