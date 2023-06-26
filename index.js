import * as geojsonDef from "./data.geojson" assert { type: "json" };
import { parse } from 'https://unpkg.com/@vanillaes/csv@3.0.1/index.js';

let csv;
let rowNames;
fetch("out.csv")
    .then(data => data.text())
    .then(data => {
        csv = parse(data);
        rowNames = csv.splice(0, 1)[0];
    });

let geojson = geojsonDef.default;

let fromSelect = document.getElementById("from");
for (let ward of geojson.features) {
    let opt = document.createElement("option");
    opt.value = ward.properties.name;
    opt.innerHTML = ward.properties.name;
    fromSelect.appendChild(opt);
}

let toSelect = document.getElementById("to");
for (let ward of geojson.features.reverse()) {
    let opt = document.createElement("option");
    opt.value = ward.properties.name;
    opt.innerHTML = ward.properties.name;
    toSelect.appendChild(opt);
}

let map = L.map('map').setView([18.5204, 73.8567], 11);
let layerGroup = L.layerGroup().addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

document.getElementById("form").addEventListener('submit', (event) => {
    event.preventDefault();

    let fromName = event.target.elements.from.value;
    let activity = event.target.elements.activity.value;
    let toName = event.target.elements.to.value;

    let fromGeojson = JSON.parse(JSON.stringify(geojson))
    fromGeojson = fromGeojson.features.filter(w => w.properties.name == fromName);

    let toGeojson = JSON.parse(JSON.stringify(geojson))
    toGeojson.features = toGeojson.features.filter(w => w.properties.name == toName);

    layerGroup.clearLayers();
    L.geoJson(fromGeojson, { onEachFeature: onEachFeature }).addTo(layerGroup);
    L.geoJson(toGeojson, { style: { color: "#00FF00" }, onEachFeature: onEachFeature }).addTo(layerGroup);

    let movement = getMovement(fromName, activity, toName);
    renderTable("movement", movement, `Movement Count: ${movement.length}`);

    renderTable("workplaces", getWardInfo(fromName, "workplaces"), `Workplaces in ${fromName}`);
    renderTable("schools", getWardInfo(fromName, "schools"), `Schools in ${fromName}`);
    renderTable("households", getWardInfo(fromName, "households"), `Households in ${fromName}`);
});

function renderTable(tableId, data, captionText) {
    let table = document.getElementById(tableId);
    table.innerHTML = "";

    let caption = document.createElement("caption");
    caption.textContent = captionText;
    table.appendChild(caption);

    let tr = table.insertRow();
    for (let col of rowNames) {
        let th = document.createElement("th");
        th.innerHTML = col;
        tr.appendChild(th);
    }

    for (let row of data) {
        let tr = table.insertRow();
        for (let col of row) {
            let td = tr.insertCell();
            td.innerHTML = col;
        }
    }
}

function getCol(row, colName) {
    return row[rowNames.indexOf(colName)];
}

function getMovement(from, activity, to) {
    let out = []
    for (let person of csv) {
        if (getCol(person, "AdminUnitName") == from) {
            if (activity == "workplaces") {
                if (getCol(person, "WorkPlaceWard") == to) {
                    out.push(person);
                }
            } else {
                if (getCol(person, "SchoolWard") == to) {
                    out.push(person);
                }
            }
        }
    }

    return out;
}

function getWardInfo(ward, activity) {
    let out = []
    for (let person of csv) {
        if (activity == "workplaces") {
            if (getCol(person, "WorkPlaceWard") == ward) {
                out.push(person);
            }
        } else if (activity == "schools") {
            if (getCol(person, "SchoolWard") == ward) {
                out.push(person);
            }
        } else {
            if (getCol(person, "HouseholdWard") == ward) {
                out.push(person);
            }
        }
    }

    return out;
}

function onEachFeature(feature, layer) {
    layer.bindPopup(`<p>${feature.properties.name}</p>`);
}