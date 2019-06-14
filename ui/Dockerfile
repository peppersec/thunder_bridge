FROM node:8 as builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
RUN npm run postinstall

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
