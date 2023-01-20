#!/bin/sh
  
image=farm_dev
DBUSER=$(keyring get mysql user)
DBPW=$(keyring get mysql ${DBUSER})

echo "${DBUSER}"
echo "${DBPW}"

sudo docker run -it -p 8080:8080 --add-host host.docker.internal:host-gateway -e DB="farmdb_dev" -e DBUSER="${DBUSER}" -e DBPW="${DBPW}" -v $(pwd):/var/www --rm ${image} 
