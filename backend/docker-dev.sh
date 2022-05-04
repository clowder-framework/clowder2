#!/usr/bin/env sh
if [ $1 == "up" ]
then
  docker-compose -f docker-compose.dev.yml up -d
fi
if [ $1 == "down" ]
then
  docker-compose -f docker-compose.dev.yml down
fi
