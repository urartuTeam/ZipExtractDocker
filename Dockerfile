FROM node:20-alpine
WORKDIR /app
# Копируем файлы package.json и package-lock.json
COPY package*.json ./
# Устанавливаем зависимости
RUN npm ci

EXPOSE 5000

CMD ["npm", "run", "dev"]