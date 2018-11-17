# Webapp

# Map

# Data

Create a python3 virtualenv with:

* `virtualenv --python=python3 venv`
* `curl https://bootstrap.pypa.io/get-pip.py | python`
* `pip install --upgrade google-api-python-client oauth2client`

Then follow https://developers.google.com/sheets/api/quickstart/python to get
started and get API credentials. Once running:

`cd data && python3 venv/bin/python sheet_import.py`
