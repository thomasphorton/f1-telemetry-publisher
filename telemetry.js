import Ably from "ably";
import { F122UDP } from "f1-22-udp";
import auth from "./auth.js";
/*
*   'port' is optional, defaults to 20777
*   'address' is optional, defaults to localhost, in certain cases you may need to set address explicitly
*/

let client = new Ably.Realtime({ key: auth.ablyKey })
client.connection.on('connected', () => {
    // console.log('ably client connected');
})

let channel = client.channels.get('f1-telemetry');

const f122 = new F122UDP({address: '0.0.0.0', port: '20777'});
f122.start();
console.log('telemetry.js started');
// motion 0
// f122.on('carTelemetry',function(data) {
//     let playerCarIdx = data.m_header.m_playerCarIndex;
//     let playerCarTelemetry = data.m_carTelemetryData[playerCarIdx];

//     channel.publish('playerCarTelemetry', playerCarTelemetry, (err) => {
//         if (err) {
//             console.log(err)
//         }
//     })
// })

const laps = [];

let currentLap = 0;

let lapDataTemplate = {
    s1: 0,
    s2: 0,
    s3: 0
}

let fastestSectors = {
    s1: {
        lap: 0
    },
    s2: {
        lap: 0
    },
    s3: {
        lap: 0
    }
}

f122.on('lapData', function(data) {
    let playerCarIdx = data.m_header.m_playerCarIndex;
    let lapData = data.m_lapData[playerCarIdx];

    // console.log(lapData.m_currentLapNum)

    if (lapData.m_currentLapNum !== 0) {

        // compare provided data to local lap data to see if a new lap has started
        if (lapData.m_currentLapNum != currentLap) {

            laps[currentLap] = lapDataTemplate;

            if (lapData.m_lastLapTimeInMS !== 0) {
                // calculate sector 3 time
                // last lap - sector 1 - sector 2
                let lastLapTime = lapData.m_lastLapTimeInMS;
                let lastS1Time = laps[currentLap].s1;
                let lastS2Time = laps[currentLap].s2;

                let sector3Time = lastLapTime - (lastS1Time + lastS2Time);

                laps[currentLap].s3 = sector3Time;

                console.log(`Lap ${currentLap} Sector 3 completed: ${sector3Time}`);

                if (!fastestSectors['s3'].time || sector3Time < fastestSectors['s3'].time) {
                
                    // emit fastest sector event
                    console.log(`New fastest Sector 3 for the Session!`)
                    fastestSectors['s3'] = {
                        time: sector3Time,
                        lap: currentLap
                    }
                }

                // emit lap completion event
                console.log(`Lap #${currentLap} completed: ${lastLapTime}`);    
            }
            
            currentLap = lapData.m_currentLapNum;
            laps[currentLap] = lapDataTemplate;
        }


        let sector1Time = lapData.m_sector1TimeInMS;

        if (sector1Time !== 0 && sector1Time != laps[currentLap].s1) {
            
            // emit sector completed event
            console.log(`Lap ${currentLap} Sector 1 completed: ${sector1Time}`);
            laps[currentLap].s1 = sector1Time;

            if (!fastestSectors['s1'].time || sector1Time < fastestSectors['s1'].time) {
                
                // emit fastest sector event
                console.log(`New fastest Sector 1 for the Session!`)
                fastestSectors['s1'] = {
                    time: sector1Time,
                    lap: currentLap
                }
            }
        }

        let sector2Time = lapData.m_sector2TimeInMS;
        if (sector2Time !== 0 && sector2Time != laps[currentLap].s2) {
            
            // emit sector completed event
            console.log(`Lap ${currentLap} Sector 2 completed: ${sector2Time}`);
            laps[currentLap].s2 = sector2Time;

            if (!fastestSectors['s2'].time || sector2Time < fastestSectors['s2'].time) {
                
                // emit fastest sector event
                console.log(`New fastest Sector 2 for the Session!`)
                fastestSectors['s2'] = {
                    time: sector2Time,
                    lap: currentLap
                }
            }
        }

    }

})

let ablyPublisher = setInterval(() => {
    // channel.publish('lapData', lapData, (err) => {
    //     console.log('tick');
    //     if (err) {
    //         console.log(err)
    //     }
    // })
}, 1000)



console.log('started');

