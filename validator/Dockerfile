FROM node:8

RUN apt-get update -yq && \
	apt-get install -yq build-essential libc6-dev libc6-dev-i386 wget && \
	rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
ENTRYPOINT ["npm", "run"]
CMD ["docker-message"]

