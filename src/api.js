import axios from 'axios';

// API Keys and Configuration
const READ_API_KEY = 'GTCH3LLP6CGW259Y';
const WRITE_API_KEY = '8VYWXEKFS97HPW6H';
const CHANNEL_ID = 'YOUR_CHANNEL_ID'; // Replace with your Channel ID if you want to test read

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
                results: 1,
                t: Date.now() // Prevent browser caching
            }
        });

        if (response.data && response.data.feeds && response.data.feeds.length > 0) {
            return response.data.feeds[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching ThingSpeak Data:", error);
        throw error;
    }
};

/**
 * Updates a specific field in ThingSpeak.
 * @param {number} fieldNumber - The number of the field to update (1-8).
 * @param {string|number} value - The value to update it with.
 */
export const updateThingSpeakField = async (fieldNumber, value) => {
    try {
        const response = await axios.get(WRITE_URL, {
            params: {
                api_key: WRITE_API_KEY,
                [`field${fieldNumber}`]: value,
                t: Date.now()
            }
        });

        // ThingSpeak returns '0' if the rate limit (15 seconds) is exceeded OR update fails
        if (response.data === 0) {
            throw new Error("Update rejected by ThingSpeak. Please wait 15 seconds before updating again.");
        }
        return response.data;
    } catch (error) {
        console.error(`Error updating Field ${fieldNumber}:`, error);
        throw error;
    }
};

/**
 * Updates multiple fields in a single ThingSpeak API call.
 * @param {Object} fields - Key-value pairs of fields to update, e.g., { field1: '1', field4: '1' }
 */
export const updateMultipleFields = async (fields) => {
    try {
        const params = { api_key: WRITE_API_KEY, ...fields, t: Date.now() };
        const response = await axios.get(WRITE_URL, { params });

        if (response.data === 0) {
            throw new Error("Update rejected by ThingSpeak. Please wait 15 seconds before updating again.");
        }
        return response.data;
    } catch (error) {
        console.error("Error updating multiple fields:", error);
        throw error;
    }
};
