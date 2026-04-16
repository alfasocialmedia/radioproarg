const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign(
  { id: 'c90ce86f-23be-4cbf-a1dd-24af1cd5ca71', radioId: 'demo', rol: 'ADMIN_RADIO' },
  'DEV_SECRET_CHANGE_ME',
  { expiresIn: '1h' }
);

const data = JSON.stringify({
  nombrePrograma: 'Test Update',
  diaSemana: 1,
  horaInicio: '08:00',
  horaFin: '10:00'
});

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/programacion/8eb5c3f0-4a6a-4f48-84d0-8153f8cc1724',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer ' + token,
    'X-Tenant-Id': 'demo' // Simulate frontend interceptor
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', e => console.error('REQUEST ERROR:', e));
req.write(data);
req.end();
