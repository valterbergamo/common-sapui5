FROM node:22-alpine
WORKDIR /home/node/app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8081
CMD ["npm","start"]
