# Base image
FROM node:18

# Cài đặt pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN pnpm run build

# Mở các cổng cần thiết
EXPOSE 3002
EXPOSE 3008
EXPOSE 6379

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
