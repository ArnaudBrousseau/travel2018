console.log('2018, what a roller-coaster!');


/******************************************************************************
 * Feature detection
 *****************************************************************************/

var detectMissingFeatures = function() {
  var missingFeatures = []
  if (!!document.getElementById === false) {
    missingFeatures.push('getElementById');
  }
  if (!!HTMLElement.prototype.setAttributeNS === false) {
    missingFeatures.push('setAttributeNS');
  }
  if (!!document.createElementNS === false) {
    missingFeatures.push('createElementNS');
  }
  if (!!String.prototype.trim === false) {
    missingFeatures.push('String.trim');
  }
  if (!!typeof window.SVGRect === "undefined") {
    missingFeatures.push('SVG');
  }
  return missingFeatures;
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
  this.x = parseInt(x);
  this.y = parseInt(y);
};

Point.prototype.toString = function() {
  return 'x: ' + this.x + ', y: ' + this.y;
};

/******************************************************************************
 * SVG Manipulation
 *****************************************************************************/

/**
 * Creates a path, e.g.
 * <path id="237180757150" d="M237,180 Q515,50 757,150" fill="none" stroke="#aaa" stroke-width="1"></path>
 */
var createPath = function(startx, starty, endx, endy, isArcDown) {
  var xmlns = "http://www.w3.org/2000/svg";
  var paths = document.getElementById('paths');

  var path = document.createElementNS(xmlns, "path");
  var pathId = ''+startx+starty+endx+endy;

  // Let's not draw the same path again!
  if (document.getElementById(pathId) !== null) {
    return;
  }

  path.setAttributeNS(null, "id", ''+startx+starty+endx+endy);

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

  RAF(function() {
    paths.appendChild(path);
  });
};

/**
 * Creates a place, e.g.
 * <circle id="placeId" cx="237" cy="180" r="4" stroke="#db9510" fill="#e9bb63" />
 */
var createPlace = function(placeId, x, y, colored, labelContent) {
  var xmlns = "http://www.w3.org/2000/svg";
  var places = document.getElementById('places');

  var group = document.createElementNS(xmlns, "g");
  group = document.createElementNS(xmlns, "g");
  group.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");
  group.setAttributeNS(null, "id", placeId);

  var place = document.createElementNS(xmlns, "circle");

  if (colored === true) {
    place.setAttributeNS(null, "r", "4");
    place.setAttributeNS(null, "stroke", "#db9510");
    place.setAttributeNS(null, "fill", "#e9bb63");
  } else {
    place.setAttributeNS(null, "stroke", "#ccc");
    place.setAttributeNS(null, "fill", "#fff");
    place.setAttributeNS(null, "r", "4");
  }


  var label = document.createElementNS(xmlns, "text");
  label.setAttributeNS(null, "id", placeId + "-label");
  label.setAttributeNS(null, "x", 0);
  label.setAttributeNS(null, "y", 20);
  label.setAttributeNS(null, "fill", "#444");
  label.setAttributeNS(null, "text-anchor", "middle");
  label.innerHTML = labelContent;

  RAF(function() {
    group.appendChild(place);
    group.appendChild(label);
    places.appendChild(group);
  });
};

/**
 * Moves a previously created place and optionally updates its label
 */
var movePlace = function(placeId, x, y, labelContent) {
  var place = document.getElementById(placeId);
  place.setAttributeNS(null, "transform", "translate(" + x + " " + y + ")");

  var labelContent = labelContent || '';
  var label = document.getElementById(placeId + "-label");
  label.innerHTML = labelContent;
  label.setAttributeNS(null, "x", 0);
};

var updateLabel = function(placeId, labelContent) {
  var label = document.getElementById(placeId + "-label");
  label.innerHTML = labelContent;
};

/**
 * That's a bit tricky. The x, y pair that we're receiving is an absolute
 * coordinate pair. But labels are within a <g> and placed with relative
 * coordinates.
 */
var moveLabel = function(placeId, x) {
  var place = document.getElementById(placeId);
  var placePosition = getPosition(place);

  var label = document.getElementById(placeId + "-label");
  label.setAttributeNS(null, "x", x-placePosition.x);
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

var cleanupAnimationTimer = undefined;
var cleanupAnimations = function() {
  if (cleanupAnimationTimer) {
    window.clearTimeout(cleanupAnimationTimer);
  }
  cleanupAnimationTimer = window.setTimeout(function() {
    var previousAnimations = document.getElementsByClassName('face-animations');
    if (previousAnimations.length > 0) {
      for (var i=0; i<previousAnimations.length; i++) {
        if (previousAnimations[i].getCurrentTime() > 1) {
          previousAnimations[i].remove();
        }
      }
    }
  }, 1000);
};

var moveFace = function(faceId, targetX, targetY) {
  var face = document.getElementById(faceId);

  var startPos = getPosition(face);
  if (startPos !== null) {
    var xmlns = 'http://www.w3.org/2000/svg';
    var transform = document.createElementNS(xmlns, 'animateTransform');
    transform.setAttributeNS(null, 'attributeName', 'transform');
    transform.setAttributeNS(null, 'type', 'translate');
    transform.setAttributeNS(null, 'from', startPos.x + ' ' + startPos.y);
    transform.setAttributeNS(null, 'to', targetX + ' ' + targetY);
    transform.setAttributeNS(null, 'dur', '0.2s');
    transform.setAttributeNS(null, 'class', 'face-animations');
    face.appendChild(transform);
    transform.beginElement();
    cleanupAnimations();
  }

  face.setAttributeNS(null, "transform", "translate(" + targetX + " " + targetY + ")");
};

var showFace = function(faceId) {
  var face = document.getElementById(faceId);
  if (face) {
    face.classList.remove('hidden');
  }
};

var hideFace = function(faceId) {
  var face = document.getElementById(faceId);
  if (face) {
    face.classList.add('hidden');
  }
};

var isFaceHidden = function(faceId) {
  var face = document.getElementById(faceId);
  if (face) {
    return face.classList.contains('hidden');
  } else {
    return false;
  }
};

/**
 * Check if 2 elements are non-overlapping on the x axis
 * If they are, visually separate them out by adjusting their position
 */
var positionToPreventOverlap = function(eltId, otherId) {
  var elt = document.getElementById(eltId);
  var other = document.getElementById(otherId);

  var minDistance = elt.getBBox().width / 2 + other.getBBox().width / 2 + 10;

  var eltPosition = getPosition(elt);
  var otherPosition = getPosition(other);

  var diffX = eltPosition.x - otherPosition.x;

  var newPositions = [];

  if (0 <= diffX && diffX < minDistance) {
    var adjustment = minDistance - diffX;
    newPositions = [
      [eltPosition.x + parseInt(adjustment/2), eltPosition.y],
      [otherPosition.x - parseInt(adjustment/2), otherPosition.y]
    ]
  } else if (0 <= -diffX && -diffX < minDistance){
    var adjustment = minDistance - (-diffX);
    newPositions  = [
      [eltPosition.x - parseInt(adjustment/2), eltPosition.y],
      [otherPosition.x + parseInt(adjustment/2), otherPosition.y]
    ]
  }

  return newPositions;
};

/**
 * Given an element, use its "transform" attribute to return a Point
 */
var getPosition = function(elt) {
  var transformProp = elt.getAttribute('transform');
  if (transformProp === null || transformProp === undefined) {
    return null;
  }
  var position = transformProp.match(/translate\(([0-9.]+) ([0-9.]+)\)/);
  return new Point(position[1], position[2]);
};

var placePerson = function(locStr, who) {
    var loc = toXY(locStr);
    var label = shortLoc(locStr);

    switch (who) {
      case 'arnaud':
        if (document.getElementById('arnaud-dot')) {
          movePlace('arnaud-dot', loc.x, loc.y, label);
        } else {
          createPlace('arnaud-dot', loc.x, loc.y, true, label);
        }
        moveFace('arnaud-sad-face', loc.x, loc.y);

        break;
      case 'ryan':
        if (document.getElementById('ryan-dot')) {
          movePlace('ryan-dot', loc.x, loc.y, label);
        } else {
          createPlace('ryan-dot', loc.x, loc.y, true, label);
        }
        moveFace('ryan-sad-face', loc.x, loc.y);
        break;
      case 'together':
        if (document.getElementById('together-dot')) {
          movePlace('together-dot', loc.x, loc.y, label);
        } else {
          createPlace('together-dot', loc.x, loc.y, true, label);
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
  document.getElementById('day-slider').addEventListener('input', onSliderChange);
  document.getElementById('day-slider').addEventListener('change', onSliderChange);
  // Populate & Show controls
  populateTimeline();
  document.getElementsByClassName('controls')[0].classList.remove('hidden');
};

var populateTimeline = function() {
  var timeline = document.getElementById('timeline');
  var rows = document.getElementsByTagName('tr');

  // i=0 is the header row
  for (var i=1; i < rows.length; i++) {
    var span = document.createElement("span");
    if (rows[i].classList.contains('together')) {
      span.classList.add('together');
    }
    // 1/365 = 0.002739726027...
    span.style.left = i*0.273972603 + '%';
    timeline.appendChild(span);
  }
};

var setUpButtons = function() {
  var slider = document.getElementById('day-slider');

  // No need to check that the value is between 1 and 365. Setting a value of
  // -2 or 370 will result in the min/max being set since these limits are set
  // in HTML.
  document.getElementById('right').addEventListener('click', function() {
    slider.value = parseInt(slider.value) + 1;
    onSliderChange();
  });
  document.getElementById('left').addEventListener('click', function() {
    slider.value = parseInt(slider.value) - 1;
    onSliderChange();
  });
}

var showMap = function() {
  plotPlaces();
  plotFaces();
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
        createPlace(i, arnaudLocation.x, arnaudLocation.y, false, '');
        plottedPlaces.push(arnaudLocationStr);
      }
      if (plottedPlaces.indexOf(ryanLocationStr) === -1) {
        // -i acts as the ID here, but we don't really care
        createPlace(-i, ryanLocation.x, ryanLocation.y, false, '')
        plottedPlaces.push(ryanLocationStr);
      }

      // Now let's plot paths.
      if (previousArnaudLocationStr !== null && previousRyanLocationStr !== null) {
        // case where we had previous locations
        if (previousArnaudLocationStr == arnaudLocationStr && previousRyanLocationStr == ryanLocationStr && arnaudLocationStr == ryanLocationStr) {
          // We have only one path to draw
          // It arcs down if the path goes from right to left (arbitrary)
          var isArcDown = !!(ryanLocation.x-previousRyanLocation.x < 0);
          createPath(previousRyanLocation.x, previousRyanLocation.y, ryanLocation.x, ryanLocation.y, isArcDown);
        } else {
          if (ryanLocationStr != previousRyanLocationStr) {
            var isArcDown = !!(ryanLocation.x-previousRyanLocation.x < 0);
            createPath(previousRyanLocation.x, previousRyanLocation.y, ryanLocation.x, ryanLocation.y, isArcDown);
          }
          if (arnaudLocationStr != previousArnaudLocationStr) {
            var isArcDown = !!(arnaudLocation.x-previousArnaudLocation.x < 0);
            createPath(previousArnaudLocation.x, previousArnaudLocation.y, arnaudLocation.x, arnaudLocation.y, isArcDown);
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

/**
 * This function is here to place the faces at their initial position
 */
var plotFaces = function() {
  var rows = document.getElementsByTagName('tr');
  var locationCells = rows[1].getElementsByTagName('td');

  // We know that 2018 start together in Paris
  var locationStr = locationCells[1].innerHTML;
  var loc = toXY(locationStr);
  moveFace('arnaud-sad-face', loc.x, loc.y);
  moveFace('ryan-sad-face', loc.x, loc.y);
  moveFace('together-face', loc.x, loc.y);
  hideFace('arnaud-sad-face');
  hideFace('ryan-sad-face');
}

/**
 * From "Fontainebleau, France ('48.404676', '2.70162')" to "Fontainebleau"
 */
var shortLoc = function(fullLoc) {
  return fullLoc.split('(')[0].split(',')[0].trim();
};

var displayDate = function(isoDate) {
  var date = new Date(isoDate)
  var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayOfWeek = weekdays[date.getDay()];
  var months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
  var month = months[date.getMonth()];
  var day = date.getDate().toString()
  if (day === '1' || day === '21' || day === '31') {
    day = day + 'st';
  } else if (day === '2' || day === '22') {
    day = day + 'nd';
  } else if (day === '3' || day === '23') {
    day = day + 'rd';
  } else {
    day = day + 'th';
  }
  document.getElementById('date-display').innerHTML = dayOfWeek + ' ' + month + ' ' + day;
};

var timer;
var currentLocations;
var onSliderChange = function() {
  document.getElementById('day-indicator').classList.add('hidden');
  var slider = document.getElementById('day-slider');
  var date = slider.value;
  var isoDate = dayOfYearToDate(date);

  displayDate(isoDate);

  // Now let's get the corresponding positions for both of us
  var locationData = document.getElementById('location-data');
  var locationRow = locationData.getElementsByClassName(isoDate);
  if (locationRow.length === 1) {
    var locationCells = locationRow[0].getElementsByTagName('td');
    if (locationCells.length === 3) {
      var arnaudLocation = locationCells[1].innerHTML;
      var ryanLocation = locationCells[2].innerHTML;

      if (currentLocations === arnaudLocation + ryanLocation) {
        return;
      } else {
        currentLocations = arnaudLocation + ryanLocation;
        if (arnaudLocation !== ryanLocation) {
          placePerson(arnaudLocation, 'arnaud');
          placePerson(ryanLocation, 'ryan');
          var newFacePositions = positionToPreventOverlap('arnaud-sad-face', 'ryan-sad-face');
          if (newFacePositions.length) {
            moveFace('arnaud-sad-face', newFacePositions[0][0], newFacePositions[0][1]);
            moveFace('ryan-sad-face', newFacePositions[1][0], newFacePositions[1][1]);
          }
          hideFace('together-face');
          hidePlace('together-dot');
          showFace('arnaud-sad-face');
          showFace('ryan-sad-face');

          showPlace('arnaud-dot');
          showPlace('ryan-dot');
          var newLabelPositions = positionToPreventOverlap('arnaud-dot', 'ryan-dot');
          if (newLabelPositions.length) {
            moveLabel('arnaud-dot', newLabelPositions[0][0]);
            moveLabel('ryan-dot', newLabelPositions[1][0]);
          }
        } else {
          placePerson(arnaudLocation, 'arnaud');
          placePerson(ryanLocation, 'ryan');
          var newFacePositions = positionToPreventOverlap('arnaud-sad-face', 'ryan-sad-face');
          if (newFacePositions.length) {
            moveFace('arnaud-sad-face', newFacePositions[0][0], newFacePositions[0][1]);
            moveFace('ryan-sad-face', newFacePositions[1][0], newFacePositions[1][1]);
          }
          placePerson(arnaudLocation, 'together');

          if (isFaceHidden('together-face')) {
            // If the face "together" was previously hidden, don't show it right away
            if (timer !== undefined) { clearTimeout(timer); }
            timer = setTimeout(function() {
              showFace('together-face');
              hideFace('arnaud-sad-face');
              hideFace('ryan-sad-face');
              timer = undefined;
            }, 200);
          } else {
            showFace('together-face');
            hideFace('arnaud-sad-face');
            hideFace('ryan-sad-face');
          }

          showPlace('together-dot');
          hidePlace('arnaud-dot');
          hidePlace('ryan-dot');
        }
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

var showTable = function() {
  document.getElementById('location-data').classList.remove('hidden');
};

/**
 * Displays an error message. Right now, simply display an error with `alert`
 */
var displayError = function(message) {
  alert(message);
};

var hideLoader = function() {
  document.getElementById('loader').classList.add('hidden');
}

var setupTip = function() {
  var tipBox = document.getElementById('landscape-tip');
  var tipLink = document.getElementById('landscape-tip-close');

  tipLink.addEventListener('click', function() {
    tipBox.remove();
  });
};

var RAF = function(fn) {
  if (!!window.requestAnimationFrame === true) {
    return window.requestAnimationFrame(fn);
  } else {
    return fn.apply(this, arguments);
  }
};

/******************************************************************************
 * Ready? Get set? Go.
 *****************************************************************************/
var start = function() {
  var missingFeatures = detectMissingFeatures();
  if (missingFeatures.length > 0) {
    displayError('Oh no! Looks like your browser does not support the following features needed by this webapp: ' + missingFeatures)
    showTable();
  } else {
    setUpSlider();
    setUpButtons();
    showMap();
    hideLoader();
    setupTip();
  }
};

window.requestAnimationFrame(function() {
  start();
});
