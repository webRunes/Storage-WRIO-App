FROM ubuntu:15.04
MAINTAINER denso.ffff@gmail.com

RUN apt-get update && apt-get install -y nodejs npm mc build-essential g++ git

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g browserify gulp
RUN mkdir -p /srv/www

# Storage

COPY package.json /srv/www/package.json
RUN cd /srv/www/ && npm install
COPY . /srv/www/

COPY keys/config.json /srv/www/

EXPOSE 5001
CMD cd /srv/www/ && node server.js