FROM node:16-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

ENV XCLOUD_IP=http://xcloud:80/svn


EXPOSE 8081

CMD ["node", "backend/xcloud_app.js"]
