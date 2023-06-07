import * as wardsDataDef from "./wards_data.json" assert { type: "json" }

let wardsData = wardsDataDef.default;

let fromSelect = document.getElementById("from");
for (let ward in wardsData) {
    var opt = document.createElement("option");
    opt.value = ward;
    opt.innerHTML = ward;
    fromSelect.appendChild(opt);
}

let toSelect = document.getElementById("to");
for (let ward in wardsData) {
    var opt = document.createElement("option");
    opt.value = ward;
    opt.innerHTML = ward;
    toSelect.appendChild(opt);
}

document.getElementById("form").addEventListener('submit', (event) => {
    event.preventDefault();

    let from = event.target.elements.from.value;
    let activity = event.target.elements.activity.value;
    let to = event.target.elements.to.value;

    let movementCount = getMovement(from, activity, to);
    document.getElementById("movement").textContent = `Movement Count: ${movementCount}`;
});


function getMovement(from, activity, to) {
    if (!wardsData[from]) {
        return `Invalid from ward: ${from}`;
    }

    if (activity != "schools" && activity != "workplaces") {
        return `Invalid activity: ${activity}`;
    }

    if (!wardsData[to]) {
        return `Invalid to ward: ${to}`;
    }

    return wardsData[from][activity].filter(ward => ward != undefined && ward == to).length;
}