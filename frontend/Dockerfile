# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------

FROM node:16.15.1 AS clowder-build
#ENV NODE_ENV=production
WORKDIR /usr/src/app

# development or production
#ARG DEPLOY_ENV=""
#ENV DEPLOY_ENV="${DEPLOY_ENV:-}"

# copy only package for caching purposes
COPY ["package.json", "package-lock.json*", "./"]
COPY tools/ /usr/src/app/tools/
RUN npm install --legacy-peer-deps

# copy rest of application
COPY .babelrc .eslintrc .istanbul.yml *.js /usr/src/app/
COPY src /usr/src/app/src/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM nginx:alpine as clowder-runtime

RUN rm -rf /usr/share/nginx/html/ && \
  mkdir /usr/share/nginx/html && \
  mkdir /usr/share/nginx/html/public \
  mkdir /usr/share/nginx/html/styles

COPY --from=clowder-build /usr/src/app/dist/ /usr/share/nginx/html/
COPY src/public /usr/share/nginx/html/public/
COPY src/styles /usr/share/nginx/html/styles/
COPY clowder.conf /etc/nginx/conf.d/default.conf
