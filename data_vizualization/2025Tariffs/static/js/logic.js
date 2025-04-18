// Base tile layers
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
});

let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
});

let grayscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: "&copy; OpenStreetMap contributors & CartoDB"
});

let darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: "&copy; OpenStreetMap contributors & CartoDB"
});

// Initialize the map
let map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [basemap] // default layer
});

// Create layer for tariff % labels
let tariffLabelLayer = L.layerGroup(); // Don't add to map yet unless you want it visible by default

// Base map options
let baseMaps = {
  "Default": basemap,
  "Street": street,
  "Grayscale": grayscale,
  "Dark Mode": darkMode
};

// Overlay map options
let overlayMaps = {
  "Tariff % Labels": tariffLabelLayer
};

// Add layer control to map
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Tariff color scale
function getTariffColor(tariff) {
  return tariff > 70 ? "#800026" :
         tariff > 60 ? "#BD0026" :
         tariff > 50 ? "#E31A1C" :
         tariff > 40 ? "#FC4E2A" :
         tariff > 30 ? "#FD8D3C" :
         tariff > 20 ? "#FEB24C" :
                       "#ADFF2F";
}

// Load and plot data
d3.json("data.json").then(data => {
  data.forEach(entry => {
    const lat = parseFloat(entry.Latitude) - 1;  // Offset marker slightly for clarity
    const lon = parseFloat(entry.Longitude);
    const tariff = parseFloat(entry["Tariff Percentage"]);

    if (!isNaN(lat) && !isNaN(lon)) {
      // Circle marker for country
      L.circleMarker([lat, lon], {
        radius: 8,
        fillColor: getTariffColor(tariff),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
      .bindPopup(`<strong>${entry.Country}</strong><br>Tariff: ${tariff}%`)
      .addTo(map);

      // Tariff % label
      const label = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'tariff-label',
          html: `<strong>${tariff}%</strong>`,
          iconSize: [30, 12],
          iconAnchor: [15, -12]
        })
      });

      label.addTo(tariffLabelLayer); // Add to the toggleable overlay group
    }
  });
}).catch(error => {
  console.error("Error loading data.json:", error);
});

// Legend
let legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  let div = L.DomUtil.create("div", "info legend");
  let grades = [0, 20, 30, 40, 50, 60, 70];
  let labels = [];

  for (let i = 0; i < grades.length; i++) {
    let from = grades[i];
    let to = grades[i + 1];

    labels.push(
      `<i style="background:${getTariffColor(from + 1)}"></i> ${from}${to ? '&ndash;' + to : '+'}`
    );
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
