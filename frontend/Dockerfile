# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files trước để cache node_modules
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source và build production bundle
COPY . .
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Xóa html mặc định và copy build output
RUN rm -rf ./*
COPY --from=builder /app/dist .

# Config nginx: hỗ trợ SPA React Router (tất cả route về index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
