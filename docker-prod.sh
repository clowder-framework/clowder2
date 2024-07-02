#!/usr/bin/env sh
if [ "$1" = "prod" ] && [ "$2" = "up" ]
then
  docker-compose -f docker-compose.yml -f docker-compose.jupyter.yml up -d
fi

if [ "$1" = "prod" ] && [ "$2" = "down" ]
then
  docker-compose -f docker-compose.yml -f docker-compose.jupyter.yml down
fi
