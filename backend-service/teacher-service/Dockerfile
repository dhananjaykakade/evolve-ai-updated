FROM node:18-alpine

# Set working dir to monorepo root
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only teacher-service and shared configs
COPY backend-service/teacher-service ./backend-service/teacher-service
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only teacher-service dependencies
WORKDIR /app/backend-service/teacher-service
RUN pnpm install

# Set port and start
EXPOSE 8005
CMD ["node", "index.js"]
