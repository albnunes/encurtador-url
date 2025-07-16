FROM node:22.17-alpine

RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .

RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
