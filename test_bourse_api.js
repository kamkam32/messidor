// Script de test simple pour l'API Bourse
const http = require('http');

async function testAPI() {
  console.log('🧪 Test de l\'API Bourse de Casablanca\n');
  console.log('URL: http://localhost:3002/api/bourse?type=quote\n');

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/bourse?type=quote',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('\n📊 Réponse de l\'API:\n');

      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));

        if (json.success && json.data) {
          console.log('\n✅ API fonctionne correctement !');
          console.log('\n📈 Données récupérées:');
          console.log(`   - Indice MASI: ${json.data.indexValue}`);
          console.log(`   - Variation: ${json.data.variationPercent}%`);
        }
      } catch (e) {
        console.log('Réponse brute:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur:', error.message);
  });

  req.end();
}

testAPI();
