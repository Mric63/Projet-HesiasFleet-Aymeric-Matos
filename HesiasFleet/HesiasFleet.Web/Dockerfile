# --- Étape 1 : build de l'application Angular ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Étape 2 : service des fichiers statiques par nginx ---
FROM nginx:alpine
COPY --from=build /app/dist/hesias-fleet-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
