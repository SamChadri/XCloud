FROM node:16-alpine

WORKDIR /usr/src/app

COPY . .



RUN npm install

RUN apk add --no-cache subversion

ENV XCLOUD_APACHE=http://xcloud:80/ 

ENV XCLOUD_SVN=svn://xcloud:3690/


EXPOSE 8081

CMD ["node", "backend/xcloud_app.js"]
