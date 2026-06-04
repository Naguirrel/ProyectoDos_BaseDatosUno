FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
RUN npm prune --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
