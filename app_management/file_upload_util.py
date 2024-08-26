import pandas as pd
import io
import os.path
import base64
from email.message import EmailMessage
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from oauth2client.service_account import ServiceAccountCredentials

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


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://mail.google.com/']


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
       creds = ServiceAccountCredentials.from_json_keyfile_name(
        """path_to_cred_file.json""", SCOPES)

    try:
        # Call the Gmail API
        service = build('gmail', 'v1', credentials=creds)
        message = EmailMessage()
        message.set_content('This is automated draft mail')
        message['To'] = 'somemail@gmail.com'
        message['From'] = 'somemail@gmail.com'
        message['Subject'] = 'Automated draft'

        # encoded message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {
            'message': {
                'raw': encoded_message
            }
        }
        # pylint: disable=E1101
        draft = service.users().drafts().create(userId="me",
                                                body=create_message).execute()
    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f'An error occurred: {error}')


if __name__ == '__main__':
    main()
