# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
RUN npm ci

FROM deps AS build
COPY server/tsconfig.json ./tsconfig.json
COPY server/prisma ./prisma
COPY server/src ./src
RUN npm run prisma:generate || npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/dev.db
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
VOLUME ["/data"]
CMD ["sh","-c","npm run prisma:deploy && npm start"]

