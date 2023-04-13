let earthquakeLayer = new L.layerGroup();

let overlays = {
    Earthquakes: earthquakeLayer
}

// Adding the tile layers
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
});


// base layers
let baseLayers = {
    "Street Map": streetmap
};

// Creating the map object
let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 5, 
    // Display on load
    layers: [streetmap]
});

// Layer control
L.control.layers(baseLayers, overlays, {
    collapsed: false
  }).addTo(map);

// Getting the colors for the circles and legend based on depth
function color(depth) {
    return depth >= 90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
        depth < 70 && depth >= 50 ? "#FF8E15" :
        depth < 50 && depth >= 30 ? "#FFB92E" :
        depth < 30 && depth >= 10 ? "#ACB334" :
                                    "#69B34C";
}

// Drawing the circles
function drawCircle(point, location) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(location, {
            fillOpacity: 0.75,
            color: color(depth),
            fillColor: color(depth),
            radius: mag * 20000
    })
}

// Displaying info when the feature is clicked
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// The link to get the Earthquak GeoJSON data
let url = " https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Getting the GeoJSON data
d3.json(url).then((data) => {
    let features = data.features;

    // Creating a GeoJSON layer with the retrieved data
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // Setting up the legend
    let info = L.control({
        position: "bottomright"
    });

    info.onAdd = () => {
        let div = L.DomUtil.create('div', 'legend');
        severity = [-10, 10, 30, 50, 70, 90];

        // Looping through our intervals and generating a label with a colored square for each interval
        for (let i = 0; i < severity.length; i++) {
            div.innerHTML +=
                '<i style="background:' + color(severity[i]+1) + '"></i> ' +
                severity[i] + (severity[i + 1] ? '&ndash;' + severity[i + 1] + '<br>' : '+');
        }
        return div;
    };
    info.addTo(map);
})