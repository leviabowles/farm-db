#!/bin/sh
  
image=$1

docker run -d --name farm -p 8000:8000 --add-host host.docker.internal:host-gateway -v $(pwd):/var/www --rm ${image} 
