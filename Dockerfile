FROM oven/bun:1 AS base

RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --forzen-lockfile

COPY . .

FROM node:20-slim AS production

RUN apt-get update && apt-get install -y \
    dumb-init \
    vim \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app    
COPY --from=base /app/.output ./.output
COPY . .

RUN useradd -u 1001 -s /bin/bash -m nuxt && chown -R nuxt:nuxt /app
USER nuxt

EXPOSE 3000


CMD ["node", ".output/server/index.mjs"]