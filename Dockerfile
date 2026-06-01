FROM node:20-alpine AS builder
WORKDIR /app
COPY api/package*.json api/tsconfig.json ./
RUN npm install
# force-rebuild: 20260601190112
ARG CACHE_BUST=20260601190112
COPY api/src ./src
RUN node_modules/.bin/tsc

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY api/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
