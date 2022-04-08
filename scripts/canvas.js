console.log("Connected!");

var STROKE_WIDTH = 3;
var background; // Image
var c; // Canvas
var ctx; // Canvas Context

// INIT ARTWORK
function init() {
    // GLOBLA VARIABLE SETUP
    background = document.getElementById("map");
    background.src = this.getBostonMap();

    c = document.getElementById("layer2");
    ctx = c.getContext("2d");
}

// PARAMS: (X, Y) Point Cord object and a color string
// EFFECT: Draws the given point on the canvas
function drawPoint(point, color = "white") {
    console.log("DRAWING", color);
    ctx.fillStyle = "#" + color;
    ctx.fillRect(point.x, point.y, 5, 5);
}


// PARAMS: (X, Y) Point Cord object and a color string
// EFFECT: Draws the given point on the canvas
function drawLine(x1, y1, x2, y2, ratio, color) {
    // Setup Stroke
    ctx.strokeStyle = "#" + color;
    ctx.lineCap = "round";
    c.lineJoin = "round";
    ctx.lineWidth = STROKE_WIDTH;
    // Draw Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    x2 = x1 + ratio * (x2 - x1);
    y2 = y1 + ratio * (y2 - y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// PARAMS: (X, Y) Point Cord object and a color string
// EFFECT: Draws the given point on the canvas
function animate(cord1, cord2, ratio, color) {
    // Draw over the whole canvas to create the trail effect
    ratio = ratio || 0;
    drawLine(cord1.x, cord1.y, cord2.x, cord2.y, ratio, color);
    if (ratio < 1) {
        requestAnimationFrame(function() {
            // Draw next line section
            animate(cord1, cord2, ratio + 0.005, color);
        });
    }
}



// PARAMS: NONE
// EFFECT: Returns an image url of a dark tone Downtown Boston Map
// Uses Google Map API to create a dark tone map
// FUTURE NOTE: Map created dynamically to allow location to be changed 
function getBostonMap() {

    var latlon = CENTER_CORD.lat + "," + CENTER_CORD.long;

    try {
        var img_url = "https://maps.googleapis.com/maps/api/" +
            // Center Point
            "staticmap?center=" + latlon +
            // Zoom and Size
            "&zoom=14&size=600x600&sensor=false" +
            // Basic Features 
            "&style=feature:water|color:0x303030" +
            "&style=feature:landscape|color:0x000000" +
            "&style=feature:road|visibility:simplified" +
            "&style=feature:all|element:labels|visibility:off" +
            // Raod and Transit Network
            "&style=feature:road.local|color:0x3A3A3A|weight:1" +
            "&style=feature:road.arterial|color:0x4E4E4E|weight:2" +
            "&style=feature:road.highway|visibility:off" +
            "&style=feature:transit|visibility:off" +
            // Remove Points of Interest
            "&style=feature:poi|visibility:off" +
            "&key=" + process.env.GOOGLE_MAPS_API_KEY;
    } catch (error) {
        console.log("Asset is being used")
        var img_url = "assets/bostonMap.png";
    }

    return img_url;
}


// PARAMS: A PolyLine (String) and Color (String) value 
// EFFECT: Draws the given polyline on the canvas
function drawPoly(poly, color) {
    var d = polyline.decode(poly);
    d.forEach(cord => {
        drawPoint(toPixelCord(cord[0], cord[1]), color);
    })
}

init()