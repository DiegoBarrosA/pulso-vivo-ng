# Build stage
FROM docker.io/library/node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Production stage
FROM docker.io/library/node:18-alpine
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001

# Set ownership
RUN chown -R angular:nodejs /app
USER angular

# Expose port 4000 (default for Angular SSR)
EXPOSE 4000

# Start the SSR server
CMD ["npm", "run", "serve:ssr:pulso-vivo-ng"]