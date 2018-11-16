console.log('√');

var featureDetection = function() {
  // TODO: feature detection for:
  // * getElementById
}
/**
 * Adds animations, e.g.
 *    <animateMotion xlink:href="#arnaud-sad-circle" dur="0.7s" begin="0s" fill="freeze" id="one">
 *    <mpath xlink:href="#sf-to-paris" />
 *    <animateMotion xlink:href="#arnaud-sad-circle" dur="0.7s" begin="one.end" fill="freeze">
 *    <mpath xlink:href="#paris-to-singapore" />
 */
var animate = function(element_id, path_id) {
  animations = document.getElementById('animations');
  // TODO: find a way to add SVG animations on the fly, or programatically animate an object along a path.
};
animate('arnaud-sad-circle', 'sf-to-paris');
