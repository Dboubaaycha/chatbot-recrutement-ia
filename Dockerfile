# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (production + dev)
# Car Tailwind et les outils de build sont dans devDependencies
RUN npm ci

# Copier tout le code source
COPY . .

# Build de l'application React
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

# Configuration Nginx par défaut pour React SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
