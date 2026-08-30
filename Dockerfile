FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server/index.js server/
COPY dist/ dist/

ENV NODE_ENV=production
EXPOSE 5175
CMD ["node", "server/index.js"]
