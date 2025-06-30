FROM node:18-alpine

# Set working dir to monorepo root
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only student-service and shared configs
COPY backend-service/student-service ./backend-service/student-service
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only student-service dependencies
WORKDIR /app/backend-service/student-service
RUN pnpm install

# Set port and start
EXPOSE 8090
CMD ["node", "index.js"]
