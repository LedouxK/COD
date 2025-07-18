# Étape 1 : Build React avec Tailwind
FROM node:16-alpine AS builder

WORKDIR /app

# Copie package.json et installe les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Installe TailwindCSS + PostCSS + shadcn/ui (si pas déjà fait)
RUN npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# Copie le reste du code source
COPY . .

# Build React pour production
RUN npm run build

# Étape 2 : Serveur Nginx pour le build
FROM nginx:alpine

# Supprime la conf par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie le build dans nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Ajouter la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/

# Expose le port utilisé par Nginx
EXPOSE 80

# Démarre Nginx
CMD ["nginx", "-g", "daemon off;"]
