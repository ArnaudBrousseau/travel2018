from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools

assert str is not bytes, 'Use Python3 plz'

# If modifying these scopes, delete the file token.json.
SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

SPREADSHEET_ID = '1UOOUFnMppP9dAVtEdhDD0-0fvbNVxp7eVBIucOxNqcI'
LOCATIONS = 'Locations!A2:C'
GEOCODES = 'Geocodes!A2:C'


def main():
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    store = file.Storage('token.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets('credentials.json', SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('sheets', 'v4', http=creds.authorize(Http()))

    sheet = service.spreadsheets()

    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=GEOCODES,
    ).execute()
    geocodes = result.get('values', [])
    if not geocodes:
        print('No geocodes found.')
    else:
        geocodes = dict(
            [(loc, (lat, lng)) for loc, lat, lng in geocodes]
        )


    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=LOCATIONS,
    ).execute()
    locations = result.get('values', [])

    if not locations:
        print('No location data found.')
    else:
        location_data = [
            (row[0], geocodes[row[1]], geocodes[row[2]])
            for row in locations if len(row) == 3
        ]
        print(location_data)

if __name__ == '__main__':
    main()
