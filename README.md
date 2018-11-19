# Map

Built with data from [NaturalEarthData](https://www.naturalearthdata.com) and
[Mapnik](https://mapnik.org/). To re-build the map:

    `make map`

# Data

This is taken from a Google Spreadsheet. To pull fresh data:

    `make data`

This will create a new `data/locations.html` file. Then manually copy/paste its
content in `webapp/index.html`.

# Webapp

Simple webapp, progressively enhanced:

* Step 0: just display the locations table
* Step 1: display SVG
* Step 2: animate it and build the controls
