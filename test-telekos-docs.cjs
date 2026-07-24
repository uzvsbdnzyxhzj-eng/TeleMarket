async function test() {
  const fetch = (await import('node-fetch')).default;
  try {
    const urls = [
      "https://api.telekos.my.id/",
      "https://api.telekos.my.id/docs",
      "https://api.telekos.my.id/api/docs"
    ];
    for (const url of urls) {
      console.log(`\n--- Fetching URL: ${url} ---`);
      const res = await fetch(url);
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(text.substring(0, 1000));
    }
  } catch (err) {
    console.error(err);
  }
}
test();
