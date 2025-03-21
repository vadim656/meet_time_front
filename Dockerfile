FROM node:20.18-slim AS builder
# Installing libvips-dev for sharp Compatibility

RUN apt-get update
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
COPY package.json yarn.lock ./

# Установка глобальных настроек yarn
RUN yarn config set network-timeout 600000 -g

# Установка зависимостей
RUN yarn install --frozen-lockfile

# Этап финального образа
FROM node:20.18-slim

# Установка рабочей директории
WORKDIR /opt/app

# Копирование зависимостей и исходного кода
COPY --from=builder /opt/app/node_modules ./node_modules
COPY . .

# Установка прав доступа
USER node
RUN yarn build
EXPOSE 1337
CMD ["yarn", "start"]