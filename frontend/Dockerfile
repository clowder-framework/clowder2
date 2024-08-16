# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------

FROM node:16.15.1 AS clowder-build
WORKDIR /usr/src/app

# development or production
#ARG DEPLOY_ENV=""
#ENV DEPLOY_ENV="${DEPLOY_ENV:-}"

# copy only package for caching purposes
COPY ["package.json", "package-lock.json*", "./"]
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

FROM nginx:alpine as clowder-runtime

# Set the environment variable with a default value if not provided
ENV BASE_URL_ROUTE=${BASE_URL_ROUTE:-/}

# Adjust the paths based on BASE_URL_ROUTE
RUN rm -rf /usr/share/nginx/html/ && \
  mkdir -p /usr/share/nginx/html${BASE_URL_ROUTE}/public && \
  mkdir -p /usr/share/nginx/html${BASE_URL_ROUTE}/styles

# Copy the built application from the previous stage
COPY --from=clowder-build /usr/src/app/dist/ /usr/share/nginx/html${BASE_URL_ROUTE}/
COPY src/public /usr/share/nginx/html${BASE_URL_ROUTE}/public/
COPY src/styles /usr/share/nginx/html${BASE_URL_ROUTE}/styles/

# Copy the NGINX configuration template
COPY clowder.conf.template /etc/nginx/conf.d/default.conf.template

# Use envsubst to substitute environment variables in the NGINX config template
CMD ["/bin/sh", "-c", "envsubst '${BASE_URL_ROUTE}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
