// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Function to determine marker size based on magnitude
// could not use Math.sqrt kept getting NaN values
function markerSize(mag) {
  return mag * 50000;
  }

function markerColor(coordinates) {
  if (coordinates <=10) {
    return "#99ff33"
  }
  else if (coordinates > 10 && coordinates <= 30 ) {
    return "#ccff99"
  }
  else if (coordinates > 30 && coordinates <= 50 ) {
    return "#ffc34d"
  }
  else if (coordinates > 50 && coordinates <= 70 ) {
    return "#ffc34d"
  }
};
  

// Perform a GET request to the query URL, creating the promise
d3.json(queryUrl).then(data => {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function, this will hold all the info
  createFeatures(data.features);
});

// this function handles the data which has other functions inside it
function createFeatures(earthquakeData) {

  var mags = L.geoJSON(earthquakeData, {
    // use onEachFeature to bind popup values for each data point
    onEachFeature: (feature, layer) => {
      layer.bindPopup("Magnitude:" + feature.properties.mag + "<br>"+ "Depth:" + feature.geometry.coordinates[2]+
      "</h3><br>" + "Location:" + feature.properties.place);
    },
    // use pointToLayer to pass a circle marker thus replacing original marker
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        stroke: false,
        fillOpacity: 1,
        color: markerColor(feature.geometry.coordinates[2]),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        radius: markerSize(feature.properties.mag)
      });
    }
  });

  // Sending our mags layer to the createMap function
  createMap(mags);
}

// this function will do all the work to create the maps...
function createMap(mags) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Magnitudes: mags
  };

  // Create our map, giving it the streetmap and magnitude layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, mags]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
