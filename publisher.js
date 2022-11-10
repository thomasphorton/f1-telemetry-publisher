import Ably from "ably";
import { F122UDP } from "f1-22-udp";
import auth from "./auth.js";

let client = new Ably.Realtime({ key: auth.ablyKey })
client.connection.on('connected', () => {
    console.log('Ably client connected (publisher.js)');
})

let channel = client.channels.get('f1-telemetry');

const f122 = new F122UDP({address: '0.0.0.0', port: '20777'});
f122.start();
console.log('F1 22 UDP listener started')

let playerCarIdx;

f122.on('lapData', function(data) {
    playerCarIdx = data.m_header.m_playerCarIndex;
})

f122.on('carTelemetry', (data) => {
    let carTelemetry = data.m_carTelemetryData[playerCarIdx];

    console.log(carTelemetry);

    channel.publish('playerCarTelemetry', carTelemetry, (err) => {
        if (err) {
            console.log(err)
        }
    })
})