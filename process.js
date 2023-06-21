import { readFileSync, writeFileSync } from "fs";
import { geoContains } from "d3-geo";
import { parse, stringify } from '@vanillaes/csv'

let geojson = JSON.parse(readFileSync("data.geojson", { encoding: 'UTF-8' }));
let wardToGeometry = {};
for (let ward of geojson.features) {
    wardToGeometry[ward.properties.name] = ward.geometry;
}

let csv = parse(readFileSync("in.csv", { encoding: 'UTF-8' }));
let rowNames = csv.splice(0, 1)[0];
rowNames.push("SchoolWard", "WorkPlaceWard", "HouseholdWard");

for (let person of csv) {
    person.push(locToWard(
        getCol(person, "school_id"),
        getCol(person, "school_lat"),
        getCol(person, "school_long"),
    ));

    person.push(locToWard(
        getCol(person, "WorkPlaceID"),
        getCol(person, "W_Lat"),
        getCol(person, "W_Lon"),
    ));

    person.push(locToWard(
        getCol(person, "HHID"),
        getCol(person, "H_Lat"),
        getCol(person, "H_Lon"),
    ));
}

csv.unshift(rowNames);
writeFileSync("out.csv", stringify(csv)), { encoding: 'UTF-8' };

function getCol(row, colName) {
    return row[rowNames.indexOf(colName)];
}

function locToWard(id, lat, long) {
    if (id == 0) {
        return "";
    }

    for (let [name, geometry] of Object.entries(wardToGeometry)) {
        if (geoContains(geometry, [long, lat])) {
            return name;
        }
    }

    console.error(`Coordinates not in a ward: (${lat}, ${long})`);
    return "";
}