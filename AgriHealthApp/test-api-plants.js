const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/diseases/plants',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('RESPONSE:');
    console.log(data);
    try {
      const parsed = JSON.parse(data);
      console.log('Plant diseases count:', parsed.data.length);
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
