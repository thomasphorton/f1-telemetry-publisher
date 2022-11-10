import { F122UDP } from "f1-22-udp";
import fs from "fs";

let recording = false;
let currentLap = 0;

let laps = {};
let playerCarIdx;

const f122 = new F122UDP({address: '0.0.0.0', port: '20777'});
f122.start();

f122.on('lapData', function(data) {
    playerCarIdx = data.m_header.m_playerCarIndex;
    let lapData = data.m_lapData[playerCarIdx];

    console.log(lapData.m_currentLapNum);

    if (currentLap != lapData.m_currentLapNum) {
        console.log('new lap');

        if (!laps[currentLap]) {
            laps[currentLap] = [];
        }

        fs.writeFileSync(`./laps/${currentLap}.json`, JSON.stringify(laps[currentLap], null, 2));

        currentLap = lapData.m_currentLapNum;
    }

})

f122.on('carTelemetry', (data) => {
    let carTelemetry = data.m_carTelemetryData[playerCarIdx];

    if (!laps[currentLap]) {
        laps[currentLap] = [carTelemetry];
    }
    else {
        laps[currentLap].push(carTelemetry);
    }
})