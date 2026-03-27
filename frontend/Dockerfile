# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------

FROM node:16.15.1 AS clowder-build
WORKDIR /usr/src/app

# Define the argument and environment variable
# Make sure BASE_URL_ROUTE starts with a slash and does not end with a slash
ARG BASE_URL_ROUTE=""
ENV BASE_URL_ROUTE=${BASE_URL_ROUTE:-}
RUN echo "Build time BASE_URL_ROUTE: ${BASE_URL_ROUTE}"

# Add the build argument for CLOWDER_REMOTE_HOSTNAME to work with backend at a different host
ARG CLOWDER_REMOTE_HOSTNAME=""
ENV CLOWDER_REMOTE_HOSTNAME=${CLOWDER_REMOTE_HOSTNAME:-}
RUN echo "Build time CLOWDER_REMOTE_HOSTNAME: ${CLOWDER_REMOTE_HOSTNAME}"

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

# Define the argument and environment variable
# Make sure BASE_URL_ROUTE starts with a slash and does not end with a slash
ARG BASE_URL_ROUTE=""
ENV BASE_URL_ROUTE=${BASE_URL_ROUTE:-}
RUN echo "Runtime BASE_URL_ROUTE: ${BASE_URL_ROUTE}"

# Adjust the paths based on BASE_URL_ROUTE
RUN rm -rf /usr/share/nginx/html/ &&  \
  mkdir -p /usr/share/nginx/html/${BASE_URL_ROUTE}/public && \
  mkdir -p /usr/share/nginx/html/${BASE_URL_ROUTE}/styles

# Copy the built application from the previous stage
COPY --from=clowder-build /usr/src/app/dist/ /usr/share/nginx/html/${BASE_URL_ROUTE}
COPY src/public /usr/share/nginx/html/${BASE_URL_ROUTE}/public/
COPY src/styles /usr/share/nginx/html/${BASE_URL_ROUTE}/styles/

# Copy the NGINX configuration template
COPY clowder.conf.template /etc/nginx/conf.d/default.conf.template

# Use envsubst to substitute environment variables in the NGINX config template
CMD ["/bin/sh", "-c", "envsubst '${BASE_URL_ROUTE}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
