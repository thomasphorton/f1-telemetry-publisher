# F1 Telemetry Publisher
This application reads data published from the EA Sports F1 '22 game and publishes it to Ably, a realtime messaging API. Another package ([F1 Telemetry Extension](https://github.com/thomasphorton/f1-telemetry-extension)) acts as a subscriber to this data, and presents a 'second screen' experience for anyone watching the gameplay.

## Using this Repository
1. Create an auth file
`cp ./auth.js.example ./auth.js`
2. Update the new auth.js file with your Ably API key
3. Run the lap replay `node replay.js` to publish sample data to Ably
4. If that is working properly, try listening to game events with `node publisher.js`

## Files
Rough shape, but a few things going on here:

### publisher.js
Starts a UDP server to listen to vehicle telemetry and republish it to Ably.

### subscriber.js
Creates an Ably listener client. Used for testing.

### record-lap.js
Starts a UDP server to listen to vehicle telemetry and save it in `./laps/{lapNumber}.json`. Used for development, so you don't have to keep playing the game.

### replay.js
Reads lap telemetry from `record-lap.js` and publishes it to Ably.

### telemetry.js
Not used right now- work in progress for local event processing before sending to Ably.