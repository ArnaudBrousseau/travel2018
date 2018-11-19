console.log('2018, a roller-coaster');


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
  var latlng = latlngstr.match(/([0-9\.-]+)/g);
  if (latlng.length !== 2) {
    console.error('latlng.length should be 2! latlng: ' + latlng);
  }

  var lat = parseFloat(latlng[0]);
  var lng = parseFloat(latlng[1]);

  // Not quite sure why, but the points plotted here aren't correctly aligning
  // on the y axis. Maybe because the North Pole isn't there in the set of
  // polygons used to generate our map background?
  var FUDGE_FACTOR = 15;

  return {
    x: ((MAP_WIDTH/360.0) * (180 + lng)),
    y: ((MAP_HEIGHT/180.0) * (90 - lat) - FUDGE_FACTOR)
  }
};

console.log("paris", toXY("('48.856614', '2.3522219')"));


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
  var mid = (startx + endx)/2 + "," + ((starty + endy)/2 + 120);
  if (isArcDown === true) {
    mid = (startx + endx)/2 + "," + ((starty + endy)/2 - 120);
  }

  path.setAttributeNS(null, "d", "M" + start + " Q" + mid + " " + end);
  path.setAttributeNS(null, "fill", "none");
  path.setAttributeNS(null, "stroke", "#aaa");
  path.setAttributeNS(null, "stroke-width", "1");

  window.requestAnimationFrame(function() {
    paths.appendChild(path);
  });
};

createPath('sf-to-paris', 237, 180, 757, 150, false);
createPath('paris-to-sf', 237, 180, 757, 150, true);

/**
 * Creates a place, e.g.
 * <circle id="placeId" cx="237" cy="180" r="4" stroke="#db9510" fill="#e9bb63" />
 */
var createPlace = function(placeId, x, y) {
  var xmlns = "http://www.w3.org/2000/svg";
  var places = document.getElementById('places');

  var place = document.createElementNS(xmlns, "circle");
  place.setAttributeNS(null, "id", placeId);
  place.setAttributeNS(null, "cx", x);
  place.setAttributeNS(null, "cy", y);
  place.setAttributeNS(null, "r", "4");
  place.setAttributeNS(null, "stroke", "#db9510");
  place.setAttributeNS(null, "fill", "#e9bb63");

  window.requestAnimationFrame(function() {
    places.appendChild(place);
  });
};


var paris = toXY("('48.856614', '2.3522219')");
var evanston = toXY("('42.0450722', '-87.6876969')");
var sf = toXY("('37.7749295', '-122.4194155')");
createPlace("evanston", evanston.x, evanston.y);
createPlace("paris", paris.x, paris.y);
createPlace("sf", sf.x, sf.y);

/**
 * Adds animations to our #animations element. Each animation looks like:
 *    <animateMotion xlink:href="#elementId" dur="0.7s" begin="0s" fill="freeze">
 *    <mpath xlink:href="#pathId" />
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
setTimeout(function() {
  animate('arnaud-sad-circle', 'sf-to-paris');
}, 2000);

var setUpSlider = function() {
  document.getElementById('day-slider').addEventListener('change', onSliderChange);
  // Show controls
  document.getElementsByClassName('controls')[0].classList.remove('hidden');
};

var showMap = function() {
  document.getElementsByClassName('map')[0].classList.remove('hidden');
}

var onSliderChange = function(e) {
  /**
   * TODO: get the corresponding positions for both of us
   * then highlight the active paths,
   * then animate to the new position and update the avatars
   */
  console.log(e.target.value);
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
