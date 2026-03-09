import axios from 'axios';

// ─── Old Channel: Switches + Dimmers (read & write) ────────────────────────
const CONTROLS_READ_KEY = 'GTCH3LLP6CGW259Y';
const CONTROLS_WRITE_KEY = '8VYWXEKFS97HPW6H';
const CONTROLS_CHANNEL = '3290781';

// ─── New Channel: Sensors only (read only) ──────────────────────────────────
const SENSORS_READ_KEY = 'HQIR90WJOABFWYAK';
const SENSORS_CHANNEL = '3292146';

const CONTROLS_READ_URL = `https://api.thingspeak.com/channels/${CONTROLS_CHANNEL}/feeds.json`;
const SENSORS_READ_URL = `https://api.thingspeak.com/channels/${SENSORS_CHANNEL}/feeds.json`;
const WRITE_URL = `https://api.thingspeak.com/update`;

// ─── Fetch control state (switches + dimmer) from OLD channel ───────────────
// Returns: { field1..field6 } or {} on empty, throws on network error
export const fetchThingSpeakData = async () => {
    try {
        const response = await axios.get(CONTROLS_READ_URL, {
            params: {
                api_key: CONTROLS_READ_KEY,
                results: 50,   // scan last 50 to get latest non-null per field
                t: Date.now()  // bust cache
            }
        });

        if (response.data && response.data.feeds) {
            const feeds = response.data.feeds;
            if (feeds.length === 0) return {}; // channel reachable, no data yet

            const mergedData = {};
            for (let i = feeds.length - 1; i >= 0; i--) {
                const feed = feeds[i];
                for (let j = 1; j <= 6; j++) {
                    const key = `field${j}`;
                    if (mergedData[key] === undefined && feed[key] != null) {
                        mergedData[key] = feed[key];
                    }
                }
            }
            return mergedData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching control data:', error);
        throw error;
    }
};

// ─── Fetch sensor readings from NEW channel (field1=LDR, field2=Motion) ─────
// Returns: { field1, field2 } or {} on empty, throws on network error
export const fetchSensorData = async () => {
    try {
        const response = await axios.get(SENSORS_READ_URL, {
            params: {
                api_key: SENSORS_READ_KEY,
                results: 10,
                t: Date.now()
            }
        });

        if (response.data && response.data.feeds) {
            const feeds = response.data.feeds;
            if (feeds.length === 0) return {};

            // Grab the most recent non-null value for field1 and field2 only
            const sensorData = {};
            for (let i = feeds.length - 1; i >= 0; i--) {
                const feed = feeds[i];
                if (sensorData.field1 === undefined && feed.field1 != null) sensorData.field1 = feed.field1;
                if (sensorData.field2 === undefined && feed.field2 != null) sensorData.field2 = feed.field2;
                if (sensorData.field1 !== undefined && sensorData.field2 !== undefined) break;
            }
            return sensorData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Don't let sensor errors crash the whole dashboard
        return {};
    }
};

// ─── Write queue — respects ThingSpeak's 15s rate limit ─────────────────────
// All writes go to the OLD (controls) channel

let lastUpdateTime = 0;
let updateBuffer = {};
let resolveQueue = [];
let rejectQueue = [];
let updateTimeout = null;

const THINGSPEAK_RATE_LIMIT_MS = 15500;

export const updateThingSpeakField = (fieldNumber, value) =>
    queueThingSpeakUpdate({ [`field${fieldNumber}`]: value });

export const updateMultipleFields = (fields) =>
    queueThingSpeakUpdate(fields);

const queueThingSpeakUpdate = (fields) => {
    return new Promise((resolve, reject) => {
        updateBuffer = { ...updateBuffer, ...fields };
        resolveQueue.push(resolve);
        rejectQueue.push(reject);

        if (!updateTimeout) {
            const delay = Math.max(0, THINGSPEAK_RATE_LIMIT_MS - (Date.now() - lastUpdateTime));

            updateTimeout = setTimeout(async () => {
                const fieldsToSend = { ...updateBuffer };
                const resolvers = resolveQueue;
                const rejecters = rejectQueue;

                updateBuffer = {};
                resolveQueue = [];
                rejectQueue = [];
                updateTimeout = null;

                try {
                    const params = { api_key: CONTROLS_WRITE_KEY, ...fieldsToSend, t: Date.now() };
                    const response = await axios.get(WRITE_URL, { params });

                    if (response.data === 0) {
                        throw new Error('Update rejected by ThingSpeak. Ensure 15s between pushes.');
                    }

                    lastUpdateTime = Date.now();
                    resolvers.forEach(r => r(response.data));
                } catch (error) {
                    console.error('Error executing queued ThingSpeak batch:', error);
                    rejecters.forEach(r => r(error));
                }
            }, delay);
        }
    });
};
