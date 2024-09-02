import os
import file_upload_util
scope = ['https://www.googleapis.com/auth/drive']
service_account_json_key = 'farm-db-key.json'
wd = '/home/lb/db_backups/'
#file_metadata = {'name': wd}
mime_type = 'text/plain'

up_file = file_upload_util.upload_gdrive(scope = scope, key = service_account_json_key)
up_file.get_latest_file(wd = wd)
up_file.upload_file(mimetype = mime_type)

