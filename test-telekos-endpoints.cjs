const TELEKOS_API_KEY = "telekos_a8b55bc4a8ffd03d72916ded77c96ee42c4589ea";
const TELEKOS_BASE_URL = "https://api.telekos.my.id";
const TELEKOS_HEADERS = { "x-api-key": TELEKOS_API_KEY, "Content-Type": "application/json" };

async function test() {
  const fetch = (await import('node-fetch')).default;
  
  const endpoints = [
    "/api/operators",
    "/api/providers",
    "/api/services?country=6&service=wa",
    "/api/services?country=6&code=wa",
    "/api/get-providers?country=6&service=wa",
    "/api/operators?country=6",
    "/api/providers?country=6",
    "/api/services?country=6"
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n--- Fetching ${endpoint} ---`);
      const response = await fetch(`${TELEKOS_BASE_URL}${endpoint}`, { headers: TELEKOS_HEADERS });
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Success keys:`, Object.keys(data));
        if (endpoint.includes("services?country=6&")) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(JSON.stringify(data).substring(0, 300));
        }
      } else {
        const text = await response.text();
        console.log(`Failed text:`, text.substring(0, 150));
      }
    } catch (err) {
      console.error(`Error for ${endpoint}:`, err);
    }
  }
}

test();
