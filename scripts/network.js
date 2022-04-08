const APIKEY = process.env.MBTA_API_KEY;
const KEY_ATTRIBUTE = "&api_key=" + APIKEY;
var AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

// END POINTS
//Endpoint to retrieve Route Information
var routeEnpoint = "https://api-v3.mbta.com/routes?sort=type";
var shapeEnpoint = "https://api-v3.mbta.com/shapes?filter%5Broute%5D="; // Need to add route ID
var veichleEnpoint = "https://api-v3.mbta.com/vehicles?sort=updated_at";
var liveVehiclesEnpoint = "https://api-v3.mbta.com/vehicles/?api_key=" + APIKEY;


// PARAMS: URL ednpoint and callback function
// EFFECT: Fetches endpoint data and runs callback afer fetch is complete
function fetchMbtaData(endpoint, fetchComplete) {
    var request = new XMLHttpRequest();
    request.addEventListener("progress", updateLoadBar);
    request.addEventListener("load", fetchComplete);
    request.addEventListener("error", fetchFailed);
    request.addEventListener("abort", fetchCanceled);
    request.open('GET', endpoint + KEY_ATTRIBUTE, true);
    request.send();
}

// PARAMS: RequestEvent
// EFFECT: Logs percent of data fetched
// NOTE: Can be used to show load bar
function updateLoadBar(event) {
    if (event.lengthComputable) {
        var percentComplete = event.loaded / event.total * 100;
        console.log("FETCHING" + percentComplete + "%");
    } else {
        console.log("FETCHING");
    }
}

// PARAMS: RequestEvent
// EFFECT: Logs data fetch error
// TODO: Alert Viewer
function fetchFailed(event) {
    console.log("FAIL: " + event);
}

// PARAMS: RequestEvent
// EFFECT: Logs data fetch canceled
// TODO: Alert Viewer
function fetchCanceled(event) {
    console.log("CANCELED: " + event);
}

// PARAMS: RequestEvent
// EFFECT: Collects route data json and creates route objects
// Creates route objects from event data and fetches route polylines (shapes)
function fetchRoutes(event) {
    var status = event.currentTarget.status;
    var data = JSON.parse(this.response);
    if (status >= 200 && status < 400) {

        // Array of Routes
        var routes = data.data;
        console.log("ROUTES: " + routes);
        var routesProcessed = 0;
        routes.forEach(route => {
            // console.log(route.id);
            jsonToRoute(route);
        })
        console.log('ROUTES PROCESSESED');
        addRoutePolys();
    } else {
        console.log("ERROR NO ROUTE DATA FOUND");
    }
}

// PARAMS: RequestEvent
// EFFECT: Collects vecihle data json and creates veichle objects
// Creates Veichle objects from event data
function fetchVeichles(event) {
    var status = event.currentTarget.status;
    var data = JSON.parse(this.response);
    if (status >= 200 && status < 400) {
        // Array of Routes
        var veichles = data.data;
        // console.log("ROUTES: " + veichles);
        veichles.forEach(veichle => {
            // console.log(veichle.id);
            jsonToVeichle(veichle);
        })
        console.log('VEICHLES PROCESSESED');
        // drawAllVeichles();
    } else {
        console.log("ERROR NO VEICHLE DATA FOUND");
    }
}

// PARAMS: RequestEvent
// EFFECT: Collects veichle data json and creates veichle objects
// Creates Veichle objects from live event data
function processLiveVeichles(event) {
    var veichles = JSON.parse(event.data);
    // var veichles = data.data;
    // console.log(veichles);
    if (veichles.length === 0) {
        console.log("ERROR NO VEICHLE DATA FOUND");
    }
    veichles.forEach(veichle => {
        jsonToVeichle(veichle);
    })
    console.log('VEICHLES PROCESSESED');
    drawAllVeichles();

}

// PARAMS: RequestEvent
// EFFECT: Collects shape data json and cadds polyline to route
// Initiates live veichle fetch
// NOTE: Polyline could be used to improve the route of updated veichles 
function fetchShape(event) {
    var status = event.currentTarget.status;
    var data = JSON.parse(this.response);
    if (status >= 200 && status < 400) {

        // Array of Routes
        var shapes = data.data;
        shapes.forEach(shape => {
            let routeId = shape.relationships.route.data.id;
            let poly = shape.attributes.polyline;

            if (allRoutes[routeId]) {
                allRoutes[routeId].updatePoly(poly);
            }

        })
        console.log('POLYS PROCESSESED');
        // Start fetching veichle data
        fetchLiveVeichles.startEvent();
        // fetchMbtaData(veichleEnpoint, fetchVeichles);
        // drawAllRoutes();
    } else {
        console.log("ERROR NO POLYLINE SHAPE DATA FOUND");
    }
}

// PARAMS: None
// EFFECT: Creates shapae fetch URL and fetches shape data
function addRoutePolys() {
    for (var id in allRoutes) {
        shapeEnpoint += id + ",";
    };
    fetchMbtaData(shapeEnpoint, fetchShape);
}

// Varaible holsd code for fetching live veichle data using an
// event stream.
const fetchLiveVeichles = {

    startEvent: () => {
        this.eventSource = new EventSource(liveVehiclesEnpoint);

        this.eventSource.addEventListener("reset", e => {
            processLiveVeichles(e);
        });

        this.eventSource.addEventListener("add", e => {
            var data = JSON.parse(e.data);
            console.log("ADDING: " + data.id);
            var veichle = allVeichles[data.id];
            veichle != undefined ?
                veichle.update(data) :
                jsonToVeichle(data);
        });

        this.eventSource.addEventListener("update", e => {
            var data = JSON.parse(e.data);
            console.log("UPDATING: " + data.id);
            var veichle = allVeichles[data.id];
            veichle != undefined ?
                veichle.update(data) :
                jsonToVeichle(data);
        });

        this.eventSource.addEventListener("remove", e => {
            var data = JSON.parse(e.data);
            console.log("REMOVING: " + data.id);
            var veichle = allVeichles[data.id];
            veichle != undefined ?
                delete veichle :
                console.log("NOTHING TO REMOVE");
        });

        this.eventSource.addEventListener('open', (e) => {
            console.log('OPEN');
            console.log(e);
        });

        this.eventSource.addEventListener('error', (e) => {
            console.log('got an error');
            console.log(e);
        });
    }
}

// FOR TESTING
// app.startEvent();

// Begin Fetching Data
fetchMbtaData(routeEnpoint, fetchRoutes);