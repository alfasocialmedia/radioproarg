const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/radios/config',
    method: 'GET',
    headers: {
        'x-tenant': 'onradio2'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('--- API Response ---');
            console.log('tituloNoticias:', json.tituloNoticias);
            console.log('Full JSON Keys:', Object.keys(json));
            if (json.tituloNoticias !== undefined) {
                console.log('✅ TEST PASSED: tituloNoticias is present.');
            } else {
                console.log('❌ TEST FAILED: tituloNoticias is missing.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
