const TELEKOS_API_KEY = "telekos_a8b55bc4a8ffd03d72916ded77c96ee42c4589ea";
const TELEKOS_BASE_URL = "https://api.telekos.my.id";
const TELEKOS_HEADERS = { "x-api-key": TELEKOS_API_KEY, "Content-Type": "application/json" };

async function test() {
  const fetch = (await import('node-fetch')).default;
  try {
    const url = `${TELEKOS_BASE_URL}/api/services?country=6`;
    const response = await fetch(url, { headers: TELEKOS_HEADERS });
    const data = await response.json();
    console.log("Response Keys:", Object.keys(data));
    if (data.ok && data.services) {
      console.log("Number of services:", data.services.length);
      // Let's print a few services, specifically "wa" or any service with multiple entries
      const waServices = data.services.filter(s => s.code === "wa" || s.name.toLowerCase().includes("whatsapp"));
      console.log("WhatsApp services:", JSON.stringify(waServices, null, 2));

      // Let's print some other ones too
      console.log("First 3 services:", JSON.stringify(data.services.slice(0, 3), null, 2));
    } else {
      console.log("Failed to fetch or bad data:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
