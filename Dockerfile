FROM node:18.12-alpine3.16
WORKDIR /app/
COPY ./package.json /app/
COPY ./package-lock.json /app/
RUN npm install

COPY . /app/

RUN ln -s /app/node_modules/@angular/cli/bin/ng.js /usr/bin/ng

# TODO: multi-stage build
# TODO: only install necessary dependencies
# TODO: speed up builds by installing some dependencies before copying whole working dir
# TODO: run as unprivileged user

# TODO: use a proper web server meant for production
# TODO: reduce image size. Currently 701MB
CMD ["ng", "serve", "--host", "0.0.0.0"]

# FIXME: should build when image is made, not during runtime
