FROM node:18.12-alpine3.16 as builder
WORKDIR /app/
COPY ./package.json /app/
COPY ./package-lock.json /app/
RUN npm install

COPY . /app/

RUN ln -s /app/node_modules/@angular/cli/bin/ng.js /usr/bin/ng
RUN ng build


FROM nginx:1.23.3-alpine as runtime
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/clustervms-ui /usr/share/nginx/html/
