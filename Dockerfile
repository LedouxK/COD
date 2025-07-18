# Étape 1: Build du frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app/frontend
# Copie des fichiers package.json et package-lock.json du frontend
COPY frontend/package*.json ./
# Installation des dépendances du frontend
RUN npm install
# Copie du code source du frontend
COPY frontend/ ./
# Construction du frontend
RUN npm run build

# Étape 2: Build du backend et assemblage final
FROM node:16-alpine
WORKDIR /usr/src/app

# Copie des fichiers de dépendances du backend
COPY backend/package*.json ./
# Installation des dépendances du backend
RUN npm install --no-optional && \
    npm install bcryptjs

# Copie du code source du backend
COPY backend/ .

# Copie du build du frontend depuis l'étape précédente
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
