FROM node:12-alpine

RUN apk add --update bash

ENV PORT=3000
ENV SITE_NAME=KIT\ URLs\ Shortener

ENV DEFAULT_DOMAIN=kitshortenerdockerenv.azurewebsites.net
ENV LINK_LENGTH=6

ENV DB_HOST=dpg-cl0itqjjdq6s73dq23ng-a.singapore-postgres.render.com
ENV DB_PORT=5432
ENV DB_NAME=kiturlshortener
ENV DB_USER=kiturlshortener_user
ENV DB_PASSWORD=GFRr1NZZd8dty8xFNAHtfN20fFuG4ga5
ENV DB_SSL=true
ENV REDIS_HOST=redis-17204.c295.ap-southeast-1-1.ec2.cloud.redislabs.com
ENV REDIS_PORT=17204
ENV REDIS_PASSWORD=jtH7ct4eOGsrqDt6pqVUJoC8YZEeVOMy

ENV DISALLOW_REGISTRATION=false

ENV MAIL_HOST=smtp.gmail.com
ENV MAIL_PORT=587
ENV MAIL_SECURE=false
ENV MAIL_USER=HVGiang86@gmail.com
ENV MAIL_FROM=KIT\ Shortener
ENV MAIL_PASSWORD=gtat\ laar\ eubt\ lhqm

ENV DISALLOW_REGISTRATION=false
ENV DISALLOW_ANONYMOUS_LINKS=false
ENV USER_LIMIT_PER_DAY=50
ENV NON_USER_COOLDOWN=0
ENV DEFAULT_MAX_STATS_PER_LINK=5000
ENV CUSTOM_DOMAIN_USE_HTTPS=true
ENV JWT_SECRET=myJWTSecretFOrKUTTUrlsShortener
ENV ADMIN_EMAILS=HVGiang86@gmail.com


# Setting working directory. 
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN echo "DEFAULT DOMAIN IS $DEFAULT_DOMAIN ON PORT $PORT"
RUN npm install

# Copying source files
COPY . .

# Give permission to run script
RUN chmod +x ./wait-for-it.sh

# Build files
RUN npm run build

EXPOSE 3000

# Running the app
CMD [ "npm", "start" ]