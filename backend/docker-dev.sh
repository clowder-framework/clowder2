#!/usr/bin/env sh
if [ $1 == "up" ]
then
  docker-compose -f docker-compose.dev.yml up -d
  # need to add volume so we can copy the clowder theme into the right place inside the container
  echo "keycloak container id:" $(docker ps -aqf "name=keycloak")
  docker cp ./keycloak/clowder-theme/. $(docker ps -aqf "name=keycloak"):/opt/jboss/keycloak/themes/clowder-theme
  docker restart $(docker ps -aqf "name=keycloak")
fi
if [ $1 == "down" ]
then
  docker-compose -f docker-compose.dev.yml down
fi
