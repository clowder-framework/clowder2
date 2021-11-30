# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------

FROM node:14 AS builder

WORKDIR /usr/src/app

# development or production
ARG DEPLOY_ENV=""
ENV DEPLOY_ENV="${DEPLOY_ENV:-}"

# copy only package for caching purposes
COPY package*.json /usr/src/app/
COPY tools/ /usr/src/app/tools/
RUN npm install

# copy rest of application
COPY .babelrc .eslintrc .istanbul.yml *.js /usr/src/app/
COPY src /usr/src/app/src/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM nginx:alpine

RUN apk add --no-cache jq
RUN rm -rf /usr/share/nginx/html/ && \
  mkdir /usr/share/nginx/html && \
  mkdir /usr/share/nginx/html/public

COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html/
COPY src/public /usr/share/nginx/html/public/
COPY clowder.conf /etc/nginx/conf.d/default.conf
