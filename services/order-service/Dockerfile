FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY server.js .

ENV NODE_ENV=production
ENV PORT=8080
ENV VERSION=1.0.0

EXPOSE 8080

USER node

CMD ["node", "server.js"]
