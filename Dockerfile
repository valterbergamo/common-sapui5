FROM node:22-alpine
WORKDIR /home/node/app

# Copia package.json e lock
COPY package*.json ./

# Instala dependências exatamente como no lock file
RUN npm ci

# Garante que node_modules/.bin está no PATH
ENV PATH=/home/node/app/node_modules/.bin:$PATH

# Copia o restante do código
COPY . .

EXPOSE 8081
CMD ["npm", "start"]
