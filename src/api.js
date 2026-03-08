import axios from 'axios';

// API Keys and Configuration
const READ_API_KEY = 'GTCH3LLP6CGW259Y';
const WRITE_API_KEY = '8VYWXEKFS97HPW6H';
const CHANNEL_ID = '3290781'; // Replace with your Channel ID if you want to test read

// Base URLs
const READ_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json`;
const WRITE_URL = `https://api.thingspeak.com/update`;

/**
 * Fetches the latest data from ThingSpeak.
 * If mapping to a single result, we get feeds[0].
 */
export const fetchThingSpeakData = async () => {
    try {
        const response = await axios.get(READ_URL, {
            params: {
                api_key: READ_API_KEY,
                results: 50, // Fetch the last 50 entries to scan for the latest non-null value of each field
                t: Date.now() // Prevent browser caching
            }
        });

        if (response.data && response.data.feeds && response.data.feeds.length > 0) {
            const mergedData = {};
            const feeds = response.data.feeds;

            // Scan backwards from the newest entry to the oldest
            for (let i = feeds.length - 1; i >= 0; i--) {
                const feed = feeds[i];
                for (let j = 1; j <= 8; j++) {
                    const fieldKey = `field${j}`;
                    if (mergedData[fieldKey] === undefined && feed[fieldKey] !== null && feed[fieldKey] !== undefined) {
                        mergedData[fieldKey] = feed[fieldKey];
                    }
                }
            }
            return mergedData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching ThingSpeak Data:", error);
        throw error;
    }
};

let lastUpdateTime = 0;
let updateBuffer = {};
let resolveQueue = [];
let rejectQueue = [];
let updateTimeout = null;

const THINGSPEAK_RATE_LIMIT_MS = 15500; // 15 seconds + small padding

/**
 * Updates a specific field in ThingSpeak using the debounced global queue.
 */
export const updateThingSpeakField = (fieldNumber, value) => {
    return queueThingSpeakUpdate({ [`field${fieldNumber}`]: value });
};

/**
 * Updates multiple fields using the debounced global queue.
 */
export const updateMultipleFields = (fields) => {
    return queueThingSpeakUpdate(fields);
};

/**
 * Queues updates and respects ThingSpeak's strict 15-second rate limit.
 * All requested field updates inside the 15-second window are batched 
 * into a single physical API call right when the window opens.
 */
const queueThingSpeakUpdate = (fields) => {
    return new Promise((resolve, reject) => {
        // Overlay the new fields into the active buffer
        updateBuffer = { ...updateBuffer, ...fields };

        // Push the callbacks so everyone gets notified simultaneously when hit completes!
        resolveQueue.push(resolve);
        rejectQueue.push(reject);

        if (!updateTimeout) {
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTime;
            // Next window opens exactly when the rate limit expires
            const delay = Math.max(0, THINGSPEAK_RATE_LIMIT_MS - timeSinceLastUpdate);

            updateTimeout = setTimeout(async () => {
                const fieldsToSend = { ...updateBuffer };
                const resolvers = resolveQueue;
                const rejecters = rejectQueue;

                // Clear state for next batches
                updateBuffer = {};
                resolveQueue = [];
                rejectQueue = [];
                updateTimeout = null;

                try {
                    const params = { api_key: WRITE_API_KEY, ...fieldsToSend, t: Date.now() };
                    const response = await axios.get(WRITE_URL, { params });

                    if (response.data === 0) {
                        // Rare edge-case: we hit it somehow too early, ThingSpeak rejects.
                        throw new Error("Update rejected by ThingSpeak. Ensure 15s between pushes.");
                    }

                    // Stamp successful run
                    lastUpdateTime = Date.now();
                    resolvers.forEach(r => r(response.data));
                } catch (error) {
                    console.error("Error executing queued ThingSpeak batch:", error);
                    rejecters.forEach(r => r(error));
                }
            }, delay);
        }
    });
};
