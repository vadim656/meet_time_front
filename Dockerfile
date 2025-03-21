FROM node:20.18-slim AS builder
# Installing libvips-dev for sharp Compatibility

RUN apt-get update
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
RUN chown  node:node /opt
COPY ./package.json ./yarn.lock ./
ENV PATH=/opt/node_modules/.bin:$PATH
RUN yarn config set network-timeout 600000 -g

USER node
RUN yarn install

FROM node:20.18-slim

WORKDIR /opt/app
COPY ./ .
RUN chown -R node:node /opt/app
USER node
EXPOSE 1337
CMD ["yarn", "start"]