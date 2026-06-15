FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN npm ci

COPY . .

RUN npm run build --workspace apps/api

FROM node:20-slim AS production

RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pm2

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN npm ci --omit=dev --workspace apps/api

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY ecosystem.config.cjs ./

RUN useradd -u 1001 -s /bin/bash -m appuser && chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production

EXPOSE 3011

ENTRYPOINT ["dumb-init", "--"]
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--only", "hosxp-holiday-api", "--env", "production"]
