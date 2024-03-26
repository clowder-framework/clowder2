#!/bin/sh

# Exit on error
set -e

# use DEBUG=echo ./docker.sh to print all commands
export "DEBUG=${DEBUG:-""}"

# Find out what branch we are on
BRANCH=${BRANCH:-"$(git rev-parse --abbrev-ref HEAD)"}

# Find out the version
if [ "$BRANCH" = "master" ]; then
    DEPLOY_ENV="production"
    VERSION="latest"
elif [ "${BRANCH}" = "develop" ]; then
    DEPLOY_ENV="development"
    VERSION="develop"
else
		DEPLOY_ENV="test"
    VERSION="test"
fi

# Build docker image
$DEBUG docker build --build-arg DEPLOY_ENV="${DEPLOY_ENV}" -t hub.ncsa.illinois.edu/clowder/clowder2-frontend:$VERSION .
