// let lightLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
let icons = {
    users: 'fa fa-users',
    user: 'fa fa-user',
    frown: 'fa fa-frown-o',
    heartbeat: 'fa fa-heartbeat',
    medkit: 'fa fa-medkit',
    ambulance: 'fa fa-ambulance',
    check: 'fa fa-check-square',
    exclamation: 'fa fa-exclamation-triangle',
    question: 'fa fa-question-circle',
    termometer: 'fa fa-thermometer-full',
    times: 'fa fa-times',
    default: ''
};
function getEstadisticasIcon(property){
    let icon;
    switch(property){
        case 'estables_aislamiento_domiciliario':
            icon = icons.users;
            break;
        case 'hospitalizados_estables':
            icon = icons.termometer;
            break;
        case 'hospitalizados_pronostico_reservado':
            icon = icons.ambulance;
            break;
        case 'confirmados':
            icon = icons.check;
            break;
        case 'fallecidos':
            icon = icons.frown;
            break;
        case 'sospechosos':
            icon = icons.question;
            break;
        case 'descartados':
            icon = icons.times;
            break;
        case 'recuperados':
            icon = icons.medkit;
            break;
        case 'muestras_tomadas':
            icon = icons.users;
            break;
        case 'fecha_corte':
            icon = icons.users;
            break;
        default:
            icon = icons.default;
            break;
            
    }
    return icon;
}
let lightLayer = 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}';
let darkIcon = '🌛';
let lightIcon = '☀️';
let filterDark = ['invert:100%'];
let filterLight = [];
let currentFilter = [];
let btnIcon = lightIcon;
let leafletAtribution = '&copy; <a target=_blank" href="https://www.google.com/intl/es-419_ec/help/terms_maps/">Google Maps</a>';
// let leafletAtribution = '&copy; <a href="https://www.openstreetmap.org/copyright">Gracias a OpenStreetMap</a>';
//Funciones Manejar Temas
const getThemeMode = () =>{
    const mode = localStorage.getItem('sm-mode-theme');
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
}).setView([-1.93322683, -78.70605469], 3);
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
    const mensaje = (provinceState) ? `${countryRegion} - ${provinceState}` : `${countryRegion}`;
    return (`
        <div>
          <p> <strong>${mensaje}</strong> </p>
          <p> Confirmados: ${confirmed} </p>
          <p> Muertes: ${deaths} </p>
          <p> Recuperados: ${recovered} </p>
        </div>
      `)
}
//Añador Titulo Información
// var info = L.control({position:'bottomcenter'});
// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };
// info.update = function (props) {
//     this._div.innerHTML = '<h4>Mapa Coronavirus</h4>' + '<span>A Nivel Mundial</span>';
// };
// info.addTo(map);

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
    // console.log('data', data);
    let confirmed = 0;
    let deaths = 0;
    let recovered = 0;
    for (const item of data) {
        confirmed += item.confirmed;
        deaths += item.deaths;
        recovered += item.recovered;
        if(item.lat && item.long){
            const marker = L.marker([item.lat, item.long], { icon: icon })
            .bindPopup(renderExtraData(item))
            .addTo(map);
        }
    }
    drawEstadistics({recovered, deaths, confirmed});
}

function drawEstadistics({recovered, deaths, confirmed}){
    const seccionEstadisticasContent = document.querySelector('.info-estadisticas .content-info');
    // let seccionFragmento = document.createDocumentFragment();
    // const icon = getEstadisticasIcon(prop);
    // let articulo = document.createElement("article");
    const check = 'fa fa-check-square';
    const medkit = 'fa fa-medkit';
    const frown = 'fa fa-frown-o';

    const htmlArticulo = `
    <article class="estadistica">
        <span class="icon">
            <i class="${check}" aria-hidden="true"></i>
        </span>
        <span>Confirmados</span>
        <span>${confirmed}</span>
    </article>
    <article class="estadistica">
        <span class="icon">
            <i class="${frown}" aria-hidden="true"></i>
        </span>
        <span>Fallecidos</span>
        <span>${deaths}</span>
    </article>
    <article class="estadistica">
        <span class="icon">
            <i class="${medkit}" aria-hidden="true"></i>
        </span>
        <span>Recuperados</span>
        <span>${recovered}</span>
    </article>
    `;
    seccionEstadisticasContent.innerHTML = htmlArticulo;
    // articleFragmento.appendChild(articulo);
}

//Ejecutar la función Inicial
renderData()
