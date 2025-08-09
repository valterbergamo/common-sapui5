FROM node:22-alpine

# Instalar socat
RUN apk add --no-cache socat

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install @ui5/cli \
    && npm install @sap/xssec \
    && npm install ui5-middleware-simpleproxy \
    && npm install

COPY --chown=node:node . .

EXPOSE 8081

# Inicia o fiori run e o socat
CMD npm start & socat tcp-listen:8081,reuseaddr,fork tcp:127.0.0.1:8080
