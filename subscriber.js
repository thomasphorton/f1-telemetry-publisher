import Ably from "ably";
import auth from "./auth.js";

let client = new Ably.Realtime({ key: auth.ablyKey });

client.connection.on('connected', () => {
    console.log('Ably client connected (subscriber.js)');
})

let channel = client.channels.get('f1-telemetry');

channel.subscribe(function (message) {
    console.log(message.data);
});