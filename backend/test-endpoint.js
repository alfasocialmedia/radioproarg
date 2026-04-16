const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/radios/config',
    method: 'GET',
    headers: {
        'X-Tenant-Id': 'demo'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
