// Store the API endpoint as queryUrl.
const QUERYURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
const COLOR_COLORS = ["#2A7690", "#239090", "#1CAB90", "#15C591", "#0EE091", "#07FA91"];
const COLOR_DEPTHS = [90, 70, 50, 30, 10, -10];

// Perform a GET request to the query URL/
d3.json(QUERYURL).then(function (data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    function circleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 4,
            fillColor: colorChoice(feature.geometry.coordinates[2]),
            color: colorChoice(feature.geometry.coordinates[2]),
            stroke: true,
            weight: 1.5,
            opacity: 5,
            fillOpacity: .8
        }
        return L.circleMarker(latlng, options);
    }

    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: circleMarker
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
};

// function to create different colors for markers based on the depth of the earthquake
function colorChoice(depth) {
    switch (true) {
        case depth > COLOR_DEPTHS[0]:
            return COLOR_COLORS[0];
        case depth > COLOR_DEPTHS[1]:
            return COLOR_COLORS[1];
        case depth > COLOR_DEPTHS[2]:
            return COLOR_COLORS[2];
        case depth > COLOR_DEPTHS[3]:
            return COLOR_COLORS[3];
        case depth > COLOR_DEPTHS[4]:
            return COLOR_COLORS[4];
        default:
            return COLOR_COLORS[5];
    };
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold the overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 4,
        layers: [topo, earthquakes]
    });

    // Create a layer control.
    // Pass it the baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // function to make legend and add to map
    function makeLegend() {
        let div = L.DomUtil.create("div", "info legend");
        const COLORS = COLOR_COLORS.reverse();
        const DEPTHS = COLOR_DEPTHS.reverse();
        var end;
        for (let i = 0; i < COLORS.length; i++) {
            if (i == COLORS.length - 1) {
                end = "+";
            } else {
                end = " - " + COLOR_DEPTHS[i + 1];
            }
            let html_row = (
                "<i style='background:" + COLORS[i] + "'>" + "&emsp;&nbsp;&emsp;" + "</i> "
                + COLOR_DEPTHS[i]
                + end
                + "<br>"
            );
            div.innerHTML += html_row;
        }
        console.log(div)
        return div
    }
    let legend = L.control({ position: "bottomleft" });
    legend.onAdd = makeLegend;
    legend.addTo(myMap);

};
