# Traveling Through 2018

## Purpose

This repo tries to accomplish a bunch of different things:

* visualize travel data from 2018
* explore the process of map creation from pure data (see "Map", below)
* play with the Google Spreadsheet API instead of having to deal with a DB
  (see "Data" below)
* learn about SVG as a technology; in particular its scaling and animation features
* avoid using *any* JavaScript or CSS frameworks for once; only vanilla is
  allowed. This means doing feature-detection and progressive enhancement by
  hand, this means having to deal with vendor prefixes in places, this means
  having to write not-so-pretty code at times.

## Map

Built with data from [NaturalEarthData](https://www.naturalearthdata.com) and
[Mapnik](https://mapnik.org/). To re-build the map:

    `make map`

## Data

This is taken from a Google Spreadsheet. To pull fresh data:

    `make data`

This will create a new `data/locations.html` file. Then manually copy/paste its
content in `webapp/index.html`.

## Webapp

No framework allowed here! Pure hand-written HTML/SVG/CSS/JS.

I'm also trying to do progressive enhancement. The data is there to begin with
in a `<table>`, and the visualization elements built from this piece by piece.

## Deploying

This is a static page, hosted with Github pages:

    $ git checkout gh-pages
    $ make
    $ git push origin HEAD

That's it!
