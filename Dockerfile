# Étape 1 : Build de l'application React
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier tout le code source
COPY . .

# Build de l'application React
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'application
FROM nginx:alpine

# Copier le build depuis l'étape précédente
COPY --from=builder /app/build /usr/share/nginx/html

# Copier une configuration Nginx personnalisée (optionnel)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
