import os
from googleapiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools

assert str is not bytes, 'Use Python3 plz'

DIR_PATH = os.path.dirname(os.path.realpath(__file__))

# If modifying these scopes, delete the file token.json.
SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

SPREADSHEET_ID = '1UOOUFnMppP9dAVtEdhDD0-0fvbNVxp7eVBIucOxNqcI'
LOCATIONS = 'Locations!A2:C'
GEOCODES = 'Geocodes!A2:C'


def generate_table(location_data):
    table = '  <table>\n'
    table += '    <tr>\n'
    table += '      <th>Date</th><th>Arnaud</th><th>Ryan</th>\n'
    table += '    </tr>\n'

    for date, arnaud_location_name, arnaud_location, ryan_location_name, ryan_location in location_data:
        if arnaud_location == ryan_location:
            table += '    <tr class="together">\n'
        else:
            table += '    <tr>\n'
        table += '      <td>{}</td>\n'.format(date)
        table += '      <td>{} {}</td>\n'.format(arnaud_location_name, arnaud_location)
        table += '      <td>{} {}</td>\n'.format(ryan_location_name, ryan_location)
        table += '    </tr>\n'

    table += '  </table>\n'
    return table

def main():
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    store = file.Storage(DIR_PATH + '/token.json')
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets(DIR_PATH + '/credentials.json', SCOPES)
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
            (
                row[0],
                row[1],
                geocodes[row[1]],
                row[2],
                geocodes[row[2]],
            )
            for row in locations if len(row) == 3
        ]

    table = generate_table(location_data)
    print(table)

    with open(DIR_PATH + '/locations.html', 'w') as f:
        f.write(table)

if __name__ == '__main__':
    main()
