FROM node:16-alpine

WORKDIR /app

COPY package.json .

RUN npm build

COPY . .

ENV PORT=5000

CMD [ "npm","serve" ]