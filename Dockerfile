FROM node:22-alpine
WORKDIR /home/node/app

COPY package*.json ./

# Instala dependências e força @ui5/cli mesmo que falte no package.json
RUN npm install && \
    npm install --save-dev @ui5/cli @sap/ux-ui5-tooling && \
    npm cache clean --force

# Garante que node_modules/.bin está no PATH
ENV PATH=/home/node/app/node_modules/.bin:$PATH

COPY . .

EXPOSE 8081
CMD ["sh", "-c", "sleep infinity"]

