// FOR CORD SYSTEM
var WIDTH = 600;
var HEIGHT = 600;

// Map projection types

// Code of the spherical projection of Earth (Used in GPS)
// More intfo: https://spatialreference.org/ref/epsg/wgs-84/
var source = new proj4.defs('EPSG:4326');
// Spherical Mercator projection
// Cordinates are in a flat meter grid
// More info: https://en.wikipedia.org/wiki/Web_Mercator_projection
var dest = new proj4.defs('EPSG:3857');

// COPIED INCASE IF DELETED
// 42.361145, -71.057083 CENTER
// 42.34211495715386, -71.08283042907715 - BOTTOM LEFT
// 42.38016777594189, -71.03133201599121 - TOP RIGTH


// Cordinates of the map image
// Calculated using the MapBox API 
var CENTER_CORD = {
   lat: 42.361145,
   long: -71.057083,
};

var BOTTOM_LEFT_CORD = {
   lat: 42.34211495715386,
   long: -71.08283042907715,
};

var TOP_RIGTH_CORD = {
   lat: 42.38016777594189,
   long: -71.03133201599121
};


// Spherical Mercator projection Cords
var CENTER_MERC = this.toMercadorProjection(CENTER_CORD.lat, CENTER_CORD.long);
var BOTTOM_LEFT_MERC = this.toMercadorProjection(BOTTOM_LEFT_CORD.lat, BOTTOM_LEFT_CORD.long);
var TOP_RIGTH_MERC = this.toMercadorProjection(TOP_RIGTH_CORD.lat, TOP_RIGTH_CORD.long);
var MERC_WIDTH = Math.abs(BOTTOM_LEFT_MERC.x - TOP_RIGTH_MERC.x);
var MERC_HEIGHT = Math.abs(BOTTOM_LEFT_MERC.y - TOP_RIGTH_MERC.y);

// TRANSFORM CONST
var MERC_X_RATIO = WIDTH / MERC_WIDTH;
var MERC_Y_RATIO = HEIGHT / MERC_HEIGHT;

var center = this.toPixelCord(CENTER_CORD.lat, CENTER_CORD.long);

// PARAMS: Latitude and longitute points
// RETURNS: A Maercador Projection Cord
// Used to calculate the cord pixel location
function toMercadorProjection(long, lat) {
   var merc = proj4(source, dest, [lat, long]);
   // console.log(lat + ", " + long + " TRANSFORMED TO " + merc);
   return {
      x: merc[0],
      y: merc[1],
   }
}

// PARAMS: Latitude and longitute points
// RETURNS: A cord mapped to the canvas pixel grid (integer, integer)
// Given a latitude and longitude point it is converted to a canvas cord
// Latitude (North/South) & Longitude (West/East)
function toPixelCord(lat, long) {

   var mercCord = this.toMercadorProjection(lat, long);

   // If cord is out of bound, don't convert/show
   if (this.mercOutOfBound(mercCord)) {
      return {
         x: -1,
         y: -1
      };
   } else {
      // Calculate mercador projection cord and use a linear transfofrmation
      // to convert to pixel grid
      var x = Math.abs(mercCord.x - BOTTOM_LEFT_MERC.x);
      var y = Math.abs(mercCord.y - TOP_RIGTH_MERC.y);
      // console.log(mercCord.x + ", " + mercCord.y + "TO MERC-CORD: " + x, y);
      // console.log(x * MERC_X_RATIO, y * MERC_Y_RATIO);
      return {
         x: Math.round(x * MERC_X_RATIO),
         y: Math.round(y * MERC_Y_RATIO),
      };
   }

}

// PARAMS: A Mercador Cord Object
// RETURNS: True if the merc cord is out of map bound
// Checks if a mercCord is out of ound with the canvas map
function mercOutOfBound(mercCord) {

   if (mercCord.x < BOTTOM_LEFT_MERC.x || mercCord.x > TOP_RIGTH_MERC.x) {
      // console.log("OUT OF BOUND:" + mercCord.x + " ," + mercCord.y);
      return true;
   } else if (mercCord.y > TOP_RIGTH_MERC.y || mercCord.y < BOTTOM_LEFT_MERC.y) {
      // console.log("OUT OF BOUND:" + mercCord.x + " ," + mercCord.y);
      return true;
   } else {
      return false;
   }
}