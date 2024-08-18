import os

wd = '/home/user/lb/db_backups'

files = os.listdir(wd)
files = files.sort(reverse = True)
print(files)