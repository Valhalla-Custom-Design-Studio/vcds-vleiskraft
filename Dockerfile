FROM node:20-alpine AS builder
WORKDIR /app
COPY api/package*.json api/tsconfig.json ./
RUN npm install
COPY api/src ./src
RUN npx tsc

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY api/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
