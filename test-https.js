import https from 'https';

https.get('https://TG-Lion.net/api/v1?action=available_countries&apiKey=kg5yi86f4lzhje3bsa&YourID=6168111530', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log('RESPONSE:', data.substring(0, 500)));
}).on('error', (e) => console.error(e));
