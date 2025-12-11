# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier tout le code source
COPY . .

# Build de l'application React
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

# Copier une configuration Nginx personnalisée (optionnel)
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Exposer le port 80
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
