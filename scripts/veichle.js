// Object Array used for faster access (performance)
var allVeichles = {};

// PARAMS: String Veichle ID, Canvas Cords, Bearing Direction, and Route ID
// EFFECT: Creates a veichle Object
function Veichle(id, cord, bearing, routeId) {
   this.id = id;
   this.cord = cord
   this.cords = [this.cord];
   this.bearing = bearing;
   this.routeId = routeId;
   this.color = allRoutes[routeId] != undefined ? allRoutes[routeId].color : "white";
   this.draw = drawVeichle;
   this.update = updateVeichle;
}

// PARAMS: JSON Object
// EFFECT: Converts JSON Object to a Veichle
// Creates a veichle object and adds it to the allVeichles object array
function jsonToVeichle(json) {
   var routeId = json.relationships.route.data.id;
   var veichle = new Veichle(
      json.id,
      toPixelCord(json.attributes.latitude, json.attributes.longitude),
      json.attributes.bearing,
      routeId);
   // Only Add veichles bounded to the map 
   // This ensures the list is not to long (EX: 1000s of veichles)
   if (veichle.cord.x != -1 && veichle.cord.y != -1) {
      allVeichles[veichle.id] = veichle;
   }
}

// PARAMS: JSON Object
// EFFECT: Updates this veichle with new JSON Data
// Updates veichle data and draws it
function updateVeichle(json) {
   this.cord = toPixelCord(json.attributes.latitude, json.attributes.longitude);
   // If out of found, discard veichle (Stop Updating)
   if (this.cord.x != -1 && this.cord.y != -1) {
      this.cords.unshift(this.cord);
   }
   this.bearing = json.attributes.bearing;
   this.draw();
}

// PARAMS: None
// EFFECT: Drawas a veichle route if num of traveled cord is greater than 2
function drawVeichle() {
   if (this.cord.x != -1 && this.cord.y != -1) {
      var cords = this.cords;
      if (cords.length >= 2) {
         animate(cords[1], cords[0], 0, this.color);
      }
      // Draw static point
      // drawPoint(this.cord, this.color);
   }
}

// PARAMS: NONE
// EFFECT: Draws all the veichles in allVeichles object array
function drawAllVeichles() {
   for (var key in allVeichles) {
      allVeichles[key].draw();
   }
}