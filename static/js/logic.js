const API_KEY = process.env.API_KEY
// collect the data and use the functions to create the map
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(url, function(earthquakeData){
    d3.json(url2,function(boundariesData){
        createFeatures(earthquakeData.features,boundariesData.features)
    }); 
}); 

//function create the circles and the popups per feature
function getColor(magnitude) {
    return  magnitude >= 6  ? "#e1881b" :
            magnitude >= 5  ? "#eb961e" :
            magnitude >= 4  ? "#f9af3a" :
            magnitude >= 3  ? "#f9c54e" :
            magnitude >= 2  ? "#c8ba4a":
            magnitude >= 1  ? "#a0b657" :
                             "#a9bd66";
};
function createFeatures(earthquakeData,boundariesData) {
    function onEachFeature(feature, layer) {
      var date = new Date(feature.properties.time);
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + date.toUTCString() + "</p>"+
        "<p> Magnitude:" + feature.properties.mag + "</p>");
    };
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        var geojsonMarkerOptions = {
            radius: feature.properties.mag*2,
            fillColor: getColor(feature.properties.mag),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        };
        return L.circleMarker(latlng, geojsonMarkerOptions)
    },
      onEachFeature: onEachFeature
    });

    var boundaries = L.geoJSON(boundariesData,{
        style: {color: "#BC544B",weight:2,fillOpacity:0}
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes,boundaries);
};
// creates the map function
function createMap(earthquakes,boundaries) {
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 12,
        id: "satellite-v9",
        accessToken: API_KEY
    });
    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 12,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 12,
        id: "dark-v10",
        accessToken: API_KEY
    });
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": lightmap,
        "Dark Map": darkmap
    };
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Fault Lines": boundaries
      };
    var myMap = L.map("map", {
    center:[0, 0],
    zoom: 2.47,
    layers: [darkmap,boundaries]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
    //add a legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [0,1,2,3,4,5,6];
        var legendInfo = "<div><h2>Magnitudes</h2>";

        div.innerHTML = legendInfo;
        
        for (var i = 0; i <limits.length; i++) {
            div.innerHTML += "<ul>" +
                '<li style="background:' + getColor(limits[i]) + '"></li> ' +
            "<span class=\"limit\">" + limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+')
            +"</span>"+"</ul>";
        }
        return div;
    };
    legend.addTo(myMap);
};



    
