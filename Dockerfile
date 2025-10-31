# light node
FROM node:20-alpine

# setting working directory
WORKDIR /app

# copy package.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy all files
COPY . .

# generate prisma client
RUN npx prisma generate

# build project
RUN npx tsc

# start command
CMD npx prisma migrate deploy && npm run dev