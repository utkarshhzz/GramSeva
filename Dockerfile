# ============================================================
# GramSahay — Dockerfile for Google Cloud Run
# ============================================================
# Multi-stage build: build the Vite app, then serve with nginx
# ============================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run uses PORT env var
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
