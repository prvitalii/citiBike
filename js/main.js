$(document).ready(function(){
    console.log("Let's go for a ride!")
});

var latCenter = 40.728362;
var lngCenter = -74.002764;
var myFeauture = [];

// Create data feaututres
var createFeatures = function(data){
    myFeauture.push(data);
    return myFeauture;
};

// Update information every 1 second
setTimeout( function() {
    getData("param")
}, 1000);

// Fixing coordinates latitude and longitude
// according ISO 6709
function fixeCoordinates(number){
    return number/1000000;
};

mapboxgl.accessToken = 'pk.eyJ1IjoicHJ2aXRhbGlpIiwiYSI6ImNpb3dhbWt5dzAxZXd1ZW01bmJjajFvY2oifQ.6YXuHCBAfcX69VZGQo1qUA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [lngCenter, latCenter],
    zoom: 12
});


    
function getData() {
    $.getJSON("http://api.citybik.es/citi-bike-nyc.json", 

    function(data) {
    // Create a source for GeoJSON features 
    //usin citi-bike's dynamic api
    var numBikes=0, numSpots=0;
        for (i=0; i<data.length; i++){

            var lng = fixeCoordinates(data[i].lng); 
            var lat = fixeCoordinates(data[i].lat); 
            var bikes = data[i].bikes;
            numBikes += bikes;
            var freeSpots = data[i].free;
            numSpots += freeSpots;
            var name =  data[i].name;
            var lastUpdate = data[i].timestamp;
            var stationId = data[i].number;
            var stationData = {};

            stationData[i] = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "properties": {
                    "title": "bikes",
                    "marker-symbol": "circle",
                    "numOfBikes": bikes,
                    "description": "<div id=popup><div id=popup-title>" + name + "<hr></div><img class=popup-img src=img/bicycle_popup.png><p>Bikes avaliable: " + bikes +"</p><img class=popup-img src=img/station_popup.png><p>Empty stations: " + freeSpots + "</p></div>"
                }
            };  
            createFeatures(stationData[i]);
        };
        setTimeout('getData()', 1000);  
        $("#info").html("<p>Bikes avaliable:<b> " + numBikes + 
        "</b></p><p>Free docs:<b> " + numSpots + "</b></p>");
    });
}

map.on('load', function(){
    // Add a new addSourcerce from our getJSON data
    // using inline GeoJSON
    map.addSource("bikes", {
        "type": "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ bikes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        "data": {
            "type": "FeatureCollection",
            "features": myFeauture,
        },
    });

    // Use the bikes source to create a layer.
    map.addLayer({
        "id": "bikes",
        "type": "circle",
        "source": "bikes",
        "paint": {
                "circle-color": {
                    "property": "numOfBikes",
                    "stops": [
                        [5, "red"],
                        [10, "green"]
                    ]
                },
                "circle-radius": {
                    "stops": [
                        [10, 3],
                        [20, 20]
                    ]
                }
        }
    });
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ********************** PopUp on hover mouse **********************
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Use the same approach as above to indicate that the symbols are clickable
    // by changing the cursor style to 'pointer'.
    map.on('mousemove', function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['bikes'] });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (!features.length) {
            popup.remove();
            return;
        }

        var feature = features[0];

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(feature.geometry.coordinates)
            .setHTML(feature.properties.description)
            .addTo(map);
    });

    // ==================================================================    

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ************ Center the map by clicking on a station *************
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    map.on('click', function (e) {
        // Use queryRenderedFeatures to get features at a click event's point
        // Use layer option to avoid getting results from other layers
        var features = map.queryRenderedFeatures(e.point, { layers: ['bikes'] });
        // if there are features within the given radius of the click event,
        // fly to the location of the click event
        if (features.length) {
            // Get coordinates from the symbol and center the map on those coordinates
            map.flyTo({center: features[0].geometry.coordinates});
        }
    });

    // ==================================================================

});