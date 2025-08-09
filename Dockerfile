FROM node:22-alpine
WORKDIR /home/node/app

COPY package*.json ./
# não instala aqui, só copia o resto
COPY . .

EXPOSE 8081
CMD npm install && npm start

