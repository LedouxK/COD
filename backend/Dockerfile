FROM node:16-alpine

# Création du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances avec --no-optional pour sauter bcrypt natif
# et installer une version plus compatible
RUN npm install --no-optional && \
    npm install bcryptjs

# Copie du code source du backend
COPY . .

# Création du répertoire pour le frontend build
RUN mkdir -p ./frontend/build

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
