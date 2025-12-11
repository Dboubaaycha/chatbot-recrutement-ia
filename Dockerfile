# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Builder l'application React
RUN npm run build

# Production stage avec nginx
FROM nginx:alpine

# Copier le build React dans nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copier une configuration nginx personnalisée (optionnel)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
