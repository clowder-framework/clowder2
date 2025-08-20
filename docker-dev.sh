#!/usr/bin/env sh
if [ "$1" = "up" ]
then
  docker-compose -f docker-compose.dev.yml -p clowder2-dev up -d --build
fi
if [ "$1" = "down" ]
then
  docker-compose -f docker-compose.dev.yml -p clowder2-dev down
fi
if [ "$1" = "jupyter" ] && [ "$2" = "up" ]
then
  docker-compose -f docker-compose.dev.yml -f docker-compose.jupyter-dev.yml -p clowder2-dev  up -d --build
fi

if [ "$1" = "jupyter" ] && [ "$2" = "down" ]
then
  docker-compose -f docker-compose.dev.yml -f docker-compose.jupyter-dev.yml -p clowder2-dev  down
fi
