const https = require('https');
https.get('https://unsplash.com/s/photos/pride-flag', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/href="\/photos\/([^"]+)"/);
    if (match) console.log("ID:", match[1]);
  });
}).on('error', (err) => console.log("Error:", err.message));
