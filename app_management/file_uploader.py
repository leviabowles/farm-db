import os

wd = '/home/lb/db_backups/'

files = os.listdir(wd)
files.sort(reverse = True)
print(files)