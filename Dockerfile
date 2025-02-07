FROM node:alpine3.21 as builder

WORKDIR /usr/src/app

VOLUME [ "/data/db" ]

COPY package*.json ./ 

RUN npm ci 

COPY ./ ./

EXPOSE 8000


LABEL version="1.0.0" \
      environment="development" \ 
      maintainer="Soorya666"

CMD [ "npm start" ]



#############################
FROM node:alpine as nigger

WORKDIR /usr/src/app

COPY package*.json ./ 

RUN npm ci 

COPY ./ ./

LABEL environment=development

EXPOSE 8000

CMD [ "npm run dev" ]

