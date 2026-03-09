# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# EasyPanel y otros PaaS pueden inyectar PORT; por defecto 80
ENV PORT=80

COPY --from=builder /app/dist /usr/share/nginx/html
# Template para que la imagen oficial sustituya ${PORT} al arrancar
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
