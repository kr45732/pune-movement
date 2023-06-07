import { readFileSync, writeFileSync } from "fs";
import { geoContains } from "d3-geo";

let geojson = JSON.parse(readFileSync("data.geojson", { encoding: 'UTF-8' }))
let wardToGeometry = {}
for (let ward of geojson.features) {
    wardToGeometry[ward.properties.name] = ward.geometry;
}

let csv = parseCSV("data.csv");
let rowNames = csv.splice(0, 1)[0];
let wardsData = {}

for (let person of csv) {
    let wardName = getCol(person, "AdminUnitName");
    if (!wardsData[wardName]) {
        wardsData[wardName] = {
            "households": [],
            "schools": [],
            "workplaces": []
        };
    }

    let wardData = wardsData[wardName];

    let schoolId = getCol(person, "school_id")
    if (schoolId != 0) {
        wardData["schools"].push(
            locToWard(
                schoolId,
                getCol(person, "school_lat"),
                getCol(person, "school_long"),
            ))
    }

    let workplaceId = getCol(person, "WorkPlaceID")
    if (workplaceId != 0) {
        wardData["workplaces"].push(
            locToWard(
                workplaceId,
                getCol(person, "W_Lat"),
                getCol(person, "W_Lon"),
            ))
    }

    let householdId = getCol(person, "HHID")
    if (householdId != 0) {
        wardData["households"].push(
            locToWard(
                householdId,
                getCol(person, "H_Lat"),
                getCol(person, "H_Lon"),
            ))
    }
}

writeFileSync("wards_data.json", JSON.stringify(wardsData));

function getCol(row, colName) {
    return row[rowNames.indexOf(colName)];
}

function locToWard(id, lat, long) {
    for (let [name, geometry] of Object.entries(wardToGeometry)) {
        if (geoContains(geometry, [long, lat])) {
            return name;
        }
    }

    console.error(`Coordinates not in a ward: (${lat}, ${long})`);
    return undefined;
}

function parseCSV(path) {
    let str = readFileSync("data.csv", { encoding: 'UTF-8' });
    const arr = [];
    let quote = false;

    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }

    return arr;
}