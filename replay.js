import lapData from './laps/sample_lap.json' assert {type: "json"}

import Ably from "ably";
import auth from "./auth.js";

let client = new Ably.Realtime({ key: auth.ablyKey })
client.connection.on('connected', () => {
    console.log('Ably client connected (replay.js)');
})

let channel = client.channels.get('f1-telemetry');


let i = 0;

let replayPublisher = setInterval(() => {
    console.log(lapData[i]);
    channel.publish('playerCarTelemetry', lapData[i], (err) => {
        if (err) {
            console.log(err)
        }
    })
    i++;

    if (!lapData[i]) {
        clearTimeout(replayPublisher);
    }

}, 100);