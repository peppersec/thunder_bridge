FROM node:8

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ./round.sh > log &2>1 & node prom-server.js

#CMD ["npm", "run", "start"]
