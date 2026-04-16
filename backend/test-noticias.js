const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:4000/api/v1/noticias', {
      headers: { 'x-tenant': 'demo' }
    });
    console.log("NOTICIAS:", res.data);
  } catch(e) {
    console.log("ERROR:", e.response?.data || e.message);
  }
}

testApi();
