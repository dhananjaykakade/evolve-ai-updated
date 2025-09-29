# Production Dockerfile for API Gateway
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY index.js ./

# Create non-root user context (node user exists in node:alpine)
USER node

ENV NODE_ENV=production
ENV PORT=9001

EXPOSE 9001

# Healthcheck is typically defined in compose
CMD ["node", "index.js"]
