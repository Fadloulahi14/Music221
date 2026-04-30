# ============================================================
# Stage 1 — builder
# Installe TOUTES les dépendances (y compris prisma CLI en
# devDep) pour générer le client Prisma, puis on jette le reste.
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifestes en premier → meilleur cache Docker
COPY package.json package-lock.json ./

# Copier le schéma Prisma (nécessaire pour prisma generate)
COPY prisma ./prisma/

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Générer le client Prisma à partir du schéma
RUN npx prisma generate


# ============================================================
# Stage 2 — production
# Image finale légère : prod deps + client Prisma généré + src
# ============================================================
FROM node:20-alpine AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copier les manifestes
COPY package.json package-lock.json ./

# Copier le schéma Prisma (nécessaire si prisma migrate est
# appelé au runtime, et pour @prisma/client)
COPY prisma ./prisma/

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Récupérer le client Prisma généré depuis le stage builder
# (évite d'avoir prisma CLI dans l'image finale)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copier le code source
COPY src ./src

# Donner la propriété des fichiers à l'utilisateur non-root
RUN chown -R nodejs:nodejs /app

# Basculer sur l'utilisateur non-root
USER nodejs

# Variables d'environnement par défaut (surchargées au runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port de l'API
EXPOSE 3000

# Démarrage de l'application
CMD ["npm", "start"]
