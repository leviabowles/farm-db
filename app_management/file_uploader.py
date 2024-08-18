import os

wd = '/home/users/lb/db_backups'

files = os.listdir(wd)
files = files.sort(reverse = True)
print(files)