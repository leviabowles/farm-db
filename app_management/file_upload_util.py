import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.http import MediaFileUpload
import io
from googleapiclient.errors import HttpError


scope = ['https://www.googleapis.com/auth/drive']
service_account_json_key = 'farm-db-key.json'
credentials = service_account.Credentials.from_service_account_file(
                              filename=service_account_json_key, 
                              scopes=scope)
service = build('drive', 'v3', credentials=credentials)


file_metadata = {'name': 'bip.csv'}
media = MediaFileUpload('bip.csv',
                        mimetype='text/csv')

file = service.files().create(body=file_metadata, media_body=media,
                              fields='id').execute()