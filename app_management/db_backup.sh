## change path at install
0 3 * * * /usr/bin/mysqldump -u root farmdb > /db_backups/farmdb-$(date +\%Y\%m\%d).sql