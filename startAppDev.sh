#!/bin/sh
  
image=farm_dev


docker run -it -p 8080:8080 --add-host host.docker.internal:host-gateway -e DB="farmdb_dev" -v $(pwd):/var/www --rm ${image} 
