d3.csv("cmip6_fco2antt.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year;
        d.lat = +d.lat;
        d.lon = +d.lon;
        d.co2 = +d.fco2antt;
    });

    startVisualization(data);
});

function startVisualization(data) {
    mapboxgl.accessToken = "pk.eyJ1IjoiZXJ0b25nMjEiLCJhIjoiY21ocXJkeTFkMTFlczJsb2hmczMwZHZlZiJ9.qwOHyZ8MSG4kaN68ifsoaw";

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [0, 0],
        zoom: 1.4,
        pitch: 60,
        antialias: true
    });

    map.on("load", () => {
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
        map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
        });

        // Draw first year
        updateYear(map, data, 1850);  
    });
}

function updateYear(map, data, year) {
    const yearData = data.filter(d => d.year === year);

    const geojson = {
        type: "FeatureCollection",
        features: yearData.map(d => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [d.lon, d.lat]
            },
            properties: {
                co2: d.co2
            }
        }))
    };

    if (map.getSource("co2")) {
        map.getSource("co2").setData(geojson);
    } else {
        map.addSource("co2", { type: "geojson", data: geojson });

        map.addLayer({
            id: "co2-circles",
            type: "circle",
            source: "co2",
            paint: {
                "circle-radius": 3,
                "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "co2"],
                    300, "green",
                    420, "yellow",
                    500, "red"
                ],
                "circle-opacity": 0.6
            }
        });
    }
}

const steps = document.querySelectorAll(".step");

scrollama()
  .setup({ step: ".step" })
  .onStepEnter(response => {
      const year = +response.element.dataset.year;
      updateYear(map, data, year);
      rotateMap(map, year);
  });
