FROM node:20-alpine

WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы проекта
COPY . .

# Собираем проект
RUN npm run build

# Открываем порт
EXPOSE 5000

RUN ls -la dist && ls -la dist/client
RUN npm run build || (echo "Build failed" && exit 1)

# Запускаем сервер
CMD ["npm", "start"]