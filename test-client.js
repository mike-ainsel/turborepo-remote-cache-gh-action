import fetch from 'node-fetch';

const TURBO_API = 'http://localhost:9090';
const TURBO_TOKEN = 'b2c7602c6296ec41c5c59382978db83bd004a5b157d934a3a56430197484f1d6';
const TURBO_TEAM = 'citest';

async function testServer() {
  try {
    // Test server health
    const healthResponse = await fetch(`${TURBO_API}/health`);
    console.log('Health check response:', await healthResponse.text());

    // Test cache endpoint
    const cacheResponse = await fetch(`${TURBO_API}/v8/artifacts/test-key?team=${TURBO_TEAM}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TURBO_TOKEN}`,
        'Content-Type': 'application/octet-stream'
      },
      body: 'test-data'
    });
    console.log('Cache PUT response:', cacheResponse.status);

    // Test cache retrieval
    const getResponse = await fetch(`${TURBO_API}/v8/artifacts/test-key?team=${TURBO_TEAM}`, {
      headers: {
        'Authorization': `Bearer ${TURBO_TOKEN}`
      }
    });
    console.log('Cache GET response:', getResponse.status);
    if (getResponse.ok) {
      const data = await getResponse.text();
      console.log('Retrieved data:', data);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testServer(); 