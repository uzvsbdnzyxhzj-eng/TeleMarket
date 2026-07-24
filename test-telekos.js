const fetch = require('node-fetch');

const TELEKOS_API_KEY = "telekos_a8b55bc4a8ffd03d72916ded77c96ee42c4589ea";
const TELEKOS_BASE_URL = "https://api.telekos.my.id";
const TELEKOS_HEADERS = { "x-api-key": TELEKOS_API_KEY, "Content-Type": "application/json" };

async function test() {
  try {
    console.log("Fetching services for country 6 (Indonesia)...");
    const response = await fetch(`${TELEKOS_BASE_URL}/api/services?country=6`, { headers: TELEKOS_HEADERS });
    const data = await response.json();
    console.log("Response keys:", Object.keys(data));
    console.log("Sample service:", JSON.stringify(data.services ? data.services.slice(0, 3) : [], null, 2));
    
    // Let's also check if there's any other endpoint or if a service has nested providers
    if (data.services && data.services.length > 0) {
      console.log("Fields in service object:", Object.keys(data.services[0]));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
