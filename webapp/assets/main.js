console.log('2018, what a roller-coaster');


/******************************************************************************
 * Feature detection
 *****************************************************************************/

var featureDetection = function() {

  // TODO: feature detection for:
  // * getElementById
  // * setAttributeNS
  // * createElementNS
  // * appendChild
  // * requestAnimationFrame
}

/******************************************************************************
 * Map-related math
 *****************************************************************************/

MAP_WIDTH = 1200;
MAP_HEIGHT = 579;

/**
 * Goes from "('42.0450722', '-87.6876969')" to {x:..., y:...}
 */
var toXY = function(latlngstr) {
  var latlng = latlngstr.match(/([0-9\.-]{2,})/g);
  if (latlng.length !== 2) {
    console.error('latlng.length should be 2! latlng: ' + latlng);
  }

  var lat = parseFloat(latlng[0]);
  var lng = parseFloat(latlng[1]);

  // Not quite sure why, but the points plotted here aren't correctly aligning
  // on the y axis. Maybe because the North Pole isn't there in the set of
  // polygons used to generate our map background?
  var FUDGE_FACTOR = 15;

  return new Point(
    parseInt((MAP_WIDTH/360.0) * (180 + lng)),
    parseInt((MAP_HEIGHT/180.0) * (90 - lat) - FUDGE_FACTOR)
  )
};

/******************************************************************************
 * Base classes
 *****************************************************************************/

function Point(x, y) {
  this.x = x
  this.y = y
};

Point.prototype.toString = function() {
  return 'x: ' + this.x + ', y: ' + this.y;
};

/******************************************************************************
 * SVG Manipulation
 *****************************************************************************/

/**
 * Creates a path, e.g.
 * <path id="pathId" d="M237,180 Q515,50 757,150" fill="none" stroke="#aaa" stroke-width="1"></path>
 */
var createPath = function(pathId, startx, starty, endx, endy, isArcDown) {
  var xmlns = "http://www.w3.org/2000/svg";
  var paths = document.getElementById('paths');

  var path = document.createElementNS(xmlns, "path");
  path.setAttributeNS(null, "id", pathId);

  var start = startx + "," + starty;
  var end = endx + "," + endy;
  var offsetY = Math.abs(0.24 * (endx-startx));
  var offsetX = Math.abs(0.24 * (endy-starty));
  var mid = ((startx + endx)/2 + offsetX) + "," + ((starty + endy)/2 + offsetY);
  if (isArcDown === true) {
    mid = ((startx + endx)/2 - offsetX) + "," + ((starty + endy)/2 - offsetY);
  }

  path.setAttributeNS(null, "d", "M" + start + " Q" + mid + " " + end);
  path.setAttributeNS(null, "fill", "none");
  path.setAttributeNS(null, "stroke", "#aaa");
  path.setAttributeNS(null, "stroke-width", "1");

  window.requestAnimationFrame(function() {
    paths.appendChild(path);
  });
};

/**
 * Creates a place, e.g.
 * <circle id="placeId" cx="237" cy="180" r="4" stroke="#db9510" fill="#e9bb63" />
 */
var createPlace = function(placeId, x, y, colored) {
  var xmlns = "http://www.w3.org/2000/svg";
  var places = document.getElementById('places');

  var place = document.createElementNS(xmlns, "circle");
  place.setAttributeNS(null, "id", placeId);
  place.setAttributeNS(null, "cx", x);
  place.setAttributeNS(null, "cy", y);

  if (colored === true) {
    place.setAttributeNS(null, "r", "4");
    place.setAttributeNS(null, "stroke", "#db9510");
    place.setAttributeNS(null, "fill", "#e9bb63");
  } else {
    place.setAttributeNS(null, "stroke", "#ccc");
    place.setAttributeNS(null, "fill", "#fff");
    place.setAttributeNS(null, "r", "4");
  }

  window.requestAnimationFrame(function() {
    places.appendChild(place);
  });
};

/**
 * Moves a previously created place
 */
var movePlace = function(placeId, x, y) {
  var place = document.getElementById(placeId);
  place.setAttributeNS(null, "cx", x);
  place.setAttributeNS(null, "cy", y);
};

/**
 * Hides/Show a previously created place
 */
var hidePlace = function(placeId, x, y) {
  var place = document.getElementById(placeId);
  if (place) {
    place.classList.add('hidden');
  }
};
var showPlace = function(placeId, x, y) {
  var place = document.getElementById(placeId);
  if (place) {
    place.classList.remove('hidden');
  }
};

var moveFace = function(faceId, x, y) {
  var face = document.getElementById(faceId);
  face.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
};

var showFace = function(faceId) {
  var face = document.getElementById(faceId);
  if (face) {
    face.classList.remove('hidden');
    face.classList.add('transform-transition');
  }
};

var hideFace = function(faceId) {
  var face = document.getElementById(faceId);
  if (face) {
    face.classList.remove('transform-transition');
    face.classList.add('hidden');
  }
};

var ensureNonOverlapping = function(eltId, otherId) {
  // TODO: implement me
};

/**
 * Adds animations to our #animations element. Each animation looks like:
 *    <animateMotion xlink:href="#elementId" dur="0.7s" begin="0s" fill="freeze">
 *    <mpath xlink:href="#pathId" />
 * TODO: use it to animate stuff :)
 */
var animate = function(elementId, pathId) {
  var xmlns = "http://www.w3.org/2000/svg";
  var xlink = "http://www.w3.org/1999/xlink";
  var animations = document.getElementById('animations');

  var mpath = document.createElementNS(xmlns, "mpath");
  mpath.setAttributeNS (xlink, "xlink:href", "#" + pathId);

  var animateMotion = document.createElementNS(xmlns, "animateMotion");
  animateMotion.setAttributeNS(xlink, "xlink:href", "#" + elementId);
  animateMotion.setAttributeNS(null, "dur", "0.7s");
  animateMotion.setAttributeNS(null, "fill", "freeze");

  window.requestAnimationFrame(function() {
    animateMotion.appendChild(mpath);
    animations.appendChild(animateMotion);
    animateMotion.beginElement();
  });
};

var placePerson = function(locStr, who) {
    var loc = toXY(locStr);

    switch (who) {
      case 'arnaud':
        if (document.getElementById('arnaud-dot')) {
          movePlace('arnaud-dot', loc.x, loc.y);
        } else {
          createPlace('arnaud-dot', loc.x, loc.y, true);
        }
        moveFace('arnaud-sad-face', loc.x, loc.y);

        break;
      case 'ryan':
        if (document.getElementById('ryan-dot')) {
          movePlace('ryan-dot', loc.x, loc.y);
        } else {
          createPlace('ryan-dot', loc.x, loc.y, true);
        }
        moveFace('ryan-sad-face', loc.x, loc.y);
        break;
      case 'together':
        if (document.getElementById('together-dot')) {
          movePlace('together-dot', loc.x, loc.y);
        } else {
          createPlace('together-dot', loc.x, loc.y, true);
        }
        moveFace('together-face', loc.x, loc.y);
        break;
      default:
        console.error('Should not reach this case. Who: ' + who);
    }
}


/******************************************************************************
 * Control setup
 *****************************************************************************/

var setUpSlider = function() {
  //document.getElementById('day-slider').addEventListener('change', onSliderChange);
  document.getElementById('day-slider').addEventListener('input', onSliderInput);
  document.getElementById('day-slider').addEventListener('input', onSliderChange);
  // Show controls
  document.getElementsByClassName('controls')[0].classList.remove('hidden');
};

var moveLabel = function() {
  var label = document.getElementById('day-indicator');
  var slider = document.getElementById('day-slider');

  var labelWidth = label.clientWidth;

  var sliderWidth = slider.clientWidth;
  var sliderOffset = 20;
  var indicatorPosition = parseInt(
    (parseInt(slider.value)/parseInt(slider.max)) * sliderWidth
  );

  if (indicatorPosition + labelWidth < sliderWidth) {
    // We have space to position our label on the right of the indicator.
    // Do it.
    label.style.right = null;
    label.style.left = sliderOffset + indicatorPosition + 'px';
  } else {
    // We have to place our label on the left
    label.style.left = null;
    label.style.right = sliderOffset + (sliderWidth - indicatorPosition) + 'px';
  }

};

var showMap = function() {
  plotPlaces();
  document.getElementsByClassName('map')[0].classList.remove('hidden');
}

var plotPlaces = function() {
  var previousArnaudLocation = null;
  var previousRyanLocation = null;
  // Gosh it really sucks that {x: 1, y: 2} != {x: 1, y:2}
  // TODO: research custom equality functions?
  var previousArnaudLocationStr = null;
  var previousRyanLocationStr = null;

  var plottedPlaces = [];
  var rows = document.getElementsByTagName('tr');

  for (var i=0; i < rows.length; i++) {
    var locationCells = rows[i].getElementsByTagName('td');
    if (locationCells.length === 3) {
      var arnaudLocationStr = locationCells[1].innerHTML;
      var ryanLocationStr = locationCells[2].innerHTML;
      var arnaudLocation = toXY(arnaudLocationStr);
      var ryanLocation = toXY(ryanLocationStr);

      if (plottedPlaces.indexOf(arnaudLocationStr) === -1) {
        // i acts as the ID here, but we don't really care
        createPlace(i, arnaudLocation.x, arnaudLocation.y, false);
        plottedPlaces.push(arnaudLocationStr);
      }
      if (plottedPlaces.indexOf(ryanLocationStr) === -1) {
        // -i acts as the ID here, but we don't really care
        createPlace(-i, ryanLocation.x, ryanLocation.y, false)
        plottedPlaces.push(ryanLocationStr);
      }

      // Now let's plot paths.
      if (previousArnaudLocationStr !== null && previousRyanLocationStr !== null) {
        // case where we had previous locations
        if (previousArnaudLocationStr == arnaudLocationStr && previousRyanLocationStr == ryanLocationStr && arnaudLocationStr == ryanLocationStr) {
          // We have only one path to draw
          // It arcs down if the path goes from right to left (arbitrary)
          var isArcDown = !!(ryanLocation.x-previousRyanLocation.x < 0);
          createPath(i, previousRyanLocation.x, previousRyanLocation.y, ryanLocation.x, ryanLocation.y, isArcDown);
        } else {
          if (ryanLocationStr != previousRyanLocationStr) {
            var isArcDown = !!(ryanLocation.x-previousRyanLocation.x < 0);
            createPath(i, previousRyanLocation.x, previousRyanLocation.y, ryanLocation.x, ryanLocation.y, isArcDown);
          }
          if (arnaudLocationStr != previousArnaudLocationStr) {
            var isArcDown = !!(arnaudLocation.x-previousArnaudLocation.x < 0);
            createPath(i, previousArnaudLocation.x, previousArnaudLocation.y, arnaudLocation.x, arnaudLocation.y, isArcDown);
          }
        }
      }
      previousArnaudLocation = arnaudLocation;
      previousRyanLocation = ryanLocation;
      // GRRRrrr. Makes me angry to have to do this. Really JavaScript?
      previousArnaudLocationStr = arnaudLocationStr;
      previousRyanLocationStr = ryanLocationStr;
    }
  }
};

var updateLabel = function(content) {
  var label = document.getElementById('day-indicator');
  label.innerHTML = content;
  moveLabel();
};

/**
 * From "Fontainebleau, France ('48.404676', '2.70162')" to "Fontainebleau"
 */
var shortLoc = function(fullLoc) {
  return fullLoc.split('(')[0].split(',')[0];
};

var getLabelContent = function(date, arnaudLocation, ryanLocation) {
  if (arnaudLocation !== ryanLocation) {
    return date + ': ' + 'Ryan in ' + shortLoc(ryanLocation) + ' // Arnaud in ' + shortLoc(arnaudLocation);
  } else {
    return date + ': ' + 'together in ' + shortLoc(arnaudLocation);
  }
}

var onSliderChange = function(e) {
  var date = e.target.value;
  var isoDate = dayOfYearToDate(date);
  updateLabel(isoDate);

  // Now let's get the corresponding positions for both of us
  var locationData = document.getElementById('location-data');
  var locationRow = locationData.getElementsByClassName(isoDate);
  if (locationRow.length === 1) {
    var locationCells = locationRow[0].getElementsByTagName('td');
    if (locationCells.length === 3) {
      var arnaudLocation = locationCells[1].innerHTML;
      var ryanLocation = locationCells[2].innerHTML;
      var labelContent = getLabelContent(isoDate, arnaudLocation, ryanLocation);
      updateLabel(labelContent);

      if (arnaudLocation !== ryanLocation) {
        placePerson(arnaudLocation, 'arnaud');
        placePerson(ryanLocation, 'ryan');
        hideFace('together-face');
        hidePlace('together-dot');
        showFace('arnaud-sad-face');
        showFace('ryan-sad-face');
        showPlace('arnaud-dot');
        showPlace('ryan-dot');
      } else {
        placePerson(arnaudLocation, 'together');
        showFace('together-face');
        showPlace('together-dot');
        hideFace('arnaud-sad-face');
        hideFace('ryan-sad-face');
        hidePlace('arnaud-dot');
        hidePlace('ryan-dot');
      }
    } else {
      console.error('Expected 3 <td>s in: ' + locationCells);
    }
  } else {
    console.error('No location info for ' + isoDate);
  }
};

/**
 * Not the prettiest code I've ever written, although from an art perspective
 * it's kinda neat :)
 */
var dayOfYearToDate = function(day) {
  if (day <= 31) {
    return '2018-01-'+ padDay(day);
  } else if (day <= 31+28) {
    return '2018-02-'+ padDay(day-31);
  } else if (day <= 31+28+31) {
    return '2018-03-'+ padDay(day-31-28);
  } else if (day <= 31+28+31+30) {
    return '2018-04-'+ padDay(day-31-28-31);
  } else if (day <= 31+28+31+30+31) {
    return '2018-05-'+ padDay(day-31-28-31-30);
  } else if (day <= 31+28+31+30+31+30) {
    return '2018-06-'+ padDay(day-31-28-31-30-31);
  } else if (day <= 31+28+31+30+31+30+31) {
    return '2018-07-'+ padDay(day-31-28-31-30-31-30);
  } else if (day <= 31+28+31+30+31+30+31+31) {
    return '2018-08-'+ padDay(day-31-28-31-30-31-30-31);
  } else if (day <= 31+28+31+30+31+30+31+31+30) {
    return '2018-09-'+ padDay(day-31-28-31-30-31-30-31-31);
  } else if (day <= 31+28+31+30+31+30+31+31+30+31) {
    return '2018-10-'+ padDay(day-31-28-31-30-31-30-31-31-30);
  } else if (day <= 31+28+31+30+31+30+31+31+30+31+30) {
    return '2018-11-'+ padDay(day-31-28-31-30-31-30-31-31-30-31);
  } else if (day <= 31+28+31+30+31+30+31+31+30+31+30+31) {
    return '2018-12-'+ padDay(day-31-28-31-30-31-30-31-31-30-31-30);
  } else {
    console.error('day cannot be more than 365');
  }
};

var padDay = function(day) {
  if (String(day).length === 1) {
    return '0' + day
  } else {
    return String(day);
  }
};

var onSliderInput = function(e) {
  // "date" is 1 through 365. 2018 isn't a leap year.
  var date = e.target.value;
  var isoDate = dayOfYearToDate(date);
  document.getElementById('day-indicator').innerHTML = isoDate;
  moveLabel();
};

/******************************************************************************
 * Ready? Get set? Go.
 *****************************************************************************/
var start = function() {
  setUpSlider();
  showMap();
};

requestAnimationFrame(function() {
  start();
});
