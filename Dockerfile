FROM node:16.19.1

WORKDIR /app

COPY . .

RUN npm i

CMD ["node", "index.js"]
