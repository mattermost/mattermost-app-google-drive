#!/bin/sh
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

docker build --progress plain -t ${PROJECT} . \
&& docker rm --force ${PROJECT} || true \
&& docker container run -d --restart unless-stopped --name ${PROJECT} -e PYTHONUNBUFFERED=1 -p ${PORT}:${PORT} ${PROJECT} \
&& echo "Manifest available on http://localhost:${PORT}/manifest.json"