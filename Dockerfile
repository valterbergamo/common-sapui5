FROM node:22-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install @ui5/cli
RUN npm install @sap/xssec
RUN npm install ui5-middleware-simpleproxy
RUN npm install


COPY --chown=node:node . .
EXPOSE 8005
CMD ["npm", "start"]