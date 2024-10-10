// Create a map
const map = L.map('map').setView([37.8, -96], 4);

// Define base layers
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

const grayscale = L.tileLayer('https://{s}.tiles.wmflabs.org/basemap/gray/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

// Add default base layer (satellite)
satellite.addTo(map);

// Fetch earthquake data
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquakeDataUrl).then(data => {
    const earthquakes = data.features;

    function getMarkerSize(magnitude) {
        return magnitude * 5;
    }

    function getColor(depth) {
        return depth > 90 ? '#FF0000' :
               depth > 70 ? '#FF7F00' :
               depth > 50 ? '#FFFF00' :
               depth > 30 ? '#7FFF00' :
               depth > 10 ? '#00FF00' :
                             '#00FFFF';
    }

    earthquakes.forEach(eq => {
        const coords = eq.geometry.coordinates;
        const magnitude = eq.properties.mag;
        const depth = coords[2];
        const color = getColor(depth);

        const marker = L.circleMarker([coords[1], coords[0]], {
            radius: getMarkerSize(magnitude),
            fillColor: color,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`<h3>${eq.properties.title}</h3><p>Magnitude: ${magnitude}<br>Depth: ${depth} km</p>`);
    });

    // Create a legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<strong>Depth (km)</strong><br>';
        div.innerHTML += '<i style="background: #FF0000"></i> > 90<br>';
        div.innerHTML += '<i style="background: #FF7F00"></i> 70-90<br>';
        div.innerHTML += '<i style="background: #FFFF00"></i> 50-70<br>';
        div.innerHTML += '<i style="background: #7FFF00"></i> 30-50<br>';
        div.innerHTML += '<i style="background: #00FF00"></i> 10-30<br>';
        div.innerHTML += '<i style="background: #00FFFF"></i> < 10<br>';
        return div;
    };
    legend.addTo(map);
});

// Fetch tectonic plates data
const platesDataUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

d3.json(platesDataUrl).then(plateData => {
    const plates = L.geoJson(plateData, {
        style: { color: '#ff7800', weight: 2 }
    }).addTo(map);

    // Add layer control
    const overlayMaps = {
        "Earthquakes": L.layerGroup(),
        "Tectonic Plates": plates
    };

    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
});
