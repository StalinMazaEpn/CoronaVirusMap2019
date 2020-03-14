// import mapStyle from './mapStyle.js'
var darkMode = false;
let urlLayer;
let darkLayer = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
let lightLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
let darkIcon = '🌛';
let lightIcon = '☀️';
let btnIcon = lightIcon;
let leafletAtribution = '&copy; <a href="https://www.openstreetmap.org/copyright">Gracias a OpenStreetMap</a>';
let markersGroupLayer =  L.layerGroup();

let darkLayerTile = L.tileLayer(darkLayer, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    updateWhenIdle: true,
    reuseTiles: true,
    edgeBufferTiles: 2,
    tileSize: 512, zoomOffset: -1
});
let lightLayerTile = L.tileLayer(lightLayer, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    updateWhenIdle: true,
    reuseTiles: true,
    edgeBufferTiles: 2,
    tileSize: 512, zoomOffset: -1
});

let baseLayers = {
    "Oscuro": darkLayerTile,
    "Claro": lightLayerTile,
};

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // dark mode
    urlLayer = darkLayer;
    darkMode = true;
} else {
    urlLayer = lightLayer;
}


// const $map = document.querySelector('#map');
var map = L.map('map', {
    zoomAnimation: false,
    markerZoomAnimation: false,
    zoomControl: true,
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: 'topleft'
    },
    layers: [lightLayerTile]
}).setView([0, 0], 3);
L.tileLayer(urlLayer, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    updateWhenIdle: true,
    reuseTiles: true
}).addTo(map);



// map.addControl(new L.Control.Fullscreen());
//Añadir Boton Modo 
// let btnThemeControl = L.control();
// btnThemeControl.onAdd = function (map) {
//     let container = L.DomUtil.create('input');
//     container.type = "button";
//     container.value = btnIcon;
//     container.title = "No cat";
//     container.onclick = function (event) {
//         // alert('btn click')
//         console.log('event.targe', event.target)
//         if(darkMode){
//             event.target.value = lightIcon;
//             event.target.classList.remove('dark');
//             urlLayer = lightLayer;
//         }else{
//             event.target.value = darkIcon;
//             event.target.classList.add('dark');
//             urlLayer = darkLayer;
//         }
//         darkMode = !darkMode;
//     }
//     container.classList.add('btnThemeControl')
//     return container;
// };
// btnThemeControl.addTo(map);

async function getData() {
    const response = await fetch('https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest')
    const data = await response.json()
    return data
}
function renderExtraData({ confirmed, deaths, recovered, provincestate, countryregion }) {
    return (`
        <div>
          <p> <strong>${provincestate} - ${countryregion}</strong> </p>
          <p> Confirmados: ${confirmed} </p>
          <p> Muertes: ${deaths} </p>
          <p> Recuperados: ${recovered} </p>
        </div>
      `)
}
//Añador Titulo
var info = L.control({position:'bottomcenter'});
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Mapa Coronavirus</h4>' + '<span>Numero de Casos Confirmados</span>';
};

info.addTo(map);
//Añadir Marcadores
const iconUrl = './icon.png';
const shadowIcon = './marker-shadow.png';
const icon = new L.Icon({
    iconUrl: iconUrl,
    shadowUrl: shadowIcon,
    shadowSize: [40, 40],
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
// const popup = new window.google.maps.InfoWindow()
async function renderData() {
    const data = await getData();
    let markersGroup = [];
    data.forEach((item, index) => {
        const marker = L.marker([item.location.lat, item.location.lng], { icon: icon })
        // .addTo(map)
        .bindPopup(renderExtraData(item))
        .addTo(markersGroupLayer);
        //     marker.openPopup();
        // }
        // markersGroup.push(marker);
    });
    // markersGroupLayer =  L.layerGroup(markersGroup);
    map.addLayer(markersGroupLayer);
    const overlayMarkers = {
        "Personas": markersGroupLayer
    };
    L.control.layers(baseLayers, overlayMarkers, {
        collapsed: false
    }).addTo(map);
}

renderData()