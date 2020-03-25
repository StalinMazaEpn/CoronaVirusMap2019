let lightLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
let darkIcon = '🌛';
let lightIcon = '☀️';
let filterDark = ['invert:100%'];
let filterLight = [];
let currentFilter = [];
let btnIcon = lightIcon;
let leafletAtribution = '&copy; <a href="https://www.openstreetmap.org/copyright">Gracias a OpenStreetMap</a>';

//Funciones Manejar Temas
const getThemeMode = () =>{
    const mode = localStorage.getItem('sm-mode-theme');
    console.log('get theme mode value', mode)
    if(!mode){
        return 'light'
    }else{
        return mode;
    }
}
const setThemeMode = (mode) => {
    localStorage.setItem('sm-mode-theme', mode);
}

const toggleThemeMode = () => {
    const mode = getThemeMode();
    if(mode == 'light'){
        setThemeMode('dark');
    }else{
        setThemeMode('light');
    }
}


//Verificar Modo
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matchess) {
    localStorage.setItem('sm-mode-theme', 'dark');
}

if(localStorage.getItem("sm-mode-theme") == null){
    localStorage.setItem('sm-mode-theme', 'light');
}


currentFilter = (getThemeMode() == 'light') ? filterLight: filterDark;



//Crear Mapa
var map = L.map('map', {
    zoomAnimation: false,
    markerZoomAnimation: false,
    zoomControl: true,
}).setView([0, 0], 3);
//Añadirle una capa
let mapTileLayer = L.tileLayer.colorFilter(lightLayer, {
    attribution: leafletAtribution,
    updateWhenIdle: true,
    reuseTiles: true,
    filter: currentFilter,
}).addTo(map);


// Añadir boton FullScreen
var fsControl = L.control.fullscreen();
map.addControl(fsControl);
// Manejar Eventos al Salir y entrar del modo pantalla completa
// map.on('enterFullscreen', function(){
//     if(window.console) window.console.log('enterFullscreen');
// });
// map.on('exitFullscreen', function(){
//     if(window.console) window.console.log('exitFullscreen');
// });

//Añadir Boton Modo Tema
let btnThemeControl = L.control();
btnThemeControl.onAdd = function (map) {
    let container = L.DomUtil.create('input');
    container.type = "button";
    container.value = btnIcon;
    container.title = "Modo Vista";
    //Funcion cuando hagan click en el boton de toggle Mode
    container.onclick = function (event) {
        toggleThemeMode();
        //Cambiar Boton, Clase y Filtro de Mapa
        if(getThemeMode() == 'light'){
            event.target.value = lightIcon;
            event.target.classList.remove('dark');
            mapTileLayer.updateFilter(filterLight);
        }else{
            event.target.value = darkIcon;
            mapTileLayer.updateFilter(filterDark);
            event.target.classList.add('dark');
        }
    }
    container.classList.add('btnThemeControl')
    return container;
};
btnThemeControl.addTo(map);
//Funcion para traer los datos de un API
async function getData() {
    //const response = await fetch('https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest')
    const response = await fetch('https://covid19.mathdro.id/api/confirmed')
    const data = await response.json()
    return data
}
//Función renderizar datos
function renderExtraData({ confirmed, deaths, recovered, provinceState, countryRegion }) {
    return (`
        <div>
          <p> <strong>${provincestate} - ${countryregion}</strong> </p>
          <p> Confirmados: ${confirmed} </p>
          <p> Muertes: ${deaths} </p>
          <p> Recuperados: ${recovered} </p>
        </div>
      `)
}
//Añador Titulo Información
var info = L.control({position:'bottomcenter'});
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = '<h4>Mapa Coronavirus</h4>' + '<span>Numero de Casos</span>';
};
info.addTo(map);

//Crear Icono
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
//Añadir Marcadores
async function renderData() {
    const data = await getData();
    // let markersGroup = [];
    data.forEach((item, index) => {
        //const marker = L.marker([item.location.lat, item.location.lng], { icon: icon })
        const marker = L.marker([item.lat, item.long], { icon: icon })
        // .addTo(map)
        .bindPopup(renderExtraData(item))
        .addTo(map);
    });
}

//Ejecutar la función Inicial
renderData()
