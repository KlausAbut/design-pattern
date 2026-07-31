# Étape 1 : Construction de l'application
FROM node:22-alpine AS builder
WORKDIR /app

# Copie des dépendances et installation
COPY package*.json ./
RUN npm install

# Copie du reste du code et build (génère le dossier /dist)
COPY . .
RUN npm run build

# Étape 2 : Serveur web Nginx
FROM nginx:alpine

# On copie le résultat du build vers le dossier public de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# On copie notre configuration pour le routeur
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]