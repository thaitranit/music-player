# Stage 1: Build React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production server
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built React app from builder stage
COPY --from=builder /app/dist ./dist
# Copy server files and assests
COPY --from=builder /app/server ./server
COPY --from=builder /app/assests ./assests

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/server.js"]
