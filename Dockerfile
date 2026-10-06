FROM node:22-bookworm-slim

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium \
 && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN PNPM_VERSION=$(node -p "require('./package.json').packageManager.replace('pnpm@', '')") \
 && corepack prepare pnpm@$PNPM_VERSION --activate \
 && pnpm config set --location=project --json allowBuilds '{"better-sqlite3":true,"core-js":true,"esbuild":true,"sqlite3":true}' \
 && pnpm config set fetch-timeout 600000 \
 && pnpm install --frozen-lockfile

COPY . .

ARG VITE_APP_TITLE=Kiini: One Hub. Total Control
ARG VITE_APP_LOGO=
ARG VITE_APP_ID=Kiini: One Hub. Total Control-local
ARG VITE_API_URL=http://localhost:3005/api

ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_LOGO=$VITE_APP_LOGO
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build
RUN chmod +x /app/docker/entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3005
ENV UPLOAD_DIR=/app/uploads

EXPOSE 3005

CMD ["/app/docker/entrypoint.sh"]
