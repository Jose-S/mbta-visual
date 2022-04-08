// Object Array used for faster access (performance)
var allRoutes = {};

// ROUTE INFO
// TYPES:
// 0 -> Light Rail	
// 1 -> Heavy Rail 
// 2 -> Commuter Rail
// 3 -> Bus
// 4 -> Ferry

// PARAMS: String Route ID, Type, description, name, and color
// EFFECT: Draws the given point on the canvas
// Example: Greedn Line, Orange Line, Bus 77
function Route(id, type, description, name, color) {
   this.id = id;
   this.type = type;
   this.description = description;
   this.name = name;
   this.polyline = "";
   this.color = color;
   this.draw = drawRoute;
   this.updatePoly = updatePoly;
}

// PARAMS: JSON Object
// EFFECT: Converts JSON Object to a Route
// Creates a route object and adds it to the allRoutes object array
function jsonToRoute(json) {
   // TODO: Dont add commuter and ferry types
   var route = new Route(
      json.id,
      json.attributes.type,
      json.attributes.description,
      json.attributes.long_name,
      json.attributes.color);
      
   allRoutes[route.id] = route;
}

// PARAMS: NONE
// EFFECT: Draws this Route's Polyline
function drawRoute() {
   drawPoly(this.polyline, this.color);
}

// PARAMS: NONE
// EFFECT: Update this route's polyline
function updatePoly(newPoly) {
   this.polyline = newPoly;
}

// PARAMS: NONE
// EFFECT: Draws all the routes in allRoutes object array
function drawAllRoutes() {
   for (var key in allRoutes) {
      allRoutes[key].draw();
   }
}