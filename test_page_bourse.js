// Script de test de la page Bourse
const http = require('http');

async function testPage() {
  console.log('🧪 Test de la page Bourse\n');
  console.log('URL: http://localhost:3004/bourse\n');

  const options = {
    hostname: 'localhost',
    port: 3004,
    path: '/bourse',
    method: 'GET',
    headers: {
      'Accept': 'text/html'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);

    if (res.statusCode === 200) {
      console.log('\n✅ Page chargée avec succès !');
      console.log('\n🌐 Ouvrez votre navigateur:');
      console.log('   http://localhost:3004/bourse');
    } else {
      console.log('\n❌ Erreur:', res.statusCode);
    }

    res.on('data', () => {});
    res.on('end', () => {});
  });

  req.on('error', (error) => {
    console.error('❌ Erreur:', error.message);
  });

  req.end();
}

testPage();
