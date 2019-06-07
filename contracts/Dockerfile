FROM node:8

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

COPY ./deploy/package.json ./deploy/
COPY ./deploy/package-lock.json ./deploy/
RUN cd ./deploy && npm install && cd ..

RUN npm run compile
RUN ./flatten.sh

WORKDIR /app/deploy

ENTRYPOINT ["npm", "run"]
CMD ["docker-message"]
