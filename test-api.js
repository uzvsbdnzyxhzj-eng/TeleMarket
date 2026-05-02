fetch('https://TG-Lion.net?action=available_countries&apiKey=kg5yi86f4lzhje3bsa&YourID=6168111530')
  .then(res => res.text())
  .then(text => console.log('TG-Lion API Response:', text.substring(0, 100)))
  .catch(err => console.error('TG-Lion Error:', err.message));
