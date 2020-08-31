#!/bin/bash
set -e

now=$(date +%F-%H-%M-%S)
tag="ericlathrop/louisvilletech.org:$now"
docker build -t $tag .
# docker push $tag
