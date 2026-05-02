fetch('https://TG-Lion.net/api?action=available_countries&apiKey=kg5yi86f4lzhje3bsa&YourID=6168111530').then(r=>r.text()).then(t=>console.log(t.substring(0,200))).catch(e=>console.error(e));
