#!/usr/bin/env sh
if [ $1 == "up" ]
then
  docker-compose --compatibility -f docker-compose.dev.yml -p clowder2-dev up -d
fi
if [ $1 == "down" ]
then
  docker-compose -f docker-compose.dev.yml -p clowder2-dev down
fi
