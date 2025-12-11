# Étape 1 : Build de l'application React
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# IMPORTANT : Installer TOUTES les dépendances (y compris devDependencies)
# car Tailwind CSS est nécessaire pour le build
RUN npm ci

# Copier tout le code source
COPY . .

# Build de l'application React
RUN npm run build

# Étape 2 : Serveur Nginx pour servir l'application
FROM nginx:alpine

# Copier le build depuis l'étape précédente
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
