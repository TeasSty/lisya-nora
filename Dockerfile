# syntax=docker/dockerfile:1
# Образ для VPS reg.ru (Docker / docker compose). Нужен Node, не PHP-хостинг.
FROM node:22-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_VKID_APP_ID=
ENV VITE_VKID_APP_ID=$VITE_VKID_APP_ID
RUN npm run build:regru \
  && npm prune --omit=dev \
  && mkdir -p /app/data
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "tsx", "server/index.ts"]
