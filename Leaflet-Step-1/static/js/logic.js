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
    return "#d9ff66"
  }
  else if (coordinates > 30 && coordinates <= 50 ) {
    return "#ffd24d"
  }
  else if (coordinates > 50 && coordinates <= 70 ) {
    return "#ff9933"
  }
  else if (coordinates > 70 && coordinates <= 90 ) {
    return "#ff6633"
  }
  else if (coordinates > 90) {
    return "#ff3333"
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
        color: markerColor(feature.geometry.coordinates[2]),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        radius: markerSize(feature.properties.mag),
        fillOpacity: 1, 
        // border for circles
        stroke: true, 
        color: "gray"
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
    zoom: 4,
    layers: [streetmap, mags]
  });
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div","legend");
    div.innerHTML += "<h4>Legend</h4>"
    div.innerHTML += '<i style="background: #99ff33"></i><span><=10</span><br>';
    div.innerHTML += '<i style="background: #d9ff66"></i><span>11-30</span><br>';
    div.innerHTML += '<i style="background: #ffd24d"></i><span>31-50</span><br>';
    div.innerHTML += '<i style="background: #ff9933"></i><span>51-70</span><br>';
    div.innerHTML += '<i style="background: #ff6633"></i><span>71-90</span><br>';
    div.innerHTML += '<i style="background: #ff3333"></i><span>90+</span><br>';
    return div;
  }
legend.addTo(myMap)
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
